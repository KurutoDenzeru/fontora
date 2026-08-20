/**
 * Curation layer: editorial metadata on top of the raw font catalog.
 * This is Fontora's differentiator — hand-picked collections, tags, and pairings.
 * All font ids must exist in src/data/fonts.json.
 */

export interface Collection {
  slug: string
  title: string
  tagline: string
  fontIds: string[]
}

export const collections: Collection[] = [
  {
    slug: "grotesque-essentials",
    title: "Grotesque Essentials",
    tagline: "Workhorse neo-grotesques for interfaces and body text.",
    fontIds: [
      "inter",
      "roboto-flex",
      "archivo",
      "public-sans",
      "libre-franklin",
      "work-sans",
      "figtree",
      "manrope",
    ],
  },
  {
    slug: "editorial-serifs",
    title: "Editorial Serifs",
    tagline: "Long-form reading faces with real texture.",
    fontIds: [
      "source-serif-4",
      "newsreader",
      "lora",
      "libre-baskerville",
      "crimson-pro",
      "eb-garamond",
      "merriweather",
      "pt-serif",
    ],
  },
  {
    slug: "display-impact",
    title: "Display & Impact",
    tagline: "Headline faces that carry a poster on their own.",
    fontIds: [
      "anton",
      "bebas-neue",
      "unbounded",
      "syne",
      "bodoni-moda",
      "italiana",
      "major-mono-display",
      "bricolage-grotesque",
    ],
  },
  {
    slug: "terminal-code",
    title: "Terminal & Code",
    tagline: "Monospaced faces built for editors and CLIs.",
    fontIds: [
      "jetbrains-mono",
      "fira-code",
      "source-code-pro",
      "ibm-plex-mono",
      "space-mono",
      "cascadia-code",
      "ubuntu-mono",
      "victor-mono",
      "geist-mono",
      "inconsolata",
    ],
  },
  {
    slug: "friendly-geometric",
    title: "Friendly Geometrics",
    tagline: "Rounded, approachable sans serifs for consumer products.",
    fontIds: [
      "quicksand",
      "nunito",
      "rubik",
      "outfit",
      "urbanist",
      "onest",
      "karla",
      "josefin-sans",
    ],
  },
  {
    slug: "classic-revival",
    title: "Classic Revivals",
    tagline: "Historical letterforms redrawn for the screen.",
    fontIds: [
      "eb-garamond",
      "cormorant-garamond",
      "playfair-display",
      "marcellus",
      "zilla-slab",
      "arvo",
      "bitter",
      "crete-round",
    ],
  },
]

/** Recommended pairings: fontId → compatible fontIds (curated, symmetric not required). */
export const pairings: Record<string, string[]> = {
  inter: ["playfair-display", "source-serif-4", "newsreader", "jetbrains-mono"],
  "playfair-display": ["inter", "source-sans-3", "work-sans", "lato"],
  "space-grotesk": ["space-mono", "inter", "outfit"],
  "eb-garamond": ["inter", "libre-franklin", "geist"],
  newsreader: ["work-sans", "inter", "public-sans"],
  anton: ["inter", "roboto-flex", "archivo"],
  syne: ["inter", "manrope", "space-grotesk"],
  "jetbrains-mono": ["inter", "geist", "ibm-plex-sans"],
  "bodoni-moda": ["josefin-sans", "outfit", "urbanist"],
  "bricolage-grotesque": ["inter-tight", "figtree", "onest"],
}

/** Homepage hero + marquee rotation. Broad category spread; all ids verified in fonts.json. */
export const SHOWCASE_IDS = [
  "fraunces",
  "space-grotesk",
  "playfair-display",
  "jetbrains-mono",
  "anton",
  "unbounded",
  "dm-serif-display",
  "bricolage-grotesque",
]

/** Faceted tags for curation filters: fontId → style descriptors. */
export const tags: Record<string, string[]> = {  inter: ["neo-grotesque", "ui", "variable"],
  "roboto-flex": ["neo-grotesque", "ui", "variable"],
  archivo: ["grotesque", "condensed-option", "variable"],
  "playfair-display": ["transitional", "high-contrast", "display"],
  newsreader: ["oldstyle", "reading", "variable"],
  "source-serif-4": ["transitional", "reading"],
  anton: ["condensed", "poster", "heavy"],
  "bebas-neue": ["condensed", "caps", "poster"],
  unbounded: ["rounded", "experimental", "variable"],
  syne: ["experimental", "wide", "display"],
  "jetbrains-mono": ["ligatures", "coding"],
  "fira-code": ["ligatures", "coding"],
  "space-mono": ["retro", "coding"],
  "cormorant-garamond": ["garalde", "delicate", "display"],
  "eb-garamond": ["garalde", "book"],
  "bodoni-moda": ["didone", "high-contrast", "variable"],
  italiana: ["didone", "elegant", "caps"],
  "major-mono-display": ["mono", "experimental", "caps"],
  "bricolage-grotesque": ["expressive", "variable", "display"],
  quicksand: ["rounded", "geometric"],
  outfit: ["geometric", "variable", "ui"],
  "space-grotesk": ["geometric", "tech", "variable"],
}
