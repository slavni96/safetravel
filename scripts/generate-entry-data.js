#!/usr/bin/env node
/**
 * Fetch entry requirements from viaggiaresicuri.it (JSON API) and write a snapshot.
 * Extracts raw HTML text for visa and health (vaccination) sections; classification is left null.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as loadHtml } from 'cheerio'
import countries from 'world-countries'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT = path.join(__dirname, '../data/entry-requirements.json')
const API_URL = 'https://www.viaggiaresicuri.it/schede_paese'

const textFromHtml = (html) => {
  if (!html) return null
  const $ = loadHtml(html)
  const text = $.root().text()
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized.length) return null
  const stripped = normalized.replace(/[.\-]/g, '').trim()
  return stripped.length ? normalized : null
}

const pickNode = (nodi, patterns) => {
  if (!nodi || typeof nodi !== 'object') return null
  const entries = Object.values(nodi)
  for (const pat of patterns) {
    const found = entries.find(
      (node) =>
        typeof node?.titolo === 'string' &&
        (pat instanceof RegExp ? pat.test(node.titolo) : node.titolo.toLowerCase().includes(pat.toLowerCase())),
    )
    if (found?.contenuto) return textFromHtml(found.contenuto)
  }
  return null
}

const fetchCountry = async (country) => {
  const code = country.cca3
  const url = `${API_URL}/${code}.json`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      return { country: country.name.common, cca3: code, error: `HTTP ${res.status}` }
    }
    const data = await res.json()

    const visaText = pickNode(data.infoRequisitiIngresso?.nodi, [
      /visto/i,
      /documenti/i,
      /passaporto/i,
      /ingresso/i,
    ])

    const healthText = pickNode(data.infoSituazioneSanitaria?.nodi, [/vaccinazioni/i, /vaccinazioni obbligatorie/i])

    return {
      country: country.name.common,
      cca3: code,
      cca2: country.cca2,
      source: url,
      visaText,
      healthText,
      extracted: {
        visaRequired: null,
        visaFreeDays: null,
        eAuthorizationRequired: null,
        vaccinesRequired: null,
      },
      color: null,
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    return { country: country.name.common, cca3: code, error: String(error) }
  }
}

const main = async () => {
  const argCountry = process.argv.slice(2).find((arg) => arg.startsWith('--country='))
  const onlyCountry = argCountry ? argCountry.split('=')[1].toUpperCase() : null

  const results = []
  const queue = onlyCountry
    ? countries.filter((c) => c.cca3?.toUpperCase() === onlyCountry || c.cca2?.toUpperCase() === onlyCountry)
    : countries.filter((c) => c.cca3?.toUpperCase() !== 'ITA' && c.cca2?.toUpperCase() !== 'IT')
  const concurrency = onlyCountry ? 1 : 10

  const worker = async () => {
    while (queue.length) {
      const country = queue.shift()
      if (!country?.cca3) continue
      const result = await fetchCountry(country)
      results.push(result)
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))

  const payload = {
    generatedAt: new Date().toISOString(),
    total: results.length,
    results,
  }

  if (onlyCountry) {
    console.log(JSON.stringify(payload, null, 2))
  } else {
    await fs.mkdir(path.dirname(OUTPUT), { recursive: true })
    await fs.writeFile(OUTPUT, JSON.stringify(payload, null, 2), 'utf8')
    console.log(`Saved ${results.length} entries to ${path.relative(process.cwd(), OUTPUT)}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
