import { useState, useSyncExternalStore } from "react"
import { Check, Copy, Layers, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          toast.success("Copied embed code")
          setTimeout(() => setCopied(false), 2000)
        } catch {
          toast.error("Copy failed")
        }
      }}
    >
      {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

function EmbedTabs({ selectedFonts }: { selectedFonts: FontMeta[] }) {
  const cssUrl = embedCssUrl(
    selectedFonts.map((f) => ({
      family: f.family,
      weights: [400, 700].filter((w) => f.weights.includes(w)),
    })),
  )

  const snippets = {
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

  const tabs: Array<{ id: keyof typeof snippets; label: string }> = [
    { id: "link", label: "<link>" },
    { id: "import", label: "@import" },
    { id: "css", label: "CSS" },
  ]

  return (
    <Tabs defaultValue="link">
      <TabsList className="w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex-1">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="pt-4">
          <pre className="overflow-x-auto rounded-md bg-muted p-4 font-mono text-xs whitespace-pre">
            <code>{snippets[tab.id]}</code>
          </pre>
          <div className="mt-3 flex justify-end">
            <CopyButton text={snippets[tab.id]} />
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
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="size-4 text-muted-foreground" />
            Your selection
          </DialogTitle>
          <DialogDescription>
            {selectedFonts.length} {selectedFonts.length === 1 ? "family" : "families"} selected
            <span className="text-muted-foreground/60"> — ready to embed</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-2">
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
                  className="opacity-60 transition-opacity group-hover:opacity-100"
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <EmbedTabs selectedFonts={selectedFonts} />
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
