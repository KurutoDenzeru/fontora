/**
 * Runtime font loader: injects FontFace entries from the fontsource CDN on demand.
 * Framework-agnostic — used by React hooks and Astro inline scripts alike.
 * Loaded faces are cached module-wide; concurrent requests share one promise.
 * Includes opensource fallback CDNs for rate-limit / 404 resilience.
 */
import { staticFontCandidates, variableFontCandidates, fallbackStack, type FontMeta } from "./fonts"

const loadedKeys = new Set<string>()
const pending = new Map<string, Promise<void>>()

export interface LoadOptions {
  weight?: number
  style?: "normal" | "italic"
  /** Force the all-axes variable file regardless of `font.variable` (playground use). */
  variable?: boolean
}

function fontFaceDescriptors(font: FontMeta, opts: Required<LoadOptions>): FontFaceDescriptors {
  const descriptors: FontFaceDescriptors = { style: opts.style, display: "swap" }
  if (opts.variable) {
    // Ranges let the browser interpolate; per-axis files only carry their own axis.
    const wght = font.axes?.wght
    descriptors.weight = wght ? `${wght.min} ${wght.max}` : "100 900"
  } else {
    descriptors.weight = String(opts.weight)
  }
  return descriptors
}

async function tryLoadUrls(
  family: string,
  urls: string[],
  descriptors: FontFaceDescriptors,
): Promise<FontFace> {
  let lastError: unknown
  for (const url of urls) {
    const face = new FontFace(family, `url("${url}") format("woff2")`, descriptors)
    try {
      const loaded = await face.load()
      // Some CDNs return HTML 404 page with 200; FontFace may still "load" but check status via loaded check?
      // If bytes are not valid woff2, load will reject. So success is valid.
      return loaded
    } catch (e) {
      lastError = e
      // try next CDN
      continue
    }
  }
  throw lastError ?? new Error("All font CDNs failed")
}

/** Loads and registers one @font-face. Resolves when usable; rejects on network/parse failure. */
export function ensureFont(font: FontMeta, opts: LoadOptions = {}): Promise<void> {
  const full: Required<LoadOptions> = {
    weight: opts.weight ?? 400,
    style: opts.style ?? "normal",
    variable: opts.variable ?? font.variable,
  }
  const key = `${font.id}:${full.variable ? "vf" : full.weight}:${full.style}`
  if (loadedKeys.has(key)) return Promise.resolve()

  const existing = pending.get(key)
  if (existing) return existing

  const urls = full.variable
    ? variableFontCandidates(font, full.style)
    : staticFontCandidates(font, full.weight, full.style)

  const descriptors = fontFaceDescriptors(font, full)

  const promise = tryLoadUrls(font.family, urls, descriptors)
    .then((loaded) => {
      document.fonts.add(loaded)
      loadedKeys.add(key)
      pending.delete(key)
    })
    .catch((error) => {
      pending.delete(key)
      // Don't throw loudly for preview: degrade to fallback stack silently
      // But still reject so callers can handle skeleton -> error state
      throw error
    })
  pending.set(key, promise)
  return promise
}

/** CSS font-family value with category-appropriate fallbacks. */
export function familyCss(font: FontMeta): string {
  return `'${font.family}', ${fallbackStack(font.category)}`
}

/** CSS font-variation-settings value from axis overrides, e.g. { wght: 650, opsz: 20 }. */
export function variationSettings(axes: Record<string, number>): string {
  return Object.entries(axes)
    .map(([tag, value]) => `"${tag}" ${value}`)
    .join(", ")
}
