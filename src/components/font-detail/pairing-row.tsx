import { useEffect, useRef, useState } from "react"
import { ensureFont, familyCss } from "@/lib/font-loader"
import { Skeleton } from "@/components/ui/skeleton"
import type { FontMeta } from "@/lib/fonts"

interface Props {
  font: FontMeta
  pairedFont: FontMeta
}

const HEADING_TEXT = "Almost before we knew it"
const BODY_TEXT =
  "we had left the ground. The quick brown fox jumps over the lazy dog, packing twelve boxing wizards with them."

export default function PairingRow({ font, pairedFont }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        Promise.all([
          ensureFont(font, { weight: 600 }).catch(() => {}),
          ensureFont(pairedFont).catch(() => {}),
        ]).then(() => setLoaded(true))
      },
      { rootMargin: "200px" },
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [font, pairedFont])

  return (
    <div ref={containerRef} className="flex flex-col gap-4 rounded-lg border p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {font.family} with{" "}
          <a href={`/fonts/${pairedFont.id}`} className="text-foreground underline-offset-4 hover:underline">
            {pairedFont.family}
          </a>
        </p>
        <button
          className="shrink-0 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("fontora:toggle-select", { detail: pairedFont.id }))
          }
        >
          Add to selection
        </button>
      </div>

      {loaded ? (
        <p className="text-pretty">
          <span
            className="block text-2xl font-semibold tracking-tight md:text-3xl"
            style={{ fontFamily: familyCss(font) }}
          >
            {HEADING_TEXT}
          </span>
          <span className="mt-2 block max-w-[65ch] leading-relaxed" style={{ fontFamily: familyCss(pairedFont) }}>
            {BODY_TEXT}
          </span>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-full" />
        </div>
      )}
    </div>
  )
}
