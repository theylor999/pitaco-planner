
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely access the theme
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return null or a placeholder to avoid hydration mismatch
    // Returning null means the button won't render on the server or initial client paint
    return null
  }

  // When mounted, use theme or resolvedTheme to determine the current actual theme
  // If theme is 'system', resolvedTheme will be 'light' or 'dark'
  const currentActualTheme = theme === "system" ? resolvedTheme : theme

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(currentActualTheme === "light" ? "dark" : "light")}
      aria-label={currentActualTheme === "light" ? "Mudar para tema escuro" : "Mudar para tema claro"}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
