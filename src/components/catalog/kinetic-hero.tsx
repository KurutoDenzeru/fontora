import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { ensureFont, familyCss } from "@/lib/font-loader"
import { fontsById, type FontMeta } from "@/lib/fonts"
import { SHOWCASE_IDS } from "@/data/curation"

const INTERVAL_MS = 2600

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
    <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Every font, worth trying.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          1,976 open-source families, 565 variable. Live specimens, shareable filters, embed snippets.
        </p>
      </div>

      {/* Kinetic specimen: the catalog demonstrating itself. */}
      <div className="flex flex-col items-start gap-2 lg:items-end">
        <div className="flex h-36 items-center overflow-hidden md:h-44" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.span
              key={current.id}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -28 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="block text-8xl leading-none tracking-tight whitespace-nowrap md:text-9xl"
              style={ready.has(current.id) ? { fontFamily: familyCss(current) } : undefined}
            >
              Aa
            </motion.span>
          </AnimatePresence>
        </div>
        <a
          href={`/fonts/${current.id}`}
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>{current.family}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  )
}
