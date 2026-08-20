import { useEffect, useRef, useState } from "react"
import { ensureFont, familyCss } from "@/lib/font-loader"
import { SPECIMEN_DEFAULT, type FontMeta } from "@/lib/fonts"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  font: FontMeta
  specimen?: string
}

interface Combo {
  weight: number
  style: "normal" | "italic"
}

export default function StyleList({ font, specimen = SPECIMEN_DEFAULT }: Props) {
  const combos: Combo[] = font.weights.flatMap((weight) =>
    font.styles.map((style) => ({ weight, style: style as "normal" | "italic" })),
  )
  const [ready, setReady] = useState<ReadonlySet<string>>(new Set())
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const markReady = (key: string) => setReady((prev) => new Set(prev).add(key))

    const load = (combo: Combo, key: string) => {
      // Variable fonts: one file covers every weight; rows differentiate via CSS fontWeight.
      const request = font.variable
        ? ensureFont(font, { variable: true, style: combo.style })
        : ensureFont(font, { weight: combo.weight, style: combo.style })
      request.then(() => markReady(key)).catch(() => markReady(key))
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          const combo = combos[Number(el.dataset.index)]
          observer.unobserve(el)
          load(combo, el.dataset.key as string)
        }
      },
      { rootMargin: "100px" },
    )

    root.querySelectorAll("[data-key]").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // combos is derived from font; both stable per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [font])

  return (
    <div ref={rootRef} className="flex flex-col divide-y" role="list">
      {combos.map((combo, index) => {
        const key = `${combo.weight}-${combo.style}`
        return (
          <div key={key} data-key={key} data-index={index} className="flex items-baseline gap-6 py-4" role="listitem">
            <div className="flex w-24 shrink-0 items-baseline gap-2 text-xs text-muted-foreground">
              <span className="tabular-nums">{combo.weight}</span>
              {combo.style === "italic" && <span>Italic</span>}
            </div>
            {ready.has(key) ? (
              <p
                className="min-w-0 flex-1 truncate text-2xl"
                style={{
                  fontFamily: familyCss(font),
                  fontWeight: combo.weight,
                  fontStyle: combo.style,
                }}
              >
                {specimen}
              </p>
            ) : (
              <Skeleton className="h-8 flex-1" aria-hidden="true" />
            )}
          </div>
        )
      })}
    </div>
  )
}
