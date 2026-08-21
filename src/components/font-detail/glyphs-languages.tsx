import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ensureFont, familyCss } from "@/lib/font-loader"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { FontMeta } from "@/lib/fonts"

interface Props {
  font: FontMeta
}

type GlyphGroup = {
  id: string
  title: string
  glyphs: string[]
  subtitle?: string
  subsets: string[]
}

// Subsets required to show the group — “*” means always visible
const GROUPS: GlyphGroup[] = [
  {
    id: "latin-lowercase",
    title: "Latin Lowercase",
    subsets: ["*"],
    glyphs: [
      "a","á","à","ă","ắ","ằ","ẵ","ẳ","â",
      "ấ","ầ","ẫ","ẩ","å","ắ","ä","ã","ą","ā",
      "ả","ạ","ᾰ","ậ","æ","ǽ","b","β","c",
      "ć","ĉ","č","ċ","ç","d","ď","đ","ð",
      "e","é","è","ĕ","ê","ế","ě","ë","ę",
      "ė","è","e","ê","ə","f","ƒ","g","ğ",
      "ĝ","ġ","Ģ","ǧ","h","ĥ","ħ","i","í",
      "ì","ĭ","î","ï","ĩ","į","ī","j","ĵ",
      "k","ķ","l","ĺ","ļ","ľ","ł","m","n",
      "ń","ņ","ň","ñ","o","ó","ò","ŏ","ô",
      "ố","ồ","ỗ","ổ","ö","ő","õ","ø","œ",
      "p","q","r","ŕ","ŗ","ř","s","ś","ŝ",
      "ş","š","t","ť","ţ","ŧ","u","ú","ù",
      "ŭ","û","ü","ű","ů","ų","ū","v","w",
      "ŵ","x","y","ý","ỳ","ŷ","ÿ","z","ź",
      "ż","ž",
    ].slice(0, 81),
  },
  {
    id: "latin-uppercase",
    title: "Latin Uppercase",
    subsets: ["*"],
    glyphs: [
      "A","Á","À","Ă","Ắ","Ằ","Ẵ","Ẳ","Â",
      "Ấ","Ầ","Ẫ","Ẩ","Å","Ä","Ã","Ą","Ā",
      "B","C","Ć","Ĉ","Č","Ċ","Ç","D","Ď","Đ",
      "E","É","È","Ĕ","Ê","Ế","Ě","Ë","Ę",
      "F","G","Ğ","Ĝ","Ġ","H","Ĥ","Ħ","I",
      "Í","Ì","Ĭ","Î","Ï","Ĩ","Į","Ī","J",
      "K","Ķ","L","Ĺ","Ļ","Ľ","Ł","M","N",
      "Ń","Ņ","Ň","Ñ","O","Ó","Ò","Ŏ","Ô",
      "Ö","Ő","Õ","Ø","Œ","P","Q","R","Ŕ","S",
      "Ś","Ŝ","Ş","Š","T","Ť","Ţ","U","Ú",
      "Ù","Ŭ","Û","Ü","Ű","Ů","Ų","Ū","V",
      "W","Ŵ","X","Y","Ý","Ÿ","Z","Ź","Ż","Ž",
    ].slice(0, 72),
  },
  {
    id: "numbers",
    title: "Numbers & Fractions",
    subsets: ["*"],
    glyphs: ["0","1","2","3","4","5","6","7","8","9","½","¼","¾","⅓","⅔","⅛","⅜","⅝"],
  },
  {
    id: "punctuation",
    title: "Punctuation",
    subsets: ["*"],
    glyphs: [".",",",":",";","!","?","¡","¿","·","…","–","—","-","(",")","[","]","{","}","/","\\","|","\"","'","`","«","»","“","”","‘","’"],
  },
  {
    id: "symbols",
    title: "Symbols & Currency",
    subsets: ["*"],
    glyphs: ["@","#","$","€","£","¥","¢","₹","₽","₩","₺","₴","§","¶","†","‡","©","®","™","°","•","·","*","^","~","`","#","+","=","<",">","&","%","_"],
  },
  {
    id: "cyrillic-lowercase",
    title: "Cyrillic Lowercase",
    subsets: ["cyrillic", "cyrillic-ext"],
    glyphs: ["а","б","в","г","д","е","ё","ж","з","и","й","к","л","м","н","о","п","р","с","т","у","ф","х","ц","ч","ш","щ","ъ","ы","ь","э","ю","я","ђ","ѓ","є","ѕ","і","ї","ј","љ","њ","ћ","ќ","ў","џ"],
  },
  {
    id: "cyrillic-uppercase",
    title: "Cyrillic Uppercase",
    subsets: ["cyrillic", "cyrillic-ext"],
    glyphs: ["А","Б","В","Г","Д","Е","Ё","Ж","З","И","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ъ","Ы","Ь","Э","Ю","Я"],
  },
  {
    id: "greek",
    title: "Greek",
    subsets: ["greek", "greek-ext"],
    glyphs: ["α","β","γ","δ","ε","ζ","η","θ","ι","κ","λ","μ","ν","ξ","ο","π","ρ","σ","τ","υ","φ","χ","ψ","ω","Α","Β","Γ","Δ","Ε","Ζ","Η","Θ","Ι","Κ","Λ","Μ","Ν","Ξ","Ο","Π","Ρ","Σ","Τ","Υ","Φ","Χ","Ψ","Ω","ά","έ","ή","ί","ό","ύ","ώ"],
  },
  {
    id: "arabic",
    title: "Arabic",
    subsets: ["arabic"],
    glyphs: ["ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي","ء","آ","أ","ؤ","إ","ئ","لا","لأ","لإ","لآ"],
  },
  {
    id: "hebrew",
    title: "Hebrew",
    subsets: ["hebrew"],
    glyphs: ["א","ב","ג","ד","ה","ו","ז","ח","ט","י","ך","כ","ל","ם","מ","ן","נ","ס","ע","ף","פ","ץ","צ","ק","ר","ש","ת"],
  },
  {
    id: "devanagari",
    title: "Devanagari",
    subsets: ["devanagari"],
    glyphs: ["अ","आ","इ","ई","उ","ऊ","ऋ","ए","ऐ","ओ","औ","क","ख","ग","घ","ङ","च","छ","ज","झ","ञ","ट","ठ","ड","ढ","ण","त","थ","द","ध","न","प","फ","ब","भ","म","य","र","ल","व","श","ष","स","ह","क्ष","त्र","ज्ञ"],
  },
  {
    id: "thai",
    title: "Thai",
    subsets: ["thai"],
    glyphs: ["ก","ข","ฃ","ค","ฅ","ฆ","ง","จ","ฉ","ช","ซ","ฌ","ญ","ฎ","ฏ","ฐ","ฑ","ฒ","ณ","ด","ต","ถ","ท","ธ","น","บ","ป","ผ","ฝ","พ","ฟ","ภ","ม","ย","ร","ล","ว","ศ","ษ","ส","ห","ฬ","อ","ฮ","ะ","า","ำ","ิ","ี","ึ","ื","ุ","ู","ฺ","เ","แ","โ","ใ","ไ","ๆ"],
  },
  {
    id: "korean",
    title: "Korean Hangul",
    subsets: ["korean"],
    glyphs: ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ","ㅏ","ㅑ","ㅓ","ㅕ","ㅗ","ㅛ","ㅜ","ㅠ","ㅡ","ㅣ","가","나","다","라","마","바","사","아","자","차","카","타","파","하"],
  },
]

