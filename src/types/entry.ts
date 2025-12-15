export type ColorKey = 'green' | 'blue' | 'yellow' | 'red' | 'purple'

export type EntryResult = {
  country: string
  cca3: string
  cca2?: string
  source?: string
  visaText?: string | null
  healthText?: string | null
  extracted?: {
    visaRequired?: boolean | null
    visaFreeDays?: number | null
    eAuthorizationRequired?: boolean | null
    vaccinesRequired?: boolean | null
  }
  color?: ColorKey | null
}

export type EntryDataset = {
  generatedAt: string
  total: number
  results: EntryResult[]
}
