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
      <TabsList className="h-8">
        <TabsTrigger value="system" className="gap-1.5 px-2.5 text-xs">
          <Monitor data-icon="inline-start" />
          System
        </TabsTrigger>
        <TabsTrigger value="light" className="gap-1.5 px-2.5 text-xs">
          <Sun data-icon="inline-start" />
          Light
        </TabsTrigger>
        <TabsTrigger value="dark" className="gap-1.5 px-2.5 text-xs">
          <Moon data-icon="inline-start" />
          Dark
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
