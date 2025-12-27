"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // 1. Evitem errors d'hidratació (el servidor no sap el tema de l'usuari)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Retornem un espai buit de la mateixa mida per evitar salts visuals
    return <div className="w-9 h-9" />
  }

  // 2. Determinem si és fosc basant-nos en el tema RESOLT (inclou 'system')
  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full relative w-9 h-9 border border-transparent hover:bg-muted/50"
      aria-label={isDark ? "Activar mode clar" : "Activar mode fosc"}
    >
      {/* ☀️ SOL: Es mostra quan NO és fosc */}
      <Sun 
        className={`h-5 w-5 transition-all duration-300 absolute ${
          isDark 
            ? 'scale-0 rotate-90 opacity-0' // Si és fosc: Amaga't
            : 'scale-100 rotate-0 opacity-100' // Si és clar: Mostra't
        }`} 
      />
      
      {/* 🌙 LLUNA: Es mostra quan ÉS fosc */}
      <Moon 
        className={`h-5 w-5 transition-all duration-300 absolute ${
          isDark 
            ? 'scale-100 rotate-0 opacity-100' // Si és fosc: Mostra't
            : 'scale-0 -rotate-90 opacity-0'   // Si és clar: Amaga't
        }`} 
      />
    </Button>
  )
}