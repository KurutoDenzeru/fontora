import { useEffect, useRef, useState } from "react"
import { fontsById, type FontMeta } from "@/lib/fonts"
import { ensureFont, familyCss } from "@/lib/font-loader"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CollectionRowProps {
  title: string
  tagline: string
  fontIds: string[]
}

export function CollectionRow({ title, tagline, fontIds }: CollectionRowProps) {
  const containerRef = useRef<HTMLElement>(null)
  const [readyIds, setReadyIds] = useState<ReadonlySet<string>>(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        // Load every font in the row at once; failures just keep the fallback stack.
        for (const id of fontIds) {
          const font = fontsById.get(id)
          if (!font) continue
          ensureFont(font)
            .then(() => setReadyIds((prev) => new Set(prev).add(id)))
            .catch(() => {})
        }
      },
      { rootMargin: "200px" },
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [fontIds])

  const fontsInRow = fontIds
    .map((id) => fontsById.get(id))
    .filter((f): f is FontMeta => f !== undefined)

  return (
    <section ref={containerRef} className="py-10" aria-label={title}>
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3" role="list">
        {fontsInRow.map((font) => (
          <a
            key={font.id}
            href={`/fonts/${font.id}`}
            role="listitem"
            className="inline-flex items-baseline gap-2 rounded-sm text-lg underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={readyIds.has(font.id) ? { fontFamily: familyCss(font) } : undefined}
          >
            {font.family}
            {font.variable && (
              <Badge variant="outline" className="text-xs">
                Variable
              </Badge>
            )}
          </a>
        ))}
      </div>

      <Separator className="mt-10" />
    </section>
  )
}
