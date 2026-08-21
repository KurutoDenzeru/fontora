import { useCallback, useEffect, useMemo, useState } from "react"
import { LayoutGrid, Rows3, SlidersHorizontal } from "lucide-react"
import {
  fonts,
  sortFonts,
  filterFonts,
  EMPTY_FILTERS,
  SPECIMEN_DEFAULT,
  type AppearanceTag,
  type SidebarFilters,
  type SortKey,
} from "@/lib/fonts"
import { SpecimenRow } from "./specimen-row"
import { SpecimenCard } from "./specimen-card"
import { FilterSidebar } from "./filter-sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

const PAGE_SIZE = 24

const SORT_LABELS: Record<SortKey, string> = {
  alpha: "A to Z",
  newest: "Recently added",
  styles: "Most styles",
}

interface CatalogState extends SidebarFilters {
  q: string
  sort: SortKey
  preview: string
  size: number
  view: "grid" | "row"
}

const DEFAULT_STATE: CatalogState = {
  q: "",
  ...EMPTY_FILTERS,
  sort: "alpha",
  preview: "",
  size: 40,
  view: "grid",
}

function readUrlState(): CatalogState {
  const params = new URLSearchParams(window.location.search)
  const size = Number(params.get("size"))
  const minStyles = Number(params.get("styles"))
  const view = params.get("view")
  return {
    q: params.get("q") ?? "",
    // Legacy links used ?category=x&variable=true; honor them.
    categories: (params.get("cat") ?? params.get("category") ?? "").split(",").filter(Boolean),
    subset: params.get("subset") ?? "all",
    appearance: (params.get("style")?.split(",").filter(Boolean) ?? []) as AppearanceTag[],
    minStyles: minStyles >= 1 ? minStyles : 1,
    sort: (params.get("sort") as SortKey) || "alpha",
    preview: params.get("preview") ?? "",
    size: size >= 12 && size <= 96 ? size : 40,
    view: view === "row" ? "row" : "grid",
  }
}

export function CatalogBrowser() {
  const [state, setState] = useState<CatalogState>(DEFAULT_STATE)
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE)

  // Hydrate from URL after mount (server render has no location) and subscribe
  // to the dock's search field. setState here is post-mount hydration sync.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readUrlState())

    const onSearch = (event: Event) => {
      const q = (event as CustomEvent<string>).detail
      setState((prev) => ({ ...prev, q: typeof q === "string" ? q : prev.q }))
      setDisplayedCount(PAGE_SIZE)
    }
    window.addEventListener("fontora:search", onSearch)
    return () => window.removeEventListener("fontora:search", onSearch)
  }, [])

  const update = useCallback((patch: Partial<CatalogState>) => {
    setState((prev) => ({ ...prev, ...patch }))
    if (!("size" in patch || "preview" in patch)) setDisplayedCount(PAGE_SIZE)
  }, [])

  // Shareable URLs: keep the address bar in sync without navigation.
  useEffect(() => {
    const params = new URLSearchParams()
    if (state.q) params.set("q", state.q)
    if (state.categories.length) params.set("cat", state.categories.join(","))
    if (state.subset !== "all") params.set("subset", state.subset)
    if (state.appearance.length) params.set("style", state.appearance.join(","))
    if (state.minStyles > 1) params.set("styles", String(state.minStyles))
    if (state.sort !== "alpha") params.set("sort", state.sort)
    if (state.preview) params.set("preview", state.preview)
    if (state.size !== 40) params.set("size", String(state.size))
    if (state.view !== "grid") params.set("view", state.view)
    const qs = params.toString()
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`)
  }, [state])

  const visible = useMemo(
    () =>
      sortFonts(
        filterFonts(fonts, {
          query: state.q,
          categories: state.categories,
          subset: state.subset === "all" ? undefined : state.subset,
          appearance: state.appearance,
          minStyles: state.minStyles,
        }),
        state.sort,
      ),
    [state.q, state.categories, state.subset, state.appearance, state.minStyles, state.sort],
  )

  const displayed = visible.slice(0, displayedCount)
  const hasFilters =
    state.q ||
    state.categories.length > 0 ||
    state.subset !== "all" ||
    state.appearance.length > 0 ||
    state.minStyles > 1

  const sidebar = (
    <FilterSidebar
      value={{
        categories: state.categories,
        subset: state.subset,
        appearance: state.appearance,
        minStyles: state.minStyles,
      }}
      onChange={(filters) => update(filters)}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Preview pane: type anything, size it, watch every specimen follow. */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder={SPECIMEN_DEFAULT}
          value={state.preview}
          onChange={(e) => update({ preview: e.target.value })}
          aria-label="Custom preview text"
          className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
        />
        <div className="flex w-full items-center gap-3 sm:w-64">
          <Slider
            min={12}
            max={96}
            step={1}
            value={[state.size]}
            onValueChange={(v) => update({ size: (Array.isArray(v) ? v[0] : v) ?? 40 })}
            aria-label="Preview font size"
            className="flex-1"
          />
          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
            {state.size}px
          </span>
        </div>
      </div>

      {/* Results bar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{visible.length.toLocaleString()}</span> of{" "}
          {fonts.length.toLocaleString()} families
        </p>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal data-icon="inline-start" />
                  Filters
                </Button>
              }
            />
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription className="sr-only">Filter the font catalog</SheetDescription>
              <div className="px-4 pb-6">{sidebar}</div>
            </SheetContent>
          </Sheet>

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

          <ToggleGroup
            value={[state.view]}
            onValueChange={(v) => v.length > 0 && update({ view: v[0] as "grid" | "row" })}
            aria-label="View mode"
          >
            <ToggleGroupItem value="grid" variant="outline" size="sm" aria-label="Grid view">
              <LayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="row" variant="outline" size="sm" aria-label="Row view">
              <Rows3 />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex items-start gap-10">
        <aside className="sticky top-24 hidden w-56 shrink-0 self-start lg:block">{sidebar}</aside>

        <div className="min-w-0 flex-1" role="list" aria-label="Font specimens">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-24 text-center">
              <p className="text-lg font-medium">No fonts match your filters</p>
              <p className="text-sm text-muted-foreground">Try a different search or fewer filters.</p>
              {hasFilters && (
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    update({ q: "", ...EMPTY_FILTERS })
                    window.dispatchEvent(new CustomEvent("fontora:search", { detail: "" }))
                  }}
                >
                  Reset filters
                </Button>
              )}
            </div>
          ) : state.view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {displayed.map((font) => (
                <SpecimenCard key={font.id} font={font} previewText={state.preview} previewSize={state.size} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {displayed.map((font, i) => (
                <div key={font.id}>
                  {i > 0 && <Separator />}
                  <SpecimenRow font={font} previewText={state.preview} previewSize={state.size} />
                </div>
              ))}
            </div>
          )}

          {displayed.length > 0 && (
            <div className="flex flex-col items-center gap-3 py-8">
              {displayedCount < visible.length ? (
                <Button variant="outline" onClick={() => setDisplayedCount((c) => c + PAGE_SIZE)}>
                  Load more
                </Button>
              ) : (
                visible.length > PAGE_SIZE && (
                  <p className="text-sm text-muted-foreground">That is every matching family.</p>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
