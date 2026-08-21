import { Type } from "lucide-react"
import { FaGithub } from "react-icons/fa6"
import { buttonVariants } from "@/components/ui/button"

/**
 * Floating dock — w-full, detached with inset spacing.
 */
export function DockNav() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        className="flex h-14 w-full max-w-[1400px] items-center justify-between rounded-xl border bg-background/70 px-4 shadow-lg shadow-black/5 backdrop-blur-md md:px-6"
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
