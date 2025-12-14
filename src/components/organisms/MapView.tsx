import L, { type Map as LeafletMap, type Path, type PathOptions } from 'leaflet'
import { useCallback, useEffect, useRef } from 'react'
import { GeoJSON, MapContainer, TileLayer, ZoomControl } from 'react-leaflet'

import { colorForFeature } from '../../utils/colors'
import type { CountriesCollection, CountryFeature, Selection } from '../../types/country'

type CountryLayerProps = {
  data: CountriesCollection
  selectedId?: string
  onSelect: (feature: CountryFeature) => void
}

const CountryLayer = ({ data, selectedId, onSelect }: CountryLayerProps) => {
  const baseStyle = useCallback(
    (feature?: CountryFeature): PathOptions => {
      const isSelected =
        selectedId &&
        (feature?.properties.isoNumeric === selectedId ||
          (feature?.id ? String(feature.id) : undefined) === selectedId)

      return {
        weight: isSelected ? 2 : 1,
        color: isSelected ? '#0a84ff' : 'rgba(49, 80, 122, 0.35)',
        fillColor: feature ? colorForFeature(feature) : '#e5edff',
        fillOpacity: isSelected ? 0.62 : 0.42,
        lineJoin: 'round',
      }
    },
    [selectedId],
  )

  return (
    <GeoJSON
      data={data}
      style={(feature) => baseStyle(feature as CountryFeature)}
      onEachFeature={(feature, layer) => {
        const typed = feature as CountryFeature
        const pathLayer = layer as Path

        pathLayer.on({
          click: () => onSelect(typed),
          mouseover: () => pathLayer.setStyle({ weight: 2, fillOpacity: 0.6 }),
          mouseout: () => pathLayer.setStyle(baseStyle(typed)),
        })
        pathLayer.bindTooltip(typed.properties.name, {
          className: 'country-tooltip',
          direction: 'auto',
        })
      }}
    />
  )
}

type MapViewProps = {
  countries: CountriesCollection
  selected?: Selection | null
  onSelect: (feature: CountryFeature) => void
}

const MapView = ({ countries, selected, onSelect }: MapViewProps) => {
  const mapRef = useRef<LeafletMap | null>(null)
  const maxBounds: L.LatLngBoundsExpression = [
    [-60, -178],
    [80, 178],
  ]

  const selectedKey =
    selected?.feature.properties.isoNumeric ??
    (selected?.feature.id ? String(selected.feature.id) : undefined)

  const focusOnSelection = useCallback(() => {
    if (!selected?.feature || !mapRef.current) return
    const map = mapRef.current
    const meta = selected.meta

    const layer = L.geoJSON(selected.feature)
    const bounds = layer.getBounds()

    if (bounds.isValid()) {
      map.flyToBounds(bounds.pad(0.15), { duration: 1, easeLinearity: 0.35 })
    } else if (meta?.latlng) {
      map.flyTo(meta.latlng, 5, { duration: 1 })
    }
  }, [selected])

  useEffect(() => {
    focusOnSelection()
  }, [focusOnSelection])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    map.setMaxBounds(maxBounds)
    const enforceBounds = () => map.panInsideBounds(maxBounds, { animate: false })
    map.on('moveend', enforceBounds)
    return () => {
      map.off('moveend', enforceBounds)
    }
  }, [])

  return (
    <div className="map-card glass">
      <div className="map-frame">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxZoom={7}
          zoomControl={false}
          scrollWheelZoom
          className="leaflet-root"
          ref={mapRef}
          maxBounds={maxBounds}
          maxBoundsViscosity={1}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap
          />
          <CountryLayer data={countries} onSelect={onSelect} selectedId={selectedKey} />
          <ZoomControl position="bottomright" />
        </MapContainer>
      </div>
    </div>
  )
}

export default MapView
