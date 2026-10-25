'use client';

import { useRef, useEffect, useState } from 'react';
import { Pause } from '@/commons/components/icons/Pause';
import { Play } from '@/commons/components/icons/Play';

interface VideoBackgroundProps {
  src: string;
  playbackRate?: number;
  opacity?: number;
  blur?: number;
}

export const VideoBackground = ({
  src,
  playbackRate = 0.75,
  opacity = 0.5,
  blur = 2,
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.playbackRate = playbackRate;

    const handleLoaded = () => setLoaded(true);
    // Mantiene el botón sincronizado si el navegador bloquea la reproducción
    // automática o si el usuario pausa el vídeo desde los controles nativos.
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !loaded) {
      return;
    }

    if (isPlaying) {
      void video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying, loaded]);

  return (
    <div className="relative w-full h-full bg-zinc-900 flex flex-col justify-start overflow-hidden">
      <div className="relative z-10 p-8 pb-12">
        <h1 className="font-display text-display-lg font-semibold leading-display tracking-display text-white mb-2">
          ClaveVault
        </h1>
        <p className="text-body leading-body text-zinc-400 max-w-xs">
          Tus contraseñas, tu control. Encriptación local, cero servidores.
        </p>
      </div>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ opacity: loaded ? opacity : 0, filter: `blur(${blur}px)` }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={() => setIsPlaying((playing) => !playing)}
        aria-label={
          isPlaying ? 'Pausar vídeo de fondo' : 'Reproducir vídeo de fondo'
        }
        aria-pressed={!isPlaying}
        className="absolute bottom-6 right-6 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {isPlaying ? <Pause /> : <Play />}
      </button>
    </div>
  );
};
