import { useEffect, useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import { Search, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

/**
 * Floating dock navbar: detached pill, hides on scroll-down, reveals on scroll-up.
 * Search is embedded; typing drives the catalog via a CustomEvent + ?q= URL param.
 */
export function DockNav() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 140)
  })

  // Hydrate the field from a shared/linked URL (?q=...).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q")
    if (q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(q)
      setSearchOpen(true)
    }
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
        className="flex h-12 items-center gap-1 rounded-full border bg-background/70 pr-2 pl-4 shadow-lg shadow-black/5 backdrop-blur-md"
        aria-label="Main"
      >
        <a href="/" className="mr-2 text-base font-semibold tracking-tight">
          Fontora
        </a>

        <a
          href="/"
          className="hidden rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          Catalog
        </a>
        <a
          href="/#collections"
          className="hidden rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          Collections
        </a>

        <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        <div className="flex items-center">
          <AnimatePresence initial={false}>
            {searchOpen && (
              <motion.div
                initial={reduce ? false : { width: 0, opacity: 0 }}
                animate={{ width: "12rem", opacity: 1 }}
                exit={reduce ? undefined : { width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <input
                  type="search"
                  value={query}
                  onChange={(e) => emitSearch(e.target.value)}
                  placeholder="Search families"
                  aria-label="Search font families"
                  autoFocus
                  className="w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              if (searchOpen) emitSearch("")
              setSearchOpen(!searchOpen)
            }}
            aria-label={searchOpen ? "Close search" : "Open search"}
            className={cn(
              "rounded-full p-2 text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
              "hover:scale-110 active:scale-95",
            )}
          >
            {searchOpen ? <X className="size-4" /> : <Search className="size-4" />}
          </button>
        </div>

        <div className="transition-transform hover:scale-110">
          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  )
}
