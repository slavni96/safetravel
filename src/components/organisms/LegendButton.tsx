import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

import Icon from '../atoms/Icon'

const legend = [
  { color: '#34c759', label: 'Green · No visa, no e-authorization, no vaccines' },
  { color: '#0a84ff', label: 'Blue · E-authorization required, no vaccines' },
  { color: '#fbbf24', label: 'Yellow · E-authorization + vaccines required' },
  { color: '#ef4444', label: 'Red · Visa required, no vaccines' },
  { color: '#a855f7', label: 'Purple · Visa required, vaccines required' },
]

type LegendButtonProps = {
  open: boolean
  onOpen: () => void
  onClose: () => void
}

const LegendButton = ({ open, onOpen, onClose }: LegendButtonProps) => {
  const [mousePressed, setMousePressed] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? onOpen() : onClose())}>
      <Dialog.Trigger asChild>
        <button
          className={`legend-fab glass ${mousePressed ? 'pressed' : ''}`}
          onMouseDown={() => setMousePressed(true)}
          onMouseUp={() => setMousePressed(false)}
          onMouseLeave={() => setMousePressed(false)}
          aria-label="Open map legend"
        >
          <Icon name="map" className="text-lg" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay expanded" />
        <Dialog.Content className="sheet glass legend-sheet open" aria-modal="true">
          <button className="sheet__handle" aria-label="Close legend" onClick={onClose}>
            <span />
          </button>
          <div className="sheet__header">
            <div className="sheet__title">
              <p className="eyebrow">Legend</p>
              <h3>Map Colors</h3>
            </div>
          </div>
          <div className="sheet__body">
            <div className="legend__items legend-modal">
              {legend.map((item) => (
                <div className="legend__item" key={item.label}>
                  <span className="legend__swatch" style={{ background: item.color }} />
                  <span className="legend__label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default LegendButton
