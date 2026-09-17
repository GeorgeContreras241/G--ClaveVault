"use client"

import { usePathname } from "next/navigation"
import { VideoBackground } from "@/components/shared/VideoBackground"
import { AppProviders } from "@/components/providers/AppProviders"
import { ASSETS } from "@/const/assets"
import { useEffect, useState } from "react"

export const SplitLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  console.log("pathname", pathname)
  const isHome = pathname === "/"
  const [showVideo, setShowVideo] = useState(isHome)

  useEffect(() => {
    if (isHome) {
      setShowVideo(true)
    } else {
      const timer = setTimeout(() => setShowVideo(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isHome])

  return (
    <div className="flex flex-col lg:flex-row h-dvh overflow-hidden">
      {/* Video - se oculta al navegar */}
      <div
        className={`hidden lg:block transition-all duration-500 ease-in-out overflow-hidden ${
          isHome ? "lg:w-1/2 opacity-100" : "lg:w-0 opacity-0"
        }`}
      >
        {showVideo && (
          <VideoBackground
            src={ASSETS.video.background}
            playbackRate={0.7}
            opacity={0.5}
            blur={3}
          />
        )}
      </div>

      {/* Contenido - se expande al navegar */}
      <div
        className={`flex-1 flex items-center justify-center p-4 lg:p-8 transition-all duration-500 ease-in-out ${
          isHome ? "" : "lg:w-full"
        }`}
      >
        <AppProviders>{children}</AppProviders>
      </div>
    </div>
  )
}
