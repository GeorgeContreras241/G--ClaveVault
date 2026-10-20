'use client';
import { useEffect } from 'react';
import { useStoragePass } from '@/commons/storage/useStoragePass';

/** Tiempo de inactividad antes de bloquear la bóveda y limpiar la memoria. */
const IDLE_LOCK_MS = 5 * 60 * 1000;

/**
 * Bloqueo automático: tras N minutos sin interacción (o al ocultar la pestaña)
 * limpia el store (clave derivada y contraseñas en claro). `onLock` permite al
 * contenedor reaccionar (p. ej. volver al formulario de master key).
 */
export function useAutoLock(onLock?: () => void, enabled = true) {
  const handleReset = useStoragePass((state) => state.handleReset);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const lock = () => {
      clearTimeout(timer);
      void handleReset();
      onLock?.();
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(lock, IDLE_LOCK_MS);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lock();
      }
    };

    resetTimer();
    window.addEventListener('pointerdown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, handleReset, onLock]);
}
