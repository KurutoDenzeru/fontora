import { useState } from "react"
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Floating dock navbar: detached pill, hides on scroll-down, reveals on scroll-up.
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
        className="flex h-12 items-center gap-2 rounded-full border bg-background/70 px-2 pl-4 shadow-lg shadow-black/5 backdrop-blur-md"
        aria-label="Main"
      >
        <a href="/" className="mr-2 shrink-0 text-base font-semibold tracking-tight">
          Fontora
        </a>

        <div className="hidden items-center gap-1 sm:flex">
          <a
            href="/"
            className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Catalog
          </a>
          <a
            href="/#collections"
            className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Collections
          </a>
        </div>

        <div className="ml-1">
          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  )
}
