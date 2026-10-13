'use client';
import type { VaultPanelProps } from '@/features/online';

export function VaultPanel({ children, className }: VaultPanelProps) {
  return (
    <div
      className={`vault-panel rounded-xl p-4 md:p-6${
        className ? ` ${className}` : ''
      }`}
    >
      {children}
    </div>
  );
}
