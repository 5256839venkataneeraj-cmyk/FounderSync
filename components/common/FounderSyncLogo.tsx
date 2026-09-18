import React from 'react';

export type LogoVariant = 'horizontal' | 'icon' | 'full' | 'wordmark';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface FounderSyncLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  showWordmark?: boolean;
}

const sizeConfig: Record<
  LogoSize,
  {
    iconH: string;
    iconW: string;
    fullH: string;
    wordmarkH: string;
    gap: string;
  }
> = {
  xs: {
    iconH: 'h-5',
    iconW: 'w-auto',
    fullH: 'h-8',
    wordmarkH: 'h-3.5',
    gap: 'gap-1.5',
  },
  sm: {
    iconH: 'h-6 sm:h-7',
    iconW: 'w-auto',
    fullH: 'h-10',
    wordmarkH: 'h-4 sm:h-4.5',
    gap: 'gap-2',
  },
  md: {
    iconH: 'h-8 sm:h-9',
    iconW: 'w-auto',
    fullH: 'h-14',
    wordmarkH: 'h-5 sm:h-5.5',
    gap: 'gap-2.5',
  },
  lg: {
    iconH: 'h-11 sm:h-12',
    iconW: 'w-auto',
    fullH: 'h-20',
    wordmarkH: 'h-7 sm:h-8',
    gap: 'gap-3',
  },
  xl: {
    iconH: 'h-16 sm:h-20',
    iconW: 'w-auto',
    fullH: 'h-28 sm:h-32',
    wordmarkH: 'h-10 sm:h-12',
    gap: 'gap-4',
  },
};

export function FounderSyncLogo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showWordmark = true,
}: FounderSyncLogoProps) {
  const cfg = sizeConfig[size] || sizeConfig.md;

  if (variant === 'icon') {
    return (
      <img
        src="/logo-mark.png"
        alt="FounderSync Emblem"
        className={`${cfg.iconH} ${cfg.iconW} object-contain select-none shrink-0 drop-shadow-xs transition-transform ${className}`}
        loading="eager"
      />
    );
  }

  if (variant === 'wordmark') {
    return (
      <img
        src="/logo-wordmark.png"
        alt="FounderSync"
        className={`${cfg.wordmarkH} w-auto object-contain select-none shrink-0 ${className}`}
        loading="eager"
      />
    );
  }

  if (variant === 'full') {
    return (
      <img
        src="/logo-full.png"
        alt="FounderSync"
        className={`${cfg.fullH} w-auto object-contain select-none shrink-0 ${className}`}
        loading="eager"
      />
    );
  }

  // Default: Horizontal (Icon mark + Typography wordmark)
  return (
    <div className={`inline-flex items-center ${cfg.gap} select-none shrink-0 ${className}`}>
      <img
        src="/logo-mark.png"
        alt="FounderSync Emblem"
        className={`${cfg.iconH} ${cfg.iconW} object-contain shrink-0 drop-shadow-xs`}
        loading="eager"
      />
      {showWordmark && (
        <img
          src="/logo-wordmark.png"
          alt="FounderSync"
          className={`${cfg.wordmarkH} w-auto object-contain shrink-0`}
          loading="eager"
        />
      )}
    </div>
  );
}

export default FounderSyncLogo;
