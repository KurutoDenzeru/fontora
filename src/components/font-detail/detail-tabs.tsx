import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeXml, Grid2x2, Info, Type } from "lucide-react"
import SpecimenTab from "./specimen-tab"
import GlyphGrid from "./glyph-grid"
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
 */
export default function DetailTabs({ font }: Props) {
  return (
    <Tabs defaultValue="specimen">
      <TabsList>
        <TabsTrigger value="specimen">
          <Type data-icon="inline-start" />
          Specimen
        </TabsTrigger>
        <TabsTrigger value="glyphs">
          <Grid2x2 data-icon="inline-start" />
          Glyphs
        </TabsTrigger>
        <TabsTrigger value="embed">
          <CodeXml data-icon="inline-start" />
          Embed code
        </TabsTrigger>
        <TabsTrigger value="about">
          <Info data-icon="inline-start" />
          About & License
        </TabsTrigger>
      </TabsList>

      <TabsContent value="specimen" className="pt-8">
        <SpecimenTab font={font} />
      </TabsContent>
      <TabsContent value="glyphs" className="pt-8">
        <GlyphGrid font={font} />
      </TabsContent>
      <TabsContent value="embed" className="pt-8">
        <EmbedPanel font={font} />
      </TabsContent>
      <TabsContent value="about" className="pt-8">
        <AboutPanel font={font} />
      </TabsContent>
    </Tabs>
  )
}
