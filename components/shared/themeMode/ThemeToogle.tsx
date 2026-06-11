"use client";

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Dark } from "@/components/icons/Dark"
import { Ligth } from "@/components/icons/Ligth"

export function ThemeToggle({className}: {className?: string}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Esperar a que el componente se monte para evitar hidratación incorrecta
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`flex cursor-pointer items-center justify-center rounded-md bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-inherit transition-all duration-300 ${className ?? ""}`}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {theme === 'dark' ? (
        <Dark />
      ) : (
        <Ligth />
      )}
    </button>
  )
}