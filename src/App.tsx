import 'leaflet/dist/leaflet.css'
import './App.css'

import { useMemo, useState } from 'react'

import CountrySheet from './components/organisms/CountrySheet'
import HeaderBar from './components/organisms/HeaderBar'
import MapView from './components/organisms/MapView'
import PageTemplate from './components/templates/PageTemplate'
import { countries, metaByName, metaByNumeric } from './data/countries'
import type { CountryFeature, Selection } from './types/country'

function App() {
  const [query, setQuery] = useState('')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [isSheetOpen, setSheetOpen] = useState(true)
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
      map={<MapView countries={countries} selected={selection} onSelect={handleSelect} />}
      sheet={
        <CountrySheet
          selection={selection}
          open={isSheetOpen && Boolean(selection)}
          onClose={() => {
            setSheetOpen(false)
            setSelection(null)
          }}
        />
      }
    />
  )
}

export default App
