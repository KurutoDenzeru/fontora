import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { ensureFont, familyCss } from "@/lib/font-loader"
import {
  APPEARANCE_TAGS,
  EMPTY_FILTERS,
  MAX_STYLE_COUNT,
  SPECIMEN_DEFAULT,
  fontsById,
  subsets,
  type AppearanceTag,
  type SidebarFilters,
} from "@/lib/fonts"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/**
 * Category chips each set in a representative face, the Google Fonts sidebar pattern.
 * Label differs from the raw category where the friendly name reads better.
 */
const CATEGORY_CHIPS: Array<{ value: string; label: string; sampleFont: string }> = [
  { value: "serif", label: "Serif", sampleFont: "eb-garamond" },
  { value: "sans-serif", label: "Sans Serif", sampleFont: "inter" },
  { value: "monospace", label: "Monospace", sampleFont: "jetbrains-mono" },
  { value: "display", label: "Display", sampleFont: "anton" },
  { value: "handwriting", label: "Calligraphy", sampleFont: "caveat" },
]

const APPEARANCE_LABELS: Record<AppearanceTag, string> = {
  variable: "Variable",
  rounded: "Rounded",
  condensed: "Condensed",
  wide: "Wide",
  slanted: "Slanted",
}

export function FilterSidebar({
  value,
  onChange,
  preview,
  size,
  onPreviewChange,
}: {
  value: SidebarFilters
  onChange: (next: SidebarFilters) => void
  preview: string
  size: number
  onPreviewChange: (patch: { preview?: string; size?: number }) => void
}) {
  const [chipFontsReady, setChipFontsReady] = useState(false)

  // Warm the five sample faces once so chips render in their own category's style.
  useEffect(() => {
    let active = true
    Promise.all(
      CATEGORY_CHIPS.map((chip) => {
        const font = fontsById.get(chip.sampleFont)
        return font ? ensureFont(font).catch(() => {}) : Promise.resolve()
      }),
    ).then(() => active && setChipFontsReady(true))
    return () => {
      active = false
    }
  }, [])

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item]

  const isDirty =
    value.categories.length > 0 ||
    value.subset !== "all" ||
    value.appearance.length > 0 ||
    value.minStyles > 1

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Preview</h3>
        <Textarea
          placeholder={SPECIMEN_DEFAULT}
          value={preview}
          onChange={(e) => onPreviewChange({ preview: e.target.value })}
          aria-label="Custom preview text"
          rows={3}
          className="min-h-28 resize-y whitespace-pre-wrap break-words text-sm leading-relaxed"
        />
        <div className="flex items-center gap-3">
          <Slider
            min={12}
            max={96}
            step={1}
            value={[size]}
            onValueChange={(v) => onPreviewChange({ size: (Array.isArray(v) ? v[0] : v) ?? 40 })}
            aria-label="Preview font size"
            className="flex-1"
          />
          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{size}px</span>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Writing system</h3>
        <Select value={value.subset} onValueChange={(subset) => onChange({ ...value, subset: subset ?? "all" })}>
          <SelectTrigger className="w-full" aria-label="Writing system">
            <SelectValue>
              {value.subset === "all"
                ? "All languages"
                : (subsets.find((s) => s.id === value.subset)?.id ?? value.subset)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            {subsets.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.id} ({s.count.toLocaleString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Category</h3>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_CHIPS.map((chip) => {
            const active = value.categories.includes(chip.value)
            const sample = fontsById.get(chip.sampleFont)
            return (
              <button
                key={chip.value}
                onClick={() => onChange({ ...value, categories: toggle(value.categories, chip.value) })}
                aria-pressed={active}
                className={cn(
                  "rounded-md border px-3 py-2 text-center text-sm transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card hover:bg-accent",
                )}
                style={
                  chipFontsReady && sample && !active ? { fontFamily: familyCss(sample) } : undefined
                }
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Style</h3>
        <div className="grid grid-cols-2 gap-2">
          {APPEARANCE_TAGS.map((tag) => {
            const active = value.appearance.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => onChange({ ...value, appearance: toggle(value.appearance, tag) })}
                aria-pressed={active}
                className={cn(
                  "rounded-md border px-3 py-2 text-center text-sm transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card hover:bg-accent",
                )}
              >
                {APPEARANCE_LABELS[tag]}
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Properties</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Number of styles</span>
            <span className="tabular-nums text-muted-foreground">
              {value.minStyles > 1 ? `${value.minStyles}+` : "Any"}
            </span>
          </div>
          <Slider
            min={1}
            max={MAX_STYLE_COUNT}
            step={1}
            value={[value.minStyles]}
            onValueChange={(v) => onChange({ ...value, minStyles: (Array.isArray(v) ? v[0] : v) ?? 1 })}
            aria-label="Minimum number of styles"
          />
        </div>
      </section>

      {isDirty && (
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => onChange(EMPTY_FILTERS)}>
          <RotateCcw data-icon="inline-start" />
          Reset filters
        </Button>
      )}
    </div>
  )
}
