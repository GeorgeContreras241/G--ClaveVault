export const ASSETS = {
  video: {
    background: '/video/fondo.mp4',
    // Primer fotograma del vídeo: se pinta al instante y evita el flash negro
    // mientras el navegador descarga y decodifica el MP4.
    backgroundPoster: '/video/fondo-poster.webp',
    backgrounds: [
      '/video/fondo.mp4',
      // Agrega más videos aquí:
      // "/video/otro-video.mp4",
    ],
  },
} as const;
