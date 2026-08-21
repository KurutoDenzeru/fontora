import { FaGithub } from "react-icons/fa6"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Floating dock — w-full, detached with inset spacing.
 * Right side: GitHub link, vertical separator, and a sun/moon theme toggle.
 */
export function DockNav() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        className="flex h-14 w-full max-w-[1400px] items-center justify-between rounded-xl border bg-background/70 px-4 shadow-lg shadow-black/5 backdrop-blur-md md:px-6"
        aria-label="Main"
      >
        <a href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <img src="/brand.webp" alt="Fontora" width={28} height={28} className="size-7 rounded-md object-contain" loading="eager" decoding="async" fetchPriority="high" />
          Fontora
        </a>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/KurutoDenzeru/fontora"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <FaGithub data-icon="inline-start" />
            GitHub
          </a>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
