import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { googleFontsCssUrl, fallbackStack, type FontMeta } from "@/lib/fonts"

interface Props {
  font: FontMeta
}

type TabId = "link" | "import" | "css" | "npm"

export default function EmbedPanel({ font }: Props) {
  const [weights, setWeights] = useState<string[]>(["400", "700"])
  const [copied, setCopied] = useState(false)

  const numericWeights = weights
    .map(Number)
    .filter((w) => font.weights.includes(w))
    .sort((a, b) => a - b)

  const cssUrl = googleFontsCssUrl([
    { family: font.family, weights: numericWeights.length ? numericWeights : undefined },
  ])

  const snippets: Record<TabId, string> = {
    link: [
      `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
      `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
      `<link href="${cssUrl}" rel="stylesheet" />`,
    ].join("\n"),
    import: `@import url("${cssUrl}");`,
    css: `font-family: '${font.family}', ${fallbackStack(font.category)};`,
    npm: `bun add ${font.variable ? `@fontsource-variable/${font.id}` : `@fontsource/${font.id}`}`,
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Copy failed")
    }
  }

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "link", label: "<link>" },
    { id: "import", label: "@import" },
    { id: "css", label: "CSS" },
    { id: "npm", label: "npm" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Weights</span>
        <ToggleGroup value={weights} onValueChange={(v) => v.length > 0 && setWeights(v)}>
          {font.weights.map((weight) => (
            <ToggleGroupItem key={weight} value={String(weight)} variant="outline" size="sm">
              {weight}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Tabs defaultValue="link">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="pt-4">
            <div className="group relative">
              <pre className="overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm">
                <code>{snippets[tab.id]}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => copy(snippets[tab.id])}
                aria-label={`Copy ${tab.label} snippet`}
              >
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
