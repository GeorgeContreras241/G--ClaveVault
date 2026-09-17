"use client"

import { useRef, useEffect, useState } from "react"

interface VideoBackgroundProps {
  src: string
  playbackRate?: number
  opacity?: number
  blur?: number
}

export const VideoBackground = ({
  src,
  playbackRate = 0.75,
  opacity = 0.5,
  blur = 2,
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = playbackRate

    const handleLoaded = () => setLoaded(true)
    video.addEventListener("loadeddata", handleLoaded)
    return () => video.removeEventListener("loadeddata", handleLoaded)
  }, [playbackRate])

  return (
    <div className="relative w-full h-full bg-zinc-900 flex flex-col justify-start overflow-hidden">
      <div className="relative z-10 p-8 pb-12">
        <h1 className="font-sora text-4xl font-bold text-white mb-2">ClaveVault</h1>
        <p className="text-zinc-400 text-sm max-w-xs">Tus contraseñas, tu control. Encriptación local, cero servidores.</p>
      </div>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ opacity: loaded ? opacity : 0, filter: `blur(${blur}px)` }}
      >
        <source src={src} type="video/mp4" />
      </video>

    </div>
  )
}
