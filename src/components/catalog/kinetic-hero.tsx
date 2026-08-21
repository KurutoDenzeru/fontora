import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { ensureFont, familyCss } from "@/lib/font-loader"
import { fontsById, type FontMeta } from "@/lib/fonts"
import { SHOWCASE_IDS } from "@/data/curation"

const INTERVAL_MS = 2800

/**
 * Kinetic-type hero: the headline itself cycles through showcase families.
 * The page demonstrates the catalog, which is the whole point of the product.
 * Baseline is anchored from below so 1-line and 2-line faces never shift the copy.
 */
export function KineticHero() {
  const reduce = useReducedMotion()
  const showcase = SHOWCASE_IDS.map((id) => fontsById.get(id)).filter((f): f is FontMeta => f !== undefined)
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState<ReadonlySet<string>>(new Set())

  // Warm the cache for every showcase face up front so transitions never flash fallback.
  useEffect(() => {
    for (const font of showcase) {
      ensureFont(font)
        .then(() => setReady((prev) => new Set(prev).add(font.id)))
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (reduce) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % showcase.length), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [reduce, showcase.length])

  const current = showcase[index]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex min-h-[2.1em] items-end text-4xl md:text-6xl lg:text-7xl">
        <AnimatePresence mode="wait">
          <motion.h1
            key={current.id}
            initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? undefined : { opacity: 0, y: -18, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pb-1 leading-[1.05] font-semibold tracking-tight"
            style={ready.has(current.id) ? { fontFamily: familyCss(current) } : undefined}
          >
            Every font, worth trying.
          </motion.h1>
        </AnimatePresence>
      </div>

      <a
        href={`/fonts/${current.id}`}
        className="group inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>
          Set in <span className="font-medium text-foreground">{current.family}</span>
        </span>
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>

      <p className="max-w-xl text-lg text-muted-foreground">
        1,976 open-source families, 565 variable. Live specimens, shareable filters, embed snippets.
      </p>
    </div>
  )
}
