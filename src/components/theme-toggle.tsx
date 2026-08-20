import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Stateless theme toggle: icons swap via the .dark class, no hydration state needed. */
export function ThemeToggle() {
  function toggle() {
    const dark = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("fontora:theme", dark ? "dark" : "light")
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  )
}
