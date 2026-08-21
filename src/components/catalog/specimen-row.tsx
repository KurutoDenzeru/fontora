import { useEffect, useRef, useState } from "react"
import { Plus } from "lucide-react"
import { SPECIMEN_DEFAULT, type FontMeta } from "@/lib/fonts"
import { ensureFont, familyCss } from "@/lib/font-loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface SpecimenRowProps {
  font: FontMeta
  previewText: string
  previewSize: number
}

export function SpecimenRow({ font, previewText, previewSize }: SpecimenRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
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
    if (rowRef.current) observer.observe(rowRef.current)
    return () => observer.disconnect()
  }, [font])

  return (
    <div ref={rowRef} className="group relative flex flex-col gap-3 py-6 transition-colors hover:bg-accent/50 md:flex-row md:gap-6" role="listitem">
      <div className="flex w-full shrink-0 flex-col gap-1 md:w-56">
        <a
          href={`/fonts/${font.id}`}
          className="text-base font-medium underline-offset-4 transition-colors hover:underline"
          style={status === "ready" ? { fontFamily: familyCss(font) } : undefined}
        >
          {font.family}
        </a>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {font.weights.length * font.styles.length}{" "}
            {font.weights.length * font.styles.length === 1 ? "style" : "styles"} · {font.category}
          </span>
          {font.variable && (
            <Badge variant="secondary" className="h-4 px-1.5 text-xs">
              Variable
            </Badge>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {status === "idle" ? (
          <Skeleton className="h-10 w-full" aria-hidden="true" />
        ) : (
          <p
            className="line-clamp-2 leading-snug break-words transition-[font-weight] duration-300 ease-out"
            style={{
              fontFamily: status === "ready" ? familyCss(font) : undefined,
              fontSize: `${previewSize}px`,
              // Variable fonts interpolate the sweep; static fonts stay put.
              fontWeight: hovered && font.variable && status === "ready" ? 700 : 400,
            }}
            aria-label={`Preview of ${font.family}`}
          >
            {previewText || SPECIMEN_DEFAULT}
          </p>
        )}
      </div>

      <div className="absolute top-4 right-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.dispatchEvent(new CustomEvent("fontora:toggle-select", { detail: font.id }))}
          aria-label={`Add ${font.family} to selection`}
        >
          <Plus data-icon="inline-start" />
        </Button>
      </div>
    </div>
  )
}
