"use client"

import { useRef, useEffect, useState } from "react"

interface VideoBackgroundProps {
  src: string
  playbackRate?: number
  opacity?: number
}

export const VideoBackground = ({
  src,
  playbackRate = 0.75,
  opacity = 0.5,
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = playbackRate
  }, [playbackRate])

  return (
    <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="relative z-10 text-center p-8">
        <h1 className="font-sora text-4xl font-bold text-white mb-4">ClaveVault</h1>
        <p className="text-zinc-300 text-lg max-w-md">Tus contraseñas, tu control. Encriptación local, cero servidores.</p>
      </div>
    </div>
  )
}
