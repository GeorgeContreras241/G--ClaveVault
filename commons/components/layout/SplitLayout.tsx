'use client';

import { usePathname } from 'next/navigation';
import { VideoBackground } from '@/commons/components/shared/VideoBackground';
import { AppProviders } from '@/commons/components/providers/AppProviders';
import { ASSETS } from '@/commons/constants/assets';

export const SplitLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className="flex flex-col lg:flex-row h-dvh overflow-hidden">
      {/* Video - se oculta al navegar. El componente se mantiene montado para
          no repetir la carga (ni el fundido) al volver a la home; fuera de
          ella solo se pausa. */}
      <div
        className={`hidden lg:block transition-all duration-500 ease-in-out overflow-hidden ${
          isHome ? 'lg:w-1/2 opacity-100' : 'lg:w-0 opacity-0'
        }`}
      >
        <VideoBackground
          src={ASSETS.video.background}
          poster={ASSETS.video.backgroundPoster}
          active={isHome}
          playbackRate={0.7}
          opacity={0.5}
          blur={3}
        />
      </div>

      {/* Contenido - se expande al navegar */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto transition-all duration-500 ease-in-out ${
          isHome ? '' : 'lg:w-full'
        }`}
      >
        <div className="flex min-h-full flex-col items-center justify-center">
          <AppProviders>{children}</AppProviders>
        </div>
      </div>
    </div>
  );
};
