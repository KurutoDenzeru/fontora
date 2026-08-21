import { useState, useSyncExternalStore } from "react"
import { AtSign, Braces, Check, Copy, Layers, Link2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fallbackStack, fontsById, embedCssUrl, EMBED_API_HOST, EMBED_CDN_HOST, type FontMeta } from "@/lib/fonts"

const STORAGE_KEY = "fontora:selection"

// --- Module-level selection store -------------------------------------------

const selected = new Set<string>()
const listeners = new Set<() => void>()
let snapshot: string[] = []

function emit() {
  snapshot = [...selected]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // storage unavailable; selection stays session-only
  }
  listeners.forEach((listener) => listener())
}

function toggleFont(fontId: string) {
  if (selected.has(fontId)) {
    selected.delete(fontId)
  } else {
    selected.add(fontId)
  }
  emit()
}

function clearAll() {
  selected.clear()
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

if (typeof window !== "undefined") {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    if (Array.isArray(stored)) stored.forEach((id) => typeof id === "string" && selected.add(id))
  } catch {
    // corrupted storage; start empty
  }
  snapshot = [...selected]
  window.addEventListener("fontora:toggle-select", (event) => {
    const fontId = (event as CustomEvent<string>).detail
    if (typeof fontId === "string") toggleFont(fontId)
  })
}

function useSelectionIds(): string[] {
  return useSyncExternalStore(subscribe, () => snapshot, () => [])
}

// --- UI ----------------------------------------------------------------------

function EmbedTabs({ selectedFonts }: { selectedFonts: FontMeta[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  const cssUrl = embedCssUrl(
    selectedFonts.map((f) => ({
      family: f.family,
      weights: [400, 700].filter((w) => f.weights.includes(w)),
    })),
  )

  const snippets: Record<string, string> = {
    link: [
      `<link rel="preconnect" href="${EMBED_API_HOST}" />`,
      `<link rel="preconnect" href="${EMBED_CDN_HOST}" crossorigin />`,
      `<link href="${cssUrl}" rel="stylesheet" />`,
    ].join("\n"),
    import: `@import url("${cssUrl}");`,
    css: selectedFonts
      .map((f) => `font-family: '${f.family}', ${fallbackStack(f.category)};`)
      .join("\n"),
  }

  const tabs: Array<{ id: string; label: string; icon: typeof Link2 }> = [
    { id: "link", label: "<link>", icon: Link2 },
    { id: "import", label: "import", icon: AtSign },
    { id: "css", label: "CSS", icon: Braces },
  ]

  async function handleCopy(id: string) {
    try {
      await navigator.clipboard.writeText(snippets[id])
      setCopied(id)
      toast.success("Copied embed code")
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Copy failed")
    }
  }

  return (
    <Tabs defaultValue="link">
      <TabsList className="w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex-1 gap-1.5">
            <tab.icon data-icon="inline-start" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="pt-4">
          <div className="group relative">
            <pre className="overflow-x-auto rounded-md bg-muted p-4 pr-12 font-mono text-xs whitespace-pre">
              <code>{snippets[tab.id]}</code>
            </pre>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleCopy(tab.id)}
              aria-label={copied === tab.id ? "Copied" : "Copy"}
              className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              {copied === tab.id ? <Check /> : <Copy />}
            </Button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

export function SelectionBag() {
  const ids = useSelectionIds()
  const [open, setOpen] = useState(false)

  const selectedFonts = ids
    .map((id) => fontsById.get(id))
    .filter((f): f is FontMeta => f !== undefined)

  // Derived: removing the last font while open closes the dialog automatically.
  // Adding a font does NOT auto-open — user must click the trigger.
  const isOpen = open && selectedFonts.length > 0

  if (selectedFonts.length === 0 && !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="fixed right-6 bottom-6 z-40 rounded-full shadow-lg">
            <Layers data-icon="inline-start" />
            Selection
            <Badge variant="secondary" className="tabular-nums">
              {selectedFonts.length}
            </Badge>
          </Button>
        }
      />
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader className="shrink-0 gap-2 border-b px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Layers className="size-4 text-muted-foreground" />
            Your selection
          </DialogTitle>
          <DialogDescription>
            {selectedFonts.length} {selectedFonts.length === 1 ? "family" : "families"} selected
            <span className="text-muted-foreground/60"> — ready to embed</span>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2 p-6">
            {selectedFonts.map((font) => (
              <div
                key={font.id}
                className="group flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2.5 transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={`/fonts/${font.id}`}
                    className="block truncate text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {font.family}
                  </a>
                  <p className="text-xs text-muted-foreground capitalize">{font.category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => toggleFont(font.id)}
                  aria-label={`Remove ${font.family}`}
                  className="shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <Separator className="mb-4" />
            <EmbedTabs selectedFonts={selectedFonts} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="w-full sm:w-auto"
          >
            Clear all
          </Button>
          <Button onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
