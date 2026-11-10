'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause } from '@/commons/components/icons/Pause';
import { Play } from '@/commons/components/icons/Play';

interface VideoBackgroundProps {
  src: string;
  /** Primer fotograma en imagen: cubre el hueco hasta que el vídeo puede pintar. */
  poster?: string;
  /** Si es `false` el vídeo se pausa (p. ej. al salir de la home). */
  active?: boolean;
  playbackRate?: number;
  opacity?: number;
  blur?: number;
}

export const VideoBackground = ({
  src,
  poster,
  active = true,
  playbackRate = 0.75,
  opacity = 0.5,
  blur = 2,
}: VideoBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // El vídeo solo se monta cuando el panel llega a verse. En móvil el panel
  // está en `display: none`, así que no se descarga ni un byte.
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Un panel colapsado (`lg:w-0`) o en `display: none` no debe cargar
        // nada: solo se monta el vídeo cuando hay ancho real que pintar.
        if (!entry.isIntersecting || node.getBoundingClientRect().width === 0) {
          return;
        }

        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !visible) {
      return;
    }

    video.playbackRate = playbackRate;

    if (!active || !isPlaying) {
      video.pause();
      return;
    }

    // El navegador puede bloquear el autoplay: el botón refleja el estado real.
    void video.play().catch(() => setIsPlaying(false));
  }, [active, isPlaying, playbackRate, visible]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-[#1e1820]"
    >
      {/* Póster + vídeo comparten capa para aplicar el desenfoque una sola vez.
          `-inset-2` evita el borde translúcido que deja el filtro. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2"
        style={{ filter: `blur(${blur}px)` }}
      >
        {poster ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${poster}")` }}
          />
        ) : null}
        {visible ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            onLoadedData={() => setReady(true)}
            onPlaying={() => setReady(true)}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            style={{ opacity: ready ? opacity : 0 }}
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : null}
      </div>

      <div className="relative z-10 p-8 pb-12">
        <p className="font-display text-display-md font-semibold leading-display tracking-display text-white mb-2">
          ClaveVault
        </p>
        <p className="text-body leading-body text-zinc-400 max-w-xs">
          Tus contraseñas, tu control. Encriptación local, cero servidores.
        </p>
      </div>

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
