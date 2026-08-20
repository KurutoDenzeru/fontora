import { useEffect, useRef, useState } from "react"
import { ensureFont, familyCss } from "@/lib/font-loader"
import { Skeleton } from "@/components/ui/skeleton"
import type { FontMeta } from "@/lib/fonts"

interface Props {
  font: FontMeta
}

const GLYPHS = [
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)),
  ...Array.from({ length: 10 }, (_, i) => String.fromCharCode(48 + i)),
  ...[..."!?", "&", "@", "#", "%", "$", "§", "¶", "†", "‡", "©", "®", "™", "°", "•", "·", "–", "…"],
]

export default function GlyphGrid({ font }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        ensureFont(font)
          .then(() => setLoaded(true))
          .catch(() => setLoaded(true))
      },
      { rootMargin: "200px" },
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [font])

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2"
      role="list"
      aria-label={`${font.family} glyph set`}
    >
      {GLYPHS.map((glyph) => (
        <div
          key={glyph}
          className="flex size-12 items-center justify-center rounded-md border text-2xl transition-colors hover:bg-accent"
          role="listitem"
          style={loaded ? { fontFamily: familyCss(font) } : undefined}
        >
          {loaded ? glyph : <Skeleton className="size-6" aria-hidden="true" />}
        </div>
      ))}
    </div>
  )
}
