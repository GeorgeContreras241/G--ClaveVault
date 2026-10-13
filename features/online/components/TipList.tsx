'use client';
import type { TipListProps } from '@/features/online';

export function TipList({ items }: TipListProps) {
  return (
    <ul className="space-y-2.5 md:space-y-3 text-xs md:text-sm text-muted-foreground">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-vault-amber" />
          {item}
        </li>
      ))}
    </ul>
  );
}
