import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Theme = "system" | "light" | "dark"

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", isDark)
}

export function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>("system")

  useEffect(() => {
    const stored = (localStorage.getItem("fontora:theme") as Theme | null) ?? "system"
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
    setTheme(stored)
    applyTheme(stored)

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const current = (localStorage.getItem("fontora:theme") as Theme | null) ?? "system"
      if (current === "system") applyTheme("system")
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  function onValueChange(value: string) {
    const next = value as Theme
    setTheme(next)
    localStorage.setItem("fontora:theme", next)
    applyTheme(next)
  }

  return (
    <Tabs value={theme} onValueChange={onValueChange} className="w-fit">
      <TabsList className="h-7 p-1">
        <TabsTrigger value="system" aria-label="System theme" className="px-2">
          <Monitor className="size-3.5" />
        </TabsTrigger>
        <TabsTrigger value="light" aria-label="Light theme" className="px-2">
          <Sun className="size-3.5" />
        </TabsTrigger>
        <TabsTrigger value="dark" aria-label="Dark theme" className="px-2">
          <Moon className="size-3.5" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
