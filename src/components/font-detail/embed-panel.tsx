import { useEffect, useState } from "react"
import { AtSign, Braces, Check, Copy, Link2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { embedCssUrl, fallbackStack, EMBED_API_HOST, EMBED_CDN_HOST, type FontMeta } from "@/lib/fonts"
import { cn } from "@/lib/utils"

interface Props {
  font: FontMeta
}

/**
 * Embed snippets as a scroll-spy table of contents: the sidebar tracks the
 * visible section and scrolls to anchors instead of switching tabs.
 */
export default function EmbedPanel({ font }: Props) {
  const [copied, setCopied] = useState<string | null>(null)
  const [active, setActive] = useState("embed-link")

  // Variable fonts embed as a weight range; static fonts as the text pair.
  const wghtAxis = font.variable ? font.axes?.wght : undefined
  const staticWeights = [400, 700].filter((w) => font.weights.includes(w))
  const cssUrl = embedCssUrl([
    wghtAxis
      ? { family: font.family, range: [wghtAxis.min, wghtAxis.max] }
      : { family: font.family, weights: staticWeights.length ? staticWeights : undefined },
  ])

  const sections = [
    {
      id: "embed-link",
      label: "<link>",
      icon: Link2,
      snippet: [
        `<link rel="preconnect" href="${EMBED_API_HOST}" />`,
        `<link rel="preconnect" href="${EMBED_CDN_HOST}" crossorigin />`,
        `<link href="${cssUrl}" rel="stylesheet" />`,
      ].join("\n"),
    },
    {
      id: "embed-import",
      label: "@import",
      icon: AtSign,
      snippet: `@import url("${cssUrl}");`,
    },
    {
      id: "embed-css",
      label: "CSS",
      icon: Braces,
      snippet: `font-family: '${font.family}', ${fallbackStack(font.category)};`,
    },
  ]

  // Scroll-spy: highlight the TOC entry whose section is near the viewport top.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    )
    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
    // Sections are stable per font page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [font.id])

  const copy = async (section: (typeof sections)[number]) => {
    try {
      await navigator.clipboard.writeText(section.snippet)
      setCopied(section.id)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Copy failed")
    }
  }

  const scrollTo = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }

  return (
    <div className="grid gap-6 md:gap-10 md:grid-cols-[12rem_1fr]">
      <aside className="flex gap-1 self-start overflow-x-auto md:sticky md:top-28 md:flex-col md:gap-1 md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Embed sections">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            aria-current={active === section.id}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 border-transparent py-1.5 pr-3 pl-3 text-left text-sm whitespace-nowrap transition-colors md:border-b-0 md:border-l-2 md:pr-2 md:pl-3",
              active === section.id
                ? "border-primary font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <section.icon className="size-3.5" />
            {section.label}
          </button>
        ))}
      </aside>

      <div className="flex min-w-0 flex-col gap-6 md:gap-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h3 className="mb-3 text-sm font-medium">{section.label}</h3>
            <div className="group relative">
              <pre className="overflow-x-auto rounded-md bg-muted p-3 pr-12 font-mono text-sm whitespace-pre sm:p-4">
                <code>{section.snippet}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => copy(section)}
                aria-label={copied === section.id ? "Copied" : "Copy"}
                className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                {copied === section.id ? <Check /> : <Copy />}
              </Button>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
