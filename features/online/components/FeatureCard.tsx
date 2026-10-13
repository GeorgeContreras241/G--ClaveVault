'use client';
import type { FeatureCardProps } from '@/features/online';

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="vault-action-card border border-neutral-900 rounded-xl p-3.5 md:p-5 flex flex-row items-center gap-3 md:gap-4 text-left group cursor-default">
      <div className="vault-icon-frame w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="font-sora font-semibold text-xs md:text-sm mb-0.5 md:mb-1">
          {title}
        </h3>
        <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
