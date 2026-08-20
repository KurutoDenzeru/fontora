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

const CDN = "https://cdn.jsdelivr.net/fontsource/fonts"

/** Static weight file: fonts/{id}@latest/{subset}-{weight}-{style}.woff2 */
export function staticFontUrl(
  font: Pick<FontMeta, "id">,
  weight = 400,
  style: "normal" | "italic" = "normal",
  subset = "latin",
): string {
  return `${CDN}/${font.id}@latest/${subset}-${weight}-${style}.woff2`
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
  return `${CDN}/${font.id}:vf@latest/${subset}-standard-${style}.woff2`
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

/** Google Fonts CSS2 API embed URL for user-facing copy-paste snippets. */
export function googleFontsCssUrl(selected: Array<{ family: string; weights?: number[] }>): string {
  const params = selected
    .map(({ family, weights }) => {
      const name = family.replace(/ /g, "+")
      if (!weights?.length) return `family=${name}`
      const sorted = [...weights].sort((a, b) => a - b)
      return `family=${name}:wght@${sorted.join(";")}`
    })
    .join("&")
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
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
  category?: string
  variableOnly?: boolean
}

export function filterFonts(list: FontMeta[], filter: FontFilter): FontMeta[] {
  const query = filter.query?.trim().toLowerCase()
  return list.filter((f) => {
    if (filter.category && f.category !== filter.category) return false
    if (filter.variableOnly && !f.variable) return false
    if (query && !f.family.toLowerCase().includes(query)) return false
    return true
  })
}

export const SPECIMEN_DEFAULT = "The quick brown fox jumps over the lazy dog"
