import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SelectButtonProps {
  fontId: string
  family: string
  variant?: "outline" | "ghost"
  className?: string
}

export function SelectButton({ fontId, family, variant = "outline", className }: SelectButtonProps) {
  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent("fontora:toggle-select", { detail: fontId }))}
      aria-label={`Add ${family} to selection`}
    >
      <Plus data-icon="inline-start" />
      Add to selection
    </Button>
  )
}
