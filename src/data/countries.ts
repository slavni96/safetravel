import { feature as topojsonFeature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import countriesDataset from 'world-countries'
import worldData from 'world-atlas/countries-110m.json'

import type { CountriesCollection, CountryMeta } from '../types/country'

type Position = [number, number]

const ringArea = (ring: Position[]) => {
  let sum = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum / 2)
}

const polygonArea = (coords: Position[][]) => {
  if (!coords.length) return 0
  const outer = ringArea(coords[0])
  const holes = coords.slice(1).reduce((acc, ring) => acc + ringArea(ring), 0)
  return Math.max(outer - holes, 0)
}

const normalizeGeometry = (geometry: any) => {
  if (!geometry || geometry.type !== 'MultiPolygon') return geometry

  const polys = geometry.coordinates as Position[][][]
  if (!Array.isArray(polys) || polys.length === 0) return geometry

  const largest = polys.reduce(
    (best, current) => {
      const area = polygonArea(current)
      return area > best.area ? { coords: current, area } : best
    },
    { coords: polys[0], area: polygonArea(polys[0]) },
  )

  return {
    type: 'Polygon',
    coordinates: largest.coords,
  }
}

const atlas = worldData as unknown as Topology
const countriesObject = (atlas.objects as Record<string, unknown>).countries as unknown
const rawCollection = topojsonFeature(
  atlas as any,
  countriesObject as any,
) as unknown as CountriesCollection

const countries: CountriesCollection = {
  ...rawCollection,
  features: rawCollection.features.map((feature) => ({
    ...feature,
    id: feature.id ?? feature.properties.name,
    geometry: normalizeGeometry(feature.geometry),
    properties: {
      ...feature.properties,
      isoNumeric:
        feature.properties.isoNumeric ??
        (feature.id ? String(parseInt(String(feature.id), 10)) : undefined),
    },
  })),
}

const metaByNumeric = new Map<string, CountryMeta>()
const metaByName = new Map<string, CountryMeta>()
;(countriesDataset as CountryMeta[]).forEach((country) => {
  if (country.ccn3) {
    metaByNumeric.set(String(parseInt(country.ccn3, 10)), country)
  }
  metaByName.set(country.name.common.toLowerCase(), country)
  metaByName.set(country.name.official.toLowerCase(), country)
})

export { countries, metaByName, metaByNumeric }
