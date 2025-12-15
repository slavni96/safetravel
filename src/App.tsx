import 'leaflet/dist/leaflet.css'
import './App.css'

import { useEffect, useMemo, useState } from 'react'

import CountrySheet from './components/organisms/CountrySheet'
import HeaderBar from './components/organisms/HeaderBar'
import MapView from './components/organisms/MapView'
import LegendButton from './components/organisms/LegendButton'
import PageTemplate from './components/templates/PageTemplate'
import { countries, metaByCca3, metaByName, metaByNumeric } from './data/countries'
import type { CountryFeature, Selection } from './types/country'
import type { EntryDataset, EntryResult, ColorKey } from './types/entry'

function App() {
  const [query, setQuery] = useState('')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [isSheetOpen, setSheetOpen] = useState(true)
  const [legendOpen, setLegendOpen] = useState(false)
  const [entryData, setEntryData] = useState<Record<string, EntryResult>>({})
  const [colorByIso, setColorByIso] = useState<Record<string, string>>({})
  const countryNames = useMemo(
    () => Array.from(new Set(countries.features.map((feature) => feature.properties.name))).sort(),
    [],
  )

  const findByName = (value: string) => {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return undefined

    const exact = countries.features.find(
      (feature) => feature.properties.name.toLowerCase() === normalized,
    )
    if (exact) return exact

    const metaMatch = metaByName.get(normalized)
    if (metaMatch?.ccn3) {
      const byIso = countries.features.find(
        (feature) => feature.properties.isoNumeric === String(parseInt(metaMatch.ccn3!, 10)),
      )
      if (byIso) return byIso
    }

    return countries.features.find((feature) =>
      feature.properties.name.toLowerCase().includes(normalized),
    )
  }

  const handleSelect = (feature: CountryFeature) => {
    const iso = feature.properties.isoNumeric ?? (feature.id ? String(feature.id) : undefined)
    const meta =
      (iso && metaByNumeric.get(iso)) || metaByName.get(feature.properties.name.toLowerCase())

    setSelection({ feature, meta })
    setSheetOpen(true)
  }

  const onSearch = (value: string) => {
    if (!value.trim()) return

    const match = findByName(value)
    if (!match) {
      return
    }

    handleSelect(match)
  }

  useEffect(() => {
    const loadEntryData = async () => {
      const urls = ['/data/entry-requirements.json', '/entry-requirements.json']
      for (const url of urls) {
        try {
          const res = await fetch(url)
          if (!res.ok) continue
          const data = (await res.json()) as EntryDataset
          const map: Record<string, EntryResult> = {}
          data.results.forEach((entry) => {
            const meta = metaByCca3.get(entry.cca3?.toUpperCase())
            const iso = meta?.ccn3 ? String(parseInt(meta.ccn3, 10)) : null
            if (iso) map[iso] = entry
          })
          setEntryData(map)
          const palette: Record<ColorKey, string> = {
            green: '#34c759',
            blue: '#0a84ff',
            yellow: '#fbbf24',
            red: '#ef4444',
            purple: '#a855f7',
          }
          const colorMap: Record<string, string> = {}
          Object.entries(map).forEach(([iso, entry]) => {
            const hex = entry.color && palette[entry.color as ColorKey]
            if (hex) colorMap[iso] = hex
          })
          setColorByIso(colorMap)
          return
        } catch (error) {
          console.warn('Failed to load entry data', error)
        }
      }
    }
    loadEntryData()
  }, [])

  const selectedKey =
    selection?.feature.properties.isoNumeric ??
    (selection?.feature.id ? String(selection.feature.id) : undefined)
  const selectedEntry = selectedKey ? entryData[selectedKey] : undefined

  return (
    <PageTemplate
      header={
        <HeaderBar
          query={query}
          onQueryChange={(value) => setQuery(value)}
          onSearch={onSearch}
          suggestions={countryNames}
        />
      }
      map={
        <MapView
          countries={countries}
          selected={selection}
          onSelect={handleSelect}
          colorByIso={colorByIso}
        />
      }
      sheet={
        <CountrySheet
          selection={selection}
          entryInfo={selectedEntry}
          open={isSheetOpen && Boolean(selection)}
          onClose={() => {
            setSheetOpen(false)
            setSelection(null)
          }}
        />
      }
      legend={
        <LegendButton
          onOpen={() => setLegendOpen(true)}
          open={legendOpen}
          onClose={() => setLegendOpen(false)}
        />
      }
    />
  )
}

export default App
