/**
 * Syncs font metadata from the Fontsource API into src/data/fonts.json.
 *
 * Run on demand: `bun run sync:fonts`
 * The output is committed, so builds stay hermetic (no network).
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const API = "https://api.fontsource.org/v1"
const OUT_DIR = join(import.meta.dirname, "../src/data")
const CONCURRENCY = 24
const RETRIES = 3

interface FontListItem {
  id: string
  family: string
  subsets: string[]
  weights: number[]
  styles: string[]
  defSubset: string
  variable: boolean
  lastModified: string
  category: string
  license: string
  type: string
}

interface VariableResponse {
  family: string
  axes: Record<string, { default: string; min: string; max: string; step: string }>
}

async function fetchJson<T>(url: string): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      return (await res.json()) as T
    } catch (error) {
      lastError = error
      if (attempt < RETRIES) {
        const { promise, resolve } = Promise.withResolvers<void>()
        setTimeout(resolve, 250 * attempt)
        await promise
      }
    }
  }
  throw lastError
}

async function mapPool<T, R>(items: T[], fn: (item: T) => Promise<R | null>): Promise<R[]> {
  const results: R[] = []
  let index = 0
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (index < items.length) {
        const item = items[index++]
        const out = await fn(item)
        if (out !== null) results.push(out)
      }
    }),
  )
  return results
}

const list = await fetchJson<FontListItem[]>(`${API}/fonts`)
console.log(`fetched ${list.length} fonts`)

// Only google-type fonts are guaranteed to ship woff2 on the fontsource CDN.
const fonts = list.filter((f) => f.type === "google")
const variableFonts = fonts.filter((f) => f.variable)
console.log(`google: ${fonts.length}, variable: ${variableFonts.length}`)

const axesById = new Map<string, Record<string, { min: number; max: number; default: number; step: number }>>()
let failures = 0

await mapPool(variableFonts, async (font) => {
  try {
    const res = await fetchJson<VariableResponse>(`${API}/variable/${font.id}`)
    const axes = Object.fromEntries(
      Object.entries(res.axes ?? {}).map(([tag, a]) => [
        tag,
        { min: Number(a.min), max: Number(a.max), default: Number(a.default), step: Number(a.step) },
      ]),
    )
    axesById.set(font.id, axes)
  } catch {
    failures++
  }
  return null
})

const output = fonts
  .map((f) => ({
    id: f.id,
    family: f.family,
    category: f.category,
    subsets: f.subsets,
    defSubset: f.defSubset,
    weights: f.weights,
    styles: f.styles,
    variable: f.variable,
    ...(axesById.has(f.id) ? { axes: axesById.get(f.id) } : {}),
    lastModified: f.lastModified,
    license: f.license,
  }))
  .sort((a, b) => a.family.localeCompare(b.family))

await mkdir(OUT_DIR, { recursive: true })
const file = join(OUT_DIR, "fonts.json")
await writeFile(file, JSON.stringify(output))

console.log(`wrote ${output.length} fonts to ${file}`)
if (failures > 0) console.warn(`warning: ${failures} variable fonts missing axis data`)
