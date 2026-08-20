import { useState, useSyncExternalStore } from "react"
import { Check, Copy, Layers, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fallbackStack, fontsById, googleFontsCssUrl, type FontMeta } from "@/lib/fonts"

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
  const cssUrl = googleFontsCssUrl(
    selectedFonts.map((f) => ({
      family: f.family,
      weights: [400, 700].filter((w) => f.weights.includes(w)),
    })),
  )

  const snippets = {
    link: [
      `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
      `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
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
      <div className="flex items-center justify-between gap-2">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="pt-3">
          <pre className="overflow-x-auto rounded-md bg-muted p-4 font-mono text-xs whitespace-pre">
            <code>{snippets[tab.id]}</code>
          </pre>
          <div className="mt-2 flex justify-end">
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

  // Derived: removing the last font while open closes the sheet automatically.
  const isOpen = open && selectedFonts.length > 0

  if (selectedFonts.length === 0 && !isOpen) return null

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger
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
      <SheetContent side="right" className="flex w-96 max-w-[90vw] flex-col">
        <SheetHeader>
          <SheetTitle>Your selection</SheetTitle>
          <SheetDescription>
            {selectedFonts.length} {selectedFonts.length === 1 ? "family" : "families"} selected
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4">
          {selectedFonts.map((font) => (
            <div key={font.id} className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2">
              <div className="min-w-0 flex-1">
                <a href={`/fonts/${font.id}`} className="block truncate font-medium underline-offset-4 hover:underline">
                  {font.family}
                </a>
                <p className="text-xs text-muted-foreground">{font.category}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => toggleFont(font.id)}
                aria-label={`Remove ${font.family}`}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>

        {selectedFonts.length > 0 && (
          <>
            <Separator />
            <div className="px-4 pb-2">
              <EmbedTabs selectedFonts={selectedFonts} />
            </div>
          </>
        )}

        <SheetFooter className="flex-row justify-between gap-2">
          <Button variant="ghost" onClick={clearAll}>
            Clear all
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
