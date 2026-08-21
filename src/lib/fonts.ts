import fontsData from "@/data/fonts.json"

export interface FontAxis {
  min: number
  max: number
  default: number
  step: number
}

export interface FontMeta {
  id: string
  family: string
  category: string
  subsets: string[]
  defSubset?: string
  weights: number[]
  styles: string[]
  variable: boolean
  axes?: Record<string, FontAxis>
  lastModified: string
  license: string
}

export const fonts = fontsData as FontMeta[]

export const fontsById = new Map(fonts.map((f) => [f.id, f]))

export const categories = [...new Set(fonts.map((f) => f.category))].sort()

/** Writing systems ranked by family coverage, latin first. */
export const subsets: Array<{ id: string; count: number }> = (() => {
  const counts: Record<string, number> = {}
  for (const f of fonts) for (const s of f.subsets) counts[s] = (counts[s] ?? 0) + 1
  return Object.entries(counts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => (a.id === "latin" ? -1 : b.id === "latin" ? 1 : b.count - a.count))
})()

/** Total style variants (weights x styles), the "Number of styles" property. */
export function styleCount(font: FontMeta): number {
  return font.weights.length * font.styles.length
}

export const MAX_STYLE_COUNT = Math.max(...fonts.map(styleCount))

/** Sidebar filter bundle shared by the catalog browser and filter sidebar. */
export interface SidebarFilters {
  categories: string[]
  subset: string
  appearance: AppearanceTag[]
  minStyles: number
}

export const EMPTY_FILTERS: SidebarFilters = {
  categories: [],
  subset: "all",
  appearance: [],
  minStyles: 1,
}

/** Appearance tags derived from real axis metadata and family naming, not editorial guesswork. */
export type AppearanceTag = "variable" | "rounded" | "condensed" | "wide" | "slanted"

export const APPEARANCE_TAGS: AppearanceTag[] = ["variable", "rounded", "condensed", "wide", "slanted"]

export function hasAppearance(font: FontMeta, tag: AppearanceTag): boolean {
  switch (tag) {
    case "variable":
      return font.variable
    case "rounded":
      return font.axes?.ROND !== undefined || font.id.includes("rounded")
    case "condensed":
      return (font.axes?.wdth !== undefined && font.axes.wdth.min < 90) || font.id.includes("condensed")
    case "wide":
      return font.axes?.wdth !== undefined && font.axes.wdth.max > 110
    case "slanted":
      return font.axes?.slnt !== undefined
  }
}

/** CSS fallback stack per Google category, so previews degrade gracefully. */
export function fallbackStack(category: string): string {
  switch (category) {
    case "serif":
      return "Georgia, 'Times New Roman', serif"
    case "monospace":
      return "'Courier New', monospace"
    case "handwriting":
      return "cursive"
    case "display":
    case "sans-serif":
    default:
      return "system-ui, sans-serif"
  }
}

// Primary Fontsource CDN (jsDelivr) and opensource fallbacks
const PRIMARY_CDN = "https://cdn.jsdelivr.net/fontsource/fonts"
const FALLBACK_NPM = "https://cdn.jsdelivr.net/npm/@fontsource"
const FALLBACK_NPM_VAR = "https://cdn.jsdelivr.net/npm/@fontsource-variable"

function effectiveSubset(font: Pick<FontMeta, "subsets" | "defSubset">, requested: string): string {
  if (font.subsets.includes(requested)) return requested
  if (font.defSubset && font.subsets.includes(font.defSubset)) return font.defSubset
  if (font.subsets.includes("latin")) return "latin"
  return font.subsets[0] ?? requested
}

/** Static weight file: fonts/{id}@latest/{subset}-{weight}-{style}.woff2 */
export function staticFontUrl(
  font: Pick<FontMeta, "id">,
  weight = 400,
  style: "normal" | "italic" = "normal",
  subset = "latin",
): string {
  return `${PRIMARY_CDN}/${font.id}@latest/${subset}-${weight}-${style}.woff2`
}

/** All candidate URLs for a static weight, tried in order until one loads. */
export function staticFontCandidates(
  font: Pick<FontMeta, "id" | "subsets" | "defSubset">,
  weight = 400,
  style: "normal" | "italic" = "normal",
  subset = "latin",
): string[] {
  const eff = effectiveSubset(font, subset)
  const id = font.id
  const file = `${eff}-${weight}-${style}.woff2`
  const candidates = [
    `${PRIMARY_CDN}/${id}@latest/${file}`,
    `${FALLBACK_NPM}/${id}@latest/files/${id}-${file}`,
  ]
  // If requested subset wasn't available, also try original requested as fallback
  if (eff !== subset) {
    const origFile = `${subset}-${weight}-${style}.woff2`
    candidates.push(`${PRIMARY_CDN}/${id}@latest/${origFile}`)
  }
  return [...new Set(candidates)]
}

