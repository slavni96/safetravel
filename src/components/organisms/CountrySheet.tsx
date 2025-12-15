import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

import StatList from '../molecules/StatList'
import type { Selection } from '../../types/country'
import type { EntryResult } from '../../types/entry'
import { formatStat } from '../../utils/format'

type CountrySheetProps = {
  selection: Selection | null
  entryInfo?: EntryResult
  open: boolean
  onClose: () => void
}

type SheetMode = 'compact' | 'mid' | 'expanded'

const CountrySheet = ({ selection, entryInfo, open, onClose }: CountrySheetProps) => {
  const isOpen = open && Boolean(selection)
  const { feature, meta } = selection ?? {}
  const snapPoints: Record<SheetMode, number> = { compact: 38, mid: 52, expanded: 72 }
  const [height, setHeight] = useState(snapPoints.compact) // in vh
  const heightRef = useRef(snapPoints.compact)
  const [dragging, setDragging] = useState(false)
  const [mode, setMode] = useState<SheetMode>('compact')
  const startYRef = useRef(0)
  const startHeightRef = useRef(snapPoints.compact)
  const closeThreshold = snapPoints.compact - 6

  useEffect(() => {
    setHeight(snapPoints.compact)
    setMode('compact')
  }, [selection])

  const clampHeight = (value: number) => Math.min(78, Math.max(30, value))
  const expanded = mode === 'expanded'

  const snapForHeight = (value: number): SheetMode => {
    const entries: Array<[SheetMode, number]> = [
      ['compact', snapPoints.compact],
      ['mid', snapPoints.mid],
      ['expanded', snapPoints.expanded],
    ]
    return entries.reduce((closest, current) =>
      Math.abs(current[1] - value) < Math.abs(closest[1] - value) ? current : closest,
    )[0]
  }

  const setHeightValue = (value: number) => {
    heightRef.current = value
    setHeight(value)
  }

  const stats = [
    { label: 'Capital', value: meta?.capital?.[0] ?? 'Not listed' },
    { label: 'Region', value: `${meta?.region ?? '—'}${meta?.subregion ? ` · ${meta.subregion}` : ''}` },
    { label: 'Population', value: formatStat(meta?.population) },
    { label: 'Area', value: formatStat(meta?.area, 'km²') },
    {
      label: 'Coordinates',
      value: meta?.latlng ? `${meta.latlng[0].toFixed(2)}°, ${meta.latlng[1].toFixed(2)}°` : '—',
    },
  ]

  if (!selection) return null

  const handleDirection = dragging
    ? height > startHeightRef.current + 1
      ? 'up'
      : height < startHeightRef.current - 1
      ? 'down'
      : 'neutral'
    : 'neutral'

  const onHandlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    startYRef.current = event.clientY
    startHeightRef.current = height
    setDragging(true)

    const handleMove = (moveEvent: PointerEvent) => {
      const deltaY = startYRef.current - moveEvent.clientY
      const vhDelta = (deltaY / window.innerHeight) * 100
      const nextHeight = clampHeight(startHeightRef.current + vhDelta)
      if (nextHeight <= closeThreshold) {
        setDragging(false)
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.removeEventListener('pointercancel', handleUp)
        onClose()
        return
      }
      setMode(snapForHeight(nextHeight))
      setHeightValue(nextHeight)
    }

    const handleUp = () => {
      setDragging(false)
      const currentHeight = heightRef.current
      if (currentHeight <= closeThreshold) {
        onClose()
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.removeEventListener('pointercancel', handleUp)
        return
      }
      const nearest = snapForHeight(currentHeight)
      setMode(nearest)
      setHeightValue(snapPoints[nearest])

      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`sheet-overlay ${dragging ? snapForHeight(heightRef.current) : mode}`}
        />
        <Dialog.Content
          className={`sheet glass ${isOpen ? 'open' : ''} ${mode} ${
            dragging ? 'dragging' : ''
          }`}
          aria-modal="true"
          style={{ height: `${height}vh` }}
        >
          <button
            className="sheet__handle"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
            onPointerDown={onHandlePointerDown}
          >
            <span data-direction={handleDirection} />
          </button>
          <div className="sheet__header">
            <div className="sheet__title">
              <p className="eyebrow">Country</p>
              <div className="sheet__title-row">
                {(() => {
                  const imgSrc =
                    meta?.flags?.svg ??
                    meta?.flags?.png ??
                    (meta?.cca2 ? `https://flagcdn.com/w40/${meta.cca2.toLowerCase()}.png` : undefined)
                  if (imgSrc) {
                    return (
                      <img
                        src={imgSrc}
                        alt={meta?.flags?.alt ?? `${feature?.properties.name} flag`}
                        className="flag"
                      />
                    )
                  }
                  if (meta?.flag) {
                    return <span className="flag flag-emoji">{meta.flag}</span>
                  }
                  return null
                })()}
                <h3>{feature?.properties.name}</h3>
              </div>
            </div>
          </div>

          <div className="sheet__body">
            {entryInfo ? (
              <div className="entry-summary">
                <div className="entry-source">
                  <span
                    className="entry-dot"
                    style={{ background: entryInfo.color ? entryInfo.color : '#9ca3af' }}
                  />
                  <span>Source</span>
                  {entryInfo.source ? (
                    <a href={entryInfo.source} target="_blank" rel="noreferrer">
                      {entryInfo.source}
                    </a>
                  ) : (
                    <span>Unavailable</span>
                  )}
                </div>
                {entryInfo.visaText ? (
                  <div className="entry-block">
                    <p className="eyebrow">Visa / Entry</p>
                    <p className="entry-text">{entryInfo.visaText}</p>
                  </div>
                ) : null}
                {entryInfo.healthText ? (
                  <div className="entry-block">
                    <p className="eyebrow">Health / Vaccines</p>
                    <p className="entry-text">{entryInfo.healthText}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
            <StatList items={stats} />
            <p className="note">Pan, zoom, and tap any country to spotlight it on the map.</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default CountrySheet
