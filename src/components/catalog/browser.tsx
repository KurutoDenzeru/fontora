import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import {
  fonts,
  categories,
  sortFonts,
  filterFonts,
  SPECIMEN_DEFAULT,
  type SortKey,
} from "@/lib/fonts"
import { SpecimenRow } from "./specimen-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

const PAGE_SIZE = 24

const SORT_LABELS: Record<SortKey, string> = {
  alpha: "A to Z",
  newest: "Recently added",
  styles: "Most styles",
}

interface CatalogState {
  q: string
  category: string
  sort: SortKey
  variable: boolean
  preview: string
  size: number
}

function readUrlState(): CatalogState {
  const params = new URLSearchParams(window.location.search)
  const size = Number(params.get("size"))
  return {
    q: params.get("q") ?? "",
    category: params.get("category") ?? "all",
    sort: (params.get("sort") as SortKey) || "alpha",
    variable: params.get("variable") === "true",
    preview: params.get("preview") ?? SPECIMEN_DEFAULT,
    size: size >= 12 && size <= 96 ? size : 40,
  }
}

export function CatalogBrowser() {
  const [state, setState] = useState<CatalogState>({
    q: "",
    category: "all",
    sort: "alpha",
    variable: false,
    preview: SPECIMEN_DEFAULT,
    size: 40,
  })
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE)

  // Hydrate from URL after mount (server render has no location).
  // setState here is the standard post-mount hydration sync for shareable URL state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readUrlState())
  }, [])

  const update = useCallback((patch: Partial<CatalogState>) => {
    setState((prev) => ({ ...prev, ...patch }))
    if (!("size" in patch || "preview" in patch)) setDisplayedCount(PAGE_SIZE)
  }, [])

  // Shareable URLs: keep the address bar in sync without navigation.
  useEffect(() => {
    const params = new URLSearchParams()
    if (state.q) params.set("q", state.q)
    if (state.category !== "all") params.set("category", state.category)
    if (state.sort !== "alpha") params.set("sort", state.sort)
    if (state.variable) params.set("variable", "true")
    if (state.preview !== SPECIMEN_DEFAULT) params.set("preview", state.preview)
    if (state.size !== 40) params.set("size", String(state.size))
    const qs = params.toString()
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`)
  }, [state])

  const visible = useMemo(() => {
    const filtered = filterFonts(fonts, {
      query: state.q,
      category: state.category === "all" ? undefined : state.category,
      variableOnly: state.variable,
    })
    return sortFonts(filtered, state.sort)
  }, [state.q, state.category, state.variable, state.sort])

  const displayed = visible.slice(0, displayedCount)
  const hasFilters = state.q || state.category !== "all" || state.sort !== "alpha" || state.variable

  return (
    <div className="flex flex-col">
      <div className="sticky top-14 z-30 -mx-4 flex flex-col gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-sm md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-48 flex-1">
            <Search data-icon="inline-start" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search families"
              value={state.q}
              onChange={(e) => update({ q: e.target.value })}
              className="pl-9"
              aria-label="Search font families"
            />
          </div>

          <Select value={state.category} onValueChange={(category) => update({ category: category ?? "all" })}>
            <SelectTrigger className="w-44" aria-label="Filter by category">
              <SelectValue>
                {state.category === "all"
                  ? "All categories"
                  : state.category.charAt(0).toUpperCase() + state.category.slice(1)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={state.sort} onValueChange={(sort) => update({ sort: (sort as SortKey) ?? "alpha" })}>
            <SelectTrigger className="w-40" aria-label="Sort order">
              <SelectValue>{SORT_LABELS[state.sort]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha">A to Z</SelectItem>
              <SelectItem value="newest">Recently added</SelectItem>
              <SelectItem value="styles">Most styles</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch
              checked={state.variable}
              onCheckedChange={(variable) => update({ variable })}
              aria-label="Variable fonts only"
            />
            Variable
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-48 flex-1">
            <Input
              type="text"
              placeholder="Type to preview"
              value={state.preview}
              onChange={(e) => update({ preview: e.target.value })}
              className="pr-8"
              aria-label="Custom preview text"
            />
            {state.preview !== SPECIMEN_DEFAULT && (
              <button
                onClick={() => update({ preview: SPECIMEN_DEFAULT })}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Reset preview text"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="flex w-56 items-center gap-3">
            <Slider
              min={12}
              max={96}
              step={1}
              value={[state.size]}
              onValueChange={(v) => update({ size: Array.isArray(v) ? v[0] : v })}
              aria-label="Preview font size"
              className="flex-1"
            />
            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{state.size}px</span>
          </div>
        </div>
      </div>

      <div role="list" aria-label="Font specimens">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-24 text-center">
            <p className="text-lg font-medium">No fonts match your filters</p>
            <p className="text-sm text-muted-foreground">Try a different search or category.</p>
            {hasFilters && (
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => update({ q: "", category: "all", sort: "alpha", variable: false })}
              >
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {displayed.map((font, i) => (
              <Fragment key={font.id}>
                {i > 0 && <Separator />}
                <SpecimenRow font={font} previewText={state.preview} previewSize={state.size} />
              </Fragment>
            ))}
            <div className="flex flex-col items-center gap-3 border-t py-8">
              <p className="text-sm text-muted-foreground">
                Showing {displayed.length.toLocaleString()} of {visible.length.toLocaleString()} families
              </p>
              {displayedCount < visible.length && (
                <Button variant="outline" onClick={() => setDisplayedCount((c) => c + PAGE_SIZE)}>
                  Load more
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
