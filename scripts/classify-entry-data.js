#!/usr/bin/env node
/**
 * Classify entry requirements by color based on visa/e-authorization/vaccine rules.
 * Optionally infers booleans from raw text when extracted fields are null.
 *
 * Usage:
 *  node scripts/classify-entry-data.js [--input=path] [--output=path] [--dry]
 *
 * Default input: data/entry-requirements.json
 * Default output: overwrite input (unless --dry, then prints to stdout)
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultInput = path.join(__dirname, '../data/entry-requirements.json')

const argv = process.argv.slice(2)
const inputArg = argv.find((a) => a.startsWith('--input='))?.split('=')[1]
const outputArg = argv.find((a) => a.startsWith('--output='))?.split('=')[1]
const dryRun = argv.includes('--dry')

const INPUT = inputArg ? path.resolve(inputArg) : defaultInput
const OUTPUT = dryRun ? null : outputArg ? path.resolve(outputArg) : INPUT

const normalizeBool = (value) => {
  if (value === true) return true
  if (value === false) return false
  return null
}

const inferVisa = (text) => {
  if (!text) return null
  const lower = text.toLowerCase()
  if (/(non|no) (?:è|e') (?:necessario|richiesto) il visto/.test(lower)) return false
  if (/senza visto/.test(lower)) return false
  if (/visto/.test(lower)) return true
  return null
}

const inferVisaDays = (text) => {
  if (!text) return null
  const match = text.match(/(\d{1,3})\s*(?:giorni|g)\b/i)
  if (match) return Number(match[1])
  return null
}

const inferEAuth = (text) => {
  if (!text) return null
  const lower = text.toLowerCase()
  if (/esta\b|eta\b|e-?visa|autorizzazione elettronica|valic[io] elettronic/i.test(lower)) return true
  return null
}

const inferVaccines = (text) => {
  if (!text) return null
  const lower = text.toLowerCase()
  if (/nessuna/.test(lower) || /non obbligatorie?/.test(lower)) return false
  if (/obbligatorie?|required/.test(lower)) return true
  return null
}

const computeColor = ({ visaRequired, eAuth, vaccinesRequired }) => {
  if (visaRequired === true) {
    return vaccinesRequired === true ? 'purple' : 'red'
  }
  if (visaRequired === false) {
    if (eAuth === true) {
      return vaccinesRequired === true ? 'yellow' : 'blue'
    }
    if (vaccinesRequired === false || vaccinesRequired === null) return 'green'
  }
  if (eAuth === true) {
    return vaccinesRequired === true ? 'yellow' : 'blue'
  }
  if (visaRequired === null && eAuth === null && vaccinesRequired === false) return 'green'
  return null
}

const processEntry = (entry) => {
  const visaText = entry.visaText ?? ''
  const healthText = entry.healthText ?? ''

  const inferredVisa = inferVisa(visaText)
  const inferredDays = inferVisaDays(visaText)
  const inferredEAuth = inferEAuth(visaText)
  const inferredVaccines = inferVaccines(healthText)

  const visaRequired = normalizeBool(entry.extracted?.visaRequired ?? inferredVisa)
  const visaFreeDays = entry.extracted?.visaFreeDays ?? inferredDays
  const eAuthorizationRequired = normalizeBool(
    entry.extracted?.eAuthorizationRequired ?? inferredEAuth,
  )
  const vaccinesRequired = normalizeBool(entry.extracted?.vaccinesRequired ?? inferredVaccines)

  const color = computeColor({ visaRequired, eAuth: eAuthorizationRequired, vaccinesRequired })

  return {
    ...entry,
    extracted: {
      visaRequired,
      visaFreeDays,
      eAuthorizationRequired,
      vaccinesRequired,
    },
    color,
  }
}

const main = async () => {
  const raw = await fs.readFile(INPUT, 'utf8')
  const data = JSON.parse(raw)
  const results = (data.results ?? []).map(processEntry)
  const payload = { ...data, results }

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2))
  } else {
    await fs.writeFile(OUTPUT, JSON.stringify(payload, null, 2), 'utf8')
    console.log(`Updated classifications written to ${path.relative(process.cwd(), OUTPUT)}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
