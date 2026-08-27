import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { ensureFont, familyCss, variationSettings } from "@/lib/font-loader"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import StyleList from "./style-list"
import { SPECIMEN_DEFAULT, type FontMeta } from "@/lib/fonts"

interface Props {
  font: FontMeta
}

const AXIS_NAMES: Record<string, string> = {
  wght: "Weight",
  opsz: "Optical size",
  wdth: "Width",
  slnt: "Slant",
  GRAD: "Grade",
  ROND: "Rounded",
  SOFT: "Softness",
  WONK: "Wonk",
  CASL: "Casual",
  CRSV: "Cursive",
  MONO: "Mono",
  XOPQ: "Thick stroke",
  YOPQ: "Thin stroke",
  XTRA: "Counter width",
  YTAS: "Ascender",
  YTDE: "Descender",
  YTLC: "Lowercase height",
}

export default function SpecimenTab({ font }: Props) {
  const axes = font.axes ?? {}
  const hasItalic = font.styles.includes("italic")
  const axisTags = Object.keys(axes).filter((tag) => !(hasItalic && tag === "ital"))
  const defaults = Object.fromEntries(Object.entries(axes).map(([tag, a]) => [tag, a.default]))

  const [loaded, setLoaded] = useState(false)
  const [italic, setItalic] = useState(false)
  const [size, setSize] = useState(36)
  const [weight, setWeight] = useState("400")
  const [values, setValues] = useState<Record<string, number>>(defaults)
  const [preview, setPreview] = useState("")

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

  const displayText = preview.trim() ? preview : SPECIMEN_DEFAULT

  return (
    <div className="grid gap-6 md:gap-10 md:grid-cols-[15rem_1fr]">
      <aside className="flex flex-col gap-6 self-start md:sticky md:top-28">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{font.variable ? "Variable axes" : "Controls"}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setValues(defaults)
              setSize(36)
              setWeight("400")
              setItalic(false)
              setPreview("")
            }}
            aria-label="Reset controls"
          >
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
        </div>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Preview</h3>
          <Textarea
            placeholder={SPECIMEN_DEFAULT}
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            aria-label="Custom preview text"
            rows={3}
            className="min-h-28 resize-y whitespace-pre-wrap break-words text-sm leading-relaxed"
          />
        </section>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Size</span>
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

        {axisTags.map((tag) => {
          const axis = axes[tag]
          const value = values[tag] ?? axis.default
          return (
            <div key={tag} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{AXIS_NAMES[tag] ?? tag}</span>
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
                aria-label={`${AXIS_NAMES[tag] ?? tag} axis`}
                disabled={!loaded}
              />
            </div>
          )
        })}

        {!font.variable && font.weights.length > 1 && (
          <div className="flex flex-col gap-2">
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
      </aside>

      <div className="flex min-w-0 flex-col gap-6 md:gap-10">
        <div className="rounded-md border p-4 sm:p-6">
          <p className="leading-relaxed break-words whitespace-pre-wrap" style={previewStyle}>
            {displayText}
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">All styles</h3>
          <StyleList font={font} specimen={displayText} />
        </div>
      </div>
    </div>
  )
}
