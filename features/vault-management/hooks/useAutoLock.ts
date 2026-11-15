'use client';
import { useEffect } from 'react';
import { useStoragePass } from '@/commons/storage/useStoragePass';

/** Tiempo de inactividad antes de bloquear la bóveda y limpiar la memoria. */
const IDLE_LOCK_MS = 5 * 60 * 1000;

/**
 * Reiniciar el temporizador cuesta poco, pero `scroll` dispara decenas de
 * eventos por segundo. Con marcar actividad una vez por segundo sobra para
 * un contador de 5 minutos.
 */
const ACTIVITY_THROTTLE_MS = 1000;

/**
 * Bloqueo automático: tras N minutos sin interacción limpia el store (clave
 * derivada y contraseñas en claro). `onLock` permite al contenedor reaccionar
 * (p. ej. volver al formulario de master key).
 *
 * No se bloquea al ocultar la pestaña: cambiar de pestaña o minimizar no debe
 * cerrar la sesión. El temporizador de inactividad sigue vigente.
 */
export function useAutoLock(onLock?: () => void, enabled = true) {
  const handleReset = useStoragePass((state) => state.handleReset);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let lastActivity = 0;

    const lock = () => {
      clearTimeout(timer);
      void handleReset();
      onLock?.();
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(lock, IDLE_LOCK_MS);
    };

    const markActivity = () => {
      const now = Date.now();
      if (now - lastActivity < ACTIVITY_THROTTLE_MS) {
        return;
      }
      lastActivity = now;
      resetTimer();
    };

    resetTimer();
    window.addEventListener('pointerdown', markActivity);
    window.addEventListener('keydown', markActivity);
    // `scroll` no burbujea: con captura se detecta también el scroll de
    // contenedores internos (SplitLayout, .vault-scroll), no solo el de window.
    window.addEventListener('scroll', markActivity, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', markActivity);
      window.removeEventListener('keydown', markActivity);
      window.removeEventListener('scroll', markActivity, true);
    };
  }, [enabled, handleReset, onLock]);
}
