import { useEffect, useRef, useState } from "react"
import { Plus } from "lucide-react"
import { SPECIMEN_DEFAULT, styleCount, type FontMeta } from "@/lib/fonts"
import { ensureFont, familyCss } from "@/lib/font-loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface SpecimenCardProps {
  font: FontMeta
  previewText: string
  previewSize: number
}

/** Grid-view specimen card: meta on top, large live preview below. */
export function SpecimenCard({ font, previewText, previewSize }: SpecimenCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"idle" | "ready" | "error">("idle")
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        ensureFont(font)
          .then(() => setStatus("ready"))
          .catch(() => setStatus("error"))
      },
      { rootMargin: "200px" },
    )
    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [font])

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col rounded-lg border p-5 transition-colors hover:bg-accent/50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="listitem"
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <a
            href={`/fonts/${font.id}`}
            className="block truncate text-sm font-medium underline-offset-4 hover:underline"
          >
            {font.family}
          </a>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {styleCount(font)} {styleCount(font) === 1 ? "style" : "styles"} · {font.category}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {font.variable && (
            <Badge variant="secondary" className="h-4 px-1.5 text-xs">
              Variable
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            onClick={() => window.dispatchEvent(new CustomEvent("fontora:toggle-select", { detail: font.id }))}
            aria-label={`Add ${font.family} to selection`}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <a href={`/fonts/${font.id}`} className="block flex-1" tabIndex={-1} aria-hidden="true">
        {status === "idle" ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <p
            className="line-clamp-3 leading-snug break-words transition-[font-weight] duration-300 ease-out"
            style={{
              fontFamily: status === "ready" ? familyCss(font) : undefined,
              fontSize: `${previewSize}px`,
              fontWeight: hovered && font.variable && status === "ready" ? 700 : 400,
            }}
          >
            {previewText || SPECIMEN_DEFAULT}
          </p>
        )}
      </a>
    </div>
  )
}