function isGroupVisible(group: GlyphGroup, font: FontMeta): boolean {
  if (group.subsets.includes("*")) return true
  return group.subsets.some((s) => font.subsets.includes(s))
}

export default function GlyphsAndLanguages({ font }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    GROUPS.forEach((g, i) => {
      init[g.id] = i < 2 // first two open like Google Fonts
    })
    return init
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        ensureFont(font)
          .then(() => setLoaded(true))
          .catch(() => setLoaded(true))
      },
      { rootMargin: "200px" },
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [font])

  const visibleGroups = GROUPS.filter((g) => isGroupVisible(g, font))
  const activeGlyph = hovered ?? selected ?? visibleGroups[0]?.glyphs[0] ?? "a"
  const activeTitle = selected ? `Selected · ${selected}` : hovered ? `Hovering · ${hovered}` : `${visibleGroups[0]?.title ?? "Glyph"} · ${activeGlyph}`

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Only a subset of all the glyphs are shown here. Download the font to view the full set or
        try it out in the{" "}
        <a href="#specimen" className="underline underline-offset-4 hover:text-foreground">
          type tester
        </a>
        .
      </p>

      <div className="flex flex-wrap gap-2">
        {font.subsets.map((subset) => (
          <Badge key={subset} variant="secondary" className="capitalize">
            {subset}
          </Badge>
        ))}
        <Badge variant="outline" className="font-normal">
          {font.weights.length * font.styles.length} styles • {font.category}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Left: categorized grids */}
        <div className="flex flex-col gap-4">
          {visibleGroups.map((group) => {
            const open = expanded[group.id] ?? false
            return (
              <section key={group.id} className="overflow-hidden rounded-xl border bg-card">
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => ({ ...prev, [group.id]: !open }))}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-accent/50"
                  aria-expanded={open}
                >
                  <span className="text-sm font-medium">{group.title}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {group.glyphs.length} glyphs
                    {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </span>
                </button>

                {open && (
                  <div className="border-t">
                    <div
                      className="grid grid-cols-7 gap-px bg-border sm:grid-cols-9"
                      role="list"
                      aria-label={`${font.family} ${group.title}`}
                    >
                      {group.glyphs.map((glyph) => {
                        const isActive = activeGlyph === glyph
                        return (
                          <div
                            key={`${group.id}-${glyph}`}
                            role="listitem"
                            tabIndex={0}
                            aria-label={glyph}
                            onMouseEnter={() => setHovered(glyph)}
                            onMouseLeave={() => setHovered(null)}
                            onFocus={() => setHovered(glyph)}
                            onBlur={() => setHovered(null)}
                            onClick={() => setSelected(glyph)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                setSelected(glyph)
                              }
                            }}
                            className={[
                              "flex aspect-square items-center justify-center bg-card text-lg transition-colors",
                              "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                              isActive ? "bg-accent text-foreground ring-1 ring-inset ring-ring" : "",
                            ].join(" ")}
                            style={loaded ? { fontFamily: familyCss(font) } : undefined}
                          >
                            {loaded ? (
                              glyph
                            ) : (
                              <Skeleton className="size-6" aria-hidden="true" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </section>
            )
          })}
        </div>

        {/* Right: large preview like Google Fonts */}
        <div className="hidden lg:block">
          <div className="sticky top-28 rounded-xl border bg-card p-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {activeTitle}
            </p>
            <div className="flex min-h-[320px] items-center justify-center rounded-lg bg-muted/30 p-8">
              {loaded ? (
                <span
                  className="select-none text-[8rem] leading-none tracking-tighter"
                  style={{ fontFamily: familyCss(font) }}
                  aria-hidden="true"
                >
                  {activeGlyph}
                </span>
              ) : (
                <Skeleton className="size-32 rounded-xl" />
              )}
            </div>
            <div className="mt-4 flex flex-col gap-1 text-sm">
              <span className="font-medium">{activeGlyph}</span>
              <span className="font-mono text-xs text-muted-foreground">
                U+{activeGlyph.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0")}
                {" · "}
                {loaded ? font.family : "Loading…"}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Hover any glyph on the left. Click to pin it here. Supports {font.subsets.length}{" "}
              writing systems: {font.subsets.slice(0, 4).join(", ")}
              {font.subsets.length > 4 ? "…" : ""}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
