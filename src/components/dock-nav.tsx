import { useState } from "react"
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"

/**
 * Floating dock navbar — minimal brand mark, detached pill.
 */
export function DockNav() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 140)
  })

  return (
    <motion.header
      animate={{ y: hidden && !reduce ? "-140%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav
        className="flex h-10 items-center rounded-full border bg-background/70 px-4 shadow-lg shadow-black/5 backdrop-blur-md"
        aria-label="Main"
      >
        <a href="/" className="text-sm font-semibold tracking-tight">
          Fontora
        </a>
      </nav>
    </motion.header>
  )
}
