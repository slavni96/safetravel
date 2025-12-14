const numberFormat = new Intl.NumberFormat('en-US')

export const formatStat = (value?: number, suffix?: string) => {
  if (value === undefined) return '—'
  const rounded = value >= 1 ? numberFormat.format(Math.round(value)) : value.toFixed(2)
  return suffix ? `${rounded} ${suffix}` : rounded
}