/**
 * Variable font file containing every axis: fonts/{id}:vf@latest/{subset}-standard-{style}.woff2
 * Single-axis files (wght, opsz, …) also exist, but `standard` covers playground use.
 */
export function variableFontUrl(
  font: Pick<FontMeta, "id">,
  style: "normal" | "italic" = "normal",
  subset = "latin",
): string {
  return `${PRIMARY_CDN}/${font.id}:vf@latest/${subset}-standard-${style}.woff2`
}

/** All candidate URLs for a variable file, tried in order. */
export function variableFontCandidates(
  font: Pick<FontMeta, "id" | "subsets" | "defSubset" | "axes">,
  style: "normal" | "italic" = "normal",
  subset = "latin",
): string[] {
  const eff = effectiveSubset(font, subset)
  const id = font.id
  const axes = font.axes ? Object.keys(font.axes) : []
  // Build axis-specific file names: wght first, then other axes, then standard
  const axisFiles = (() => {
    const order: string[] = []
    if (axes.includes("wght")) order.push("wght")
    for (const a of axes) if (a !== "wght") order.push(a)
    if (!order.includes("standard")) order.push("standard")
    return order.map((axis) => `${eff}-${axis}-${style}.woff2`)
  })()
  const staticFall = `${eff}-400-${style}.woff2`
  const vfCandidates: string[] = []
  for (const file of axisFiles) {
    vfCandidates.push(`${PRIMARY_CDN}/${id}:vf@latest/${file}`)
    vfCandidates.push(`${FALLBACK_NPM_VAR}/${id}@latest/files/${id}-${file}`)
  }
  if (eff !== subset) {
    for (const axis of [...(axes.includes("wght") ? ["wght"] : []), "standard"]) {
      const orig = `${subset}-${axis}-${style}.woff2`
      vfCandidates.push(`${PRIMARY_CDN}/${id}:vf@latest/${orig}`)
    }
  }
  return [
    ...vfCandidates,
    // Ultimate fallback: static 400 for preview so text still renders in correct family
    `${PRIMARY_CDN}/${id}@latest/${staticFall}`,
    `${FALLBACK_NPM}/${id}@latest/files/${id}-${staticFall}`,
  ]
}

/** Stylesheet URL listing every weight/style of one family (for detail pages). */
export function familyCssUrls(font: FontMeta, subset = "latin"): string[] {
  if (font.variable) {
    return font.styles.map((style) => variableFontUrl(font, style as "normal" | "italic", subset))
  }
  return font.weights.flatMap((weight) =>
    font.styles.map((style) => staticFontUrl(font, weight, style as "normal" | "italic", subset)),
  )
}

/** Embed snippet hosts: Coollabs Fonts, a privacy-friendly drop-in for the Google Fonts CSS2 API. */
export const EMBED_API_HOST = "https://api.fonts.coollabs.io"
export const EMBED_CDN_HOST = "https://cdn.fonts.coollabs.io"

/** CSS2-compatible embed URL for user-facing copy-paste snippets. */
export function embedCssUrl(
  selected: Array<{ family: string; weights?: number[]; range?: [number, number] }>,
): string {
  const params = selected
    .map(({ family, weights, range }) => {
      const name = family.replace(/ /g, "+")
      if (range) return `family=${name}:wght@${range[0]}..${range[1]}`
      if (!weights?.length) return `family=${name}`
      const sorted = [...weights].sort((a, b) => a - b)
      return `family=${name}:wght@${sorted.join(";")}`
    })
    .join("&")
  return `${EMBED_API_HOST}/css2?${params}&display=swap`
}

export type SortKey = "alpha" | "newest" | "styles"

export function sortFonts(list: FontMeta[], key: SortKey): FontMeta[] {
  const sorted = [...list]
  switch (key) {
    case "newest":
      sorted.sort((a, b) => b.lastModified.localeCompare(a.lastModified))
      break
    case "styles":
      sorted.sort((a, b) => b.weights.length * b.styles.length - a.weights.length * a.styles.length)
      break
    case "alpha":
    default:
      sorted.sort((a, b) => a.family.localeCompare(b.family))
  }
  return sorted
}

export interface FontFilter {
  query?: string
  categories?: string[]
  subset?: string
  appearance?: AppearanceTag[]
  minStyles?: number
}

export function filterFonts(list: FontMeta[], filter: FontFilter): FontMeta[] {
  const query = filter.query?.trim().toLowerCase()
  return list.filter((f) => {
    if (filter.categories?.length && !filter.categories.includes(f.category)) return false
    if (filter.subset && !f.subsets.includes(filter.subset)) return false
    if (filter.minStyles && styleCount(f) < filter.minStyles) return false
    if (filter.appearance?.some((tag) => !hasAppearance(f, tag))) return false
    if (query && !f.family.toLowerCase().includes(query)) return false
    return true
  })
}

export const SPECIMEN_DEFAULT = "The quick brown fox jumps over the lazy dog"
