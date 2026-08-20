import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StyleList from "./style-list"
import TypeTester from "./type-tester"
import GlyphGrid from "./glyph-grid"
import EmbedPanel from "./embed-panel"
import AboutPanel from "./about-panel"
import { SPECIMEN_DEFAULT, type FontMeta } from "@/lib/fonts"

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
      <TabsList variant="line" className="w-full justify-start gap-6 border-b">
        <TabsTrigger value="specimen">Specimen</TabsTrigger>
        <TabsTrigger value="tester">Type tester</TabsTrigger>
        <TabsTrigger value="glyphs">Glyphs</TabsTrigger>
        <TabsTrigger value="embed">Embed code</TabsTrigger>
        <TabsTrigger value="about">About & License</TabsTrigger>
      </TabsList>

      <TabsContent value="specimen" className="pt-8">
        <StyleList font={font} specimen={SPECIMEN_DEFAULT} />
      </TabsContent>
      <TabsContent value="tester" className="pt-8">
        <TypeTester font={font} />
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
