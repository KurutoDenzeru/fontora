import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"

/**
 * Full-width search bar placed below the hero. Drives the catalog via
 * `fontora:search` CustomEvent + ?q= URL param.
 */
export function HeroSearch() {
  const [query, setQuery] = useState("")

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q") ?? ""
    if (q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(q)
    }
    const onSearch = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (detail === "") setQuery("")
    }
    window.addEventListener("fontora:search", onSearch)
    return () => window.removeEventListener("fontora:search", onSearch)
  }, [])

  function emit(value: string) {
    setQuery(value)
    const params = new URLSearchParams(window.location.search)
    if (value) params.set("q", value)
    else params.delete("q")
    const qs = params.toString()
    window.history.replaceState(null, "", `/${qs ? `?${qs}` : ""}`)
    window.dispatchEvent(new CustomEvent("fontora:search", { detail: value }))
  }

  return (
    <div className="w-full">
      <div className="relative flex items-center rounded-xs border bg-card shadow-xs">
        <Search className="pointer-events-none absolute left-4 size-4 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => emit(e.target.value)}
          placeholder="Search families"
          aria-label="Search font families"
          className="h-12 w-full bg-transparent pl-11 pr-10 text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            onClick={() => emit("")}
            aria-label="Clear search"
            className="absolute right-2 rounded-xs p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
