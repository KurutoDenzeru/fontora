import { useEffect, useRef, useState } from "react"
import { ensureFont, familyCss, variationSettings } from "@/lib/font-loader"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { FontMeta } from "@/lib/fonts"

interface Props {
  font: FontMeta
}

const DEFAULT_TEXT = "Almost before we knew it, we had left the ground."

export default function TypeTester({ font }: Props) {
  const axes = font.axes ?? {}
  // The ital axis is driven by the italic switch (separate vf file), not a slider.
  const hasItalic = font.styles.includes("italic")
  const axisTags = Object.keys(axes).filter((tag) => !(hasItalic && tag === "ital"))

  const [loaded, setLoaded] = useState(false)
  const [italic, setItalic] = useState(false)
  const [size, setSize] = useState(36)
  const [weight, setWeight] = useState("400")
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(Object.entries(axes).map(([tag, a]) => [tag, a.default])),
  )
  const editorRef = useRef<HTMLDivElement>(null)

  const style = italic ? "italic" : "normal"

  useEffect(() => {
    let active = true
    const request = font.variable
      ? ensureFont(font, { variable: true, style })
      : ensureFont(font, { weight: Number(weight), style })
    request
      .then(() => active && setLoaded(true))
      .catch(() => active && setLoaded(true))
    return () => {
      active = false
    }
  }, [font, style, weight])

  const previewStyle: React.CSSProperties = {
    fontFamily: loaded ? familyCss(font) : undefined,
    fontStyle: style,
    fontSize: `${size}px`,
    ...(font.variable
      ? { fontVariationSettings: variationSettings(values) }
      : { fontWeight: Number(weight) }),
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-24 rounded-md p-6 leading-relaxed outline-none transition-shadow focus:ring-2 focus:ring-ring"
        style={previewStyle}
        dangerouslySetInnerHTML={{ __html: DEFAULT_TEXT }}
        onBlur={(e) => {
          if (!e.currentTarget.textContent?.trim()) {
            e.currentTarget.textContent = DEFAULT_TEXT
          }
        }}
      />

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Size</span>
            <span className="tabular-nums text-muted-foreground">{size}px</span>
          </div>
          <Slider
            min={12}
            max={128}
            step={1}
            value={[size]}
            onValueChange={(v) => setSize(Array.isArray(v) ? v[0] : v)}
            aria-label="Preview size"
          />
        </div>

        {font.variable
          ? axisTags.map((tag) => {
              const axis = axes[tag]
              const value = values[tag] ?? axis.default
              return (
                <div key={tag} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{tag}</span>
                    <span className="tabular-nums text-muted-foreground">{value}</span>
                  </div>
                  <Slider
                    min={axis.min}
                    max={axis.max}
                    step={axis.step}
                    value={[value]}
                    onValueChange={(v) =>
                      setValues((prev) => ({ ...prev, [tag]: Array.isArray(v) ? v[0] : v }))
                    }
                    aria-label={`${tag} axis`}
                    disabled={!loaded}
                  />
                </div>
              )
            })
          : null}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {!font.variable && font.weights.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Weight</span>
            <ToggleGroup value={[weight]} onValueChange={(v) => v.length > 0 && setWeight(v[0])}>
              {font.weights.map((w) => (
                <ToggleGroupItem key={w} value={String(w)} variant="outline" size="sm">
                  {w}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
        {hasItalic && (
          <label className="flex w-fit items-center gap-2 text-sm">
            <Switch checked={italic} onCheckedChange={setItalic} aria-label="Toggle italic" />
            Italic
          </label>
        )}
      </div>
    </div>
  )
}
