import { useEffect, useState } from "react"
import { ensureFont, familyCss } from "@/lib/font-loader"
import type { FontMeta } from "@/lib/fonts"

interface Props {
  font: FontMeta
}

export default function FamilyTitle({ font }: Props) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    ensureFont(font)
      .then(() => active && setLoaded(true))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [font])

  return (
    <h1
      className="text-5xl font-medium tracking-tight md:text-7xl"
      style={loaded ? { fontFamily: familyCss(font) } : undefined}
    >
      {font.family}
    </h1>
  )
}
