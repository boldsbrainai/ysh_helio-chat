import { useEffect } from "react"
import { useKV } from "@github/spark/hooks"

export type Theme = "light" | "dark" | "system"

export function useTheme() {
  const [theme, setTheme] = useKV<Theme>("app-theme", "system")

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    const currentTheme = theme || "system"
    let effectiveTheme = currentTheme

    if (currentTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      effectiveTheme = systemTheme
    }

    root.classList.add(effectiveTheme as string)
  }, [theme])

  useEffect(() => {
    const currentTheme = theme || "system"
    if (currentTheme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      
      const systemTheme = mediaQuery.matches ? "dark" : "light"
      root.classList.add(systemTheme)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  return { theme, setTheme }
}
