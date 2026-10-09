'use client';
import type { OfflineShellProps } from '@/features/offline';

export function OfflineShell({ children }: OfflineShellProps) {
  return (
    <section className="flex flex-col h-[100dvh] w-full">
      <main>{children}</main>
    </section>
  );
}
