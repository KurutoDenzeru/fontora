import { useEffect, useRef, useState } from "react"
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react"
import { ensureFont, familyCss } from "@/lib/font-loader"
import type { FontMeta } from "@/lib/fonts"

interface Props {
  font: FontMeta
}

/**
 * Family name as the page hero. Variable fonts enter at their lightest weight
 * and sweep to the default, demonstrating the axis range on arrival.
 */
export default function FamilyTitle({ font }: Props) {
  const reduce = useReducedMotion()
  const [loaded, setLoaded] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const wghtAxis = font.variable ? font.axes?.wght : undefined
  const wght = useMotionValue(wghtAxis?.min ?? 400)

  useMotionValueEvent(wght, "change", (v) => {
    if (titleRef.current) {
      titleRef.current.style.fontVariationSettings = `"wght" ${Math.round(v)}`
    }
  })

  useEffect(() => {
    let active = true
    // Variable file so the sweep has something to interpolate.
    ensureFont(font, font.variable ? { variable: true } : {})
      .then(() => active && setLoaded(true))
      .catch(() => active && setLoaded(true))
    return () => {
      active = false
    }
  }, [font])

  useEffect(() => {
    if (!loaded || reduce || !wghtAxis) return
    const controls = animate(wght, wghtAxis.default, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.15,
    })
    return () => controls.stop()
  }, [loaded, reduce, wghtAxis, wght])

  return (
    <motion.h1
      ref={titleRef}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="pb-1 text-[clamp(2.25rem,9vw,7.5rem)] leading-[1.05] font-medium tracking-tight break-words sm:pb-2"
      style={
        loaded
          ? { fontFamily: familyCss(font), ...(wghtAxis ? {} : { fontWeight: 400 }) }
          : undefined
      }
    >
      {font.family}
    </motion.h1>
  )
}
