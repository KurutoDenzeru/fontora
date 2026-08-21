import { useEffect, useState } from "react"
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import { Search, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Floating dock navbar: detached pill, hides on scroll-down, reveals on scroll-up.
 * Search sits at the center; typing drives the catalog via a CustomEvent + ?q= URL param.
 */
export function DockNav() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [query, setQuery] = useState("")

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 140)
  })

  // Hydrate the field from a shared/linked URL (?q=...).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q) setQuery(q)
    // The catalog can clear the query (reset filters); mirror that here.
    const onSearch = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (detail === "") setQuery("")
    }
    window.addEventListener("fontora:search", onSearch)
    return () => window.removeEventListener("fontora:search", onSearch)
  }, [])

  function emitSearch(value: string) {
    setQuery(value)
    if (window.location.pathname === "/") {
      const params = new URLSearchParams(window.location.search)
      if (value) {
        params.set("q", value)
      } else {
        params.delete("q")
      }
      const qs = params.toString()
      window.history.replaceState(null, "", `/${qs ? `?${qs}` : ""}`)
      window.dispatchEvent(new CustomEvent("fontora:search", { detail: value }))
    } else if (value) {
      // Off the catalog: jump to it with the query applied.
      window.location.assign(`/?q=${encodeURIComponent(value)}`)
    }
  }

  return (
    <motion.header
      animate={{ y: hidden && !reduce ? "-140%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav
        className="flex h-12 w-full max-w-2xl items-center gap-2 rounded-full border bg-background/70 px-4 shadow-lg shadow-black/5 backdrop-blur-md"
        aria-label="Main"
      >
        <a href="/" className="shrink-0 text-base font-semibold tracking-tight">
          Fontora
        </a>

        <div className="relative mx-auto w-full max-w-56">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => emitSearch(e.target.value)}
            placeholder="Search families"
            aria-label="Search font families"
            className="w-full bg-transparent pr-7 pl-8 text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              onClick={() => emitSearch("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <a
            href="/"
            className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Catalog
          </a>
          <a
            href="/#collections"
            className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Collections
          </a>
        </div>

        <ThemeToggle />
      </nav>
    </motion.header>
  )
}
