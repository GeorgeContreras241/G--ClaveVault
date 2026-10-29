'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sileo';
import { sileoDefaults } from '@/commons/constants/sileoConfig';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster position="top-center" options={sileoDefaults} />
    </ThemeProvider>
  );
}
