import { useEffect, useRef, useState } from "react"
import { ensureFont, familyCss } from "@/lib/font-loader"
import { fontsById, type FontMeta } from "@/lib/fonts"

/**
 * Single kinetic marquee: glyph specimens drifting between catalog and collections.
 * Pure CSS animation; fonts come from the shared loader cache (hero warms most of them).
 * Static under prefers-reduced-motion via the marquee-track utility in global.css.
 */
export function TypeMarquee({ fontIds }: { fontIds: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState<ReadonlySet<string>>(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        for (const id of fontIds) {
          const font = fontsById.get(id)
          if (!font) continue
          ensureFont(font)
            .then(() => setReady((prev) => new Set(prev).add(id)))
            .catch(() => {})
        }
      },
      { rootMargin: "300px" },
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [fontIds])

  const fontsInStrip = fontIds
    .map((id) => fontsById.get(id))
    .filter((f): f is FontMeta => f !== undefined)

  const strip = (ariaHidden: boolean) => (
    <div className="flex shrink-0 items-baseline gap-16 pr-16" aria-hidden={ariaHidden}>
      {fontsInStrip.map((font) => (
        <span
          key={font.id}
          className="text-6xl whitespace-nowrap text-foreground/80 md:text-7xl"
          style={ready.has(font.id) ? { fontFamily: familyCss(font) } : undefined}
        >
          Ag
        </span>
      ))}
    </div>
  )

  return (
    <div ref={containerRef} className="overflow-hidden border-y py-10" aria-label="Typeface showcase">
      <div className="marquee-track flex w-max">
        {strip(false)}
        {strip(true)}
      </div>
    </div>
  )
}
