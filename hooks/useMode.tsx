"use client"
import { usePathname } from "next/navigation"

export const useMode = () => {
    const pathname = usePathname()
    return pathname.startsWith("/passwords") ? "online" : "offline"
}