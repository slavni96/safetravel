import type { CountryFeature } from '../types/country'

const palette = ['#e6f0ff', '#f0f6ff', '#e7fff7', '#fff4e7', '#f3e8ff', '#eaf5ff']

export const colorForFeature = (feature: CountryFeature) => {
  const keyRaw =
    feature.properties.isoNumeric ??
    (feature.id ? String(feature.id) : undefined) ??
    feature.properties.name.length.toString()
  const key = parseInt(keyRaw, 10)
  const index = Number.isFinite(key)
    ? Math.abs(key) % palette.length
    : feature.properties.name.length % palette.length
  return palette[index]
}
