import { Type } from "lucide-react"
import { FaGithub } from "react-icons/fa6"
import { buttonVariants } from "@/components/ui/button"

/**
 * Sticky full-width navbar — brand with lucide mark on the left,
 * GitHub action on the right. Detached floating behavior removed
 * per latest direction; remains visible at all scroll positions.
 */
export function DockNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 md:px-6"
        aria-label="Main"
      >
        <a href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Type className="size-3.5" />
          </span>
          Fontora
        </a>

        <a
          href="https://github.com/KurutoDenzeru/fontora"
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <FaGithub data-icon="inline-start" />
          GitHub
        </a>
      </nav>
    </header>
  )
}
