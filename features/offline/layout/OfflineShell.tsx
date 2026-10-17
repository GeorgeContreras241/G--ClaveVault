'use client';
import type { OfflineShellProps } from '@/features/offline';

export function OfflineShell({ children }: OfflineShellProps) {
  return (
    <section className="flex w-full flex-1 flex-col">
      <main className="flex flex-1 flex-col">{children}</main>
    </section>
  );
}
