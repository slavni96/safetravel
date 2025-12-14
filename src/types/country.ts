import type { Feature, FeatureCollection, Geometry } from 'geojson'

export type CountryFeature = Feature<Geometry, { name: string; isoNumeric?: string }>
export type CountriesCollection = FeatureCollection<
  Geometry,
  { name: string; isoNumeric?: string }
>

export type CountryMeta = {
  name: { common: string; official: string }
  cca2?: string
  ccn3?: string
  capital?: string[]
  region?: string
  subregion?: string
  population?: number
  area?: number
  latlng?: [number, number]
  flags?: { svg?: string; png?: string; alt?: string }
  flag?: string
}

export type Selection = {
  feature: CountryFeature
  meta?: CountryMeta
}
