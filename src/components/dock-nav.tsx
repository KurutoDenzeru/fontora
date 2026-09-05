import { FaGithub } from "react-icons/fa6"
import { motion, useReducedMotion } from "motion/react"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Floating split dock — two detached glass capsules: brand left, actions right.
 * Blur-reveal drop on mount (skipped under reduced motion); capsules magnify on
 * hover and compress on press.
 */
export function DockNav() {
  const reduce = useReducedMotion()

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex items-center justify-between px-3 sm:px-4">
      <motion.a
        href="/"
        aria-label="Fontora home"
        initial={reduce ? false : { y: -14, opacity: 0, filter: "blur(6px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        whileHover={reduce ? undefined : { scale: 1.03 }}
        whileTap={reduce ? undefined : { scale: 0.96 }}
        className="group flex h-12 items-center gap-2.5 rounded-full border bg-background/70 pl-2 pr-4 shadow-md shadow-black/5 backdrop-blur-xl"
      >
        <img
          src="/brand-128.png"
          alt="Fontora"
          width={24}
          height={24}
          className="size-6 rounded-md object-contain transition-transform duration-300 group-hover:-rotate-6"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <span className="text-[15px] font-semibold tracking-tight">Fontora</span>
      </motion.a>

      <motion.div
        initial={reduce ? false : { y: -14, opacity: 0, filter: "blur(6px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        whileHover={reduce ? undefined : { scale: 1.02 }}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        className="flex h-12 items-center gap-1 rounded-full border bg-background/70 px-1.5 shadow-md shadow-black/5 backdrop-blur-xl"
      >
        <a
          href="https://github.com/KurutoDenzeru/fontora"
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "ghost", className: "h-8 rounded-full px-3" })}
        >
          <FaGithub data-icon="inline-start" />
          GitHub
        </a>
        <Separator orientation="vertical" className="mx-0.5 h-5" />
        <ThemeToggle />
      </motion.div>
    </header>
  )
}
