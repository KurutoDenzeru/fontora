import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeXml, Info, Languages, Type } from "lucide-react"
import { motion } from "motion/react"
import SpecimenTab from "./specimen-tab"
import GlyphsAndLanguages from "./glyphs-languages"
import EmbedPanel from "./embed-panel"
import AboutPanel from "./about-panel"
import type { FontMeta } from "@/lib/fonts"

interface Props {
  font: FontMeta
}

/**
 * Google Fonts-style tabbed detail view. One island: inactive panels stay
 * unmounted until first activation, and per-panel font loading fires lazily
 * via each panel's own IntersectionObserver.
 *
 * Glyphs tab was expanded to "Glyphs & languages" (parity with
 * https://fonts.google.com/specimen/Open+Sans/glyphs?preview.layout=grid):
 * grid per language/script + large preview, filtered by font.subsets.
 */
export default function DetailTabs({ font }: Props) {
  const panels: Array<{ id: string; content: React.ReactNode }> = [
    { id: "specimen", content: <SpecimenTab font={font} /> },
    { id: "glyphs", content: <GlyphsAndLanguages font={font} /> },
    { id: "embed", content: <EmbedPanel font={font} /> },
    { id: "about", content: <AboutPanel font={font} /> },
  ]

  return (
    <Tabs defaultValue="specimen">
      <TabsList className="w-full">
        <TabsTrigger value="specimen" className="flex-1">
          <Type data-icon="inline-start" />
          Specimen
        </TabsTrigger>
        <TabsTrigger value="glyphs" className="flex-1">
          <Languages data-icon="inline-start" />
          Glyphs & languages
        </TabsTrigger>
        <TabsTrigger value="embed" className="flex-1">
          <CodeXml data-icon="inline-start" />
          Embed code
        </TabsTrigger>
        <TabsTrigger value="about" className="flex-1">
          <Info data-icon="inline-start" />
          About & License
        </TabsTrigger>
      </TabsList>

      {panels.map((panel) => (
        <TabsContent key={panel.id} value={panel.id} className="pt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {panel.content}
          </motion.div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
