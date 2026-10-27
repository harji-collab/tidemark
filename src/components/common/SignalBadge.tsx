import React from 'react';

export type SignalType = 'hazard' | 'caution' | 'healthy' | 'info';

interface SignalBadgeProps {
  type: SignalType;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({
  type,
  label,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  if (type === 'hazard') {
    return (
      <span
        className={`inline-flex items-center rounded-[2px] border border-[#B3135F]/40 bg-[#FDF2F7] text-[#B3135F] dark:border-[#FF6FA8]/40 dark:bg-[#2B0E1E] dark:text-[#FF6FA8] ${sizeClasses} ${className}`}
        role="status"
        aria-label={`Hazard alert: ${label}`}
      >
        <svg className="w-2.5 h-2.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <polygon points="12,3 22,21 2,21" />
        </svg>
        <span>{label}</span>
      </span>
    );
  }

  if (type === 'caution') {
    return (
      <span
        className={`inline-flex items-center rounded-[2px] border border-[#B26A00]/40 bg-[#FEF8EC] text-[#B26A00] dark:border-[#F5B93A]/40 dark:bg-[#2E1F06] dark:text-[#F5B93A] ${sizeClasses} ${className}`}
        role="status"
        aria-label={`Caution: ${label}`}
      >
        <svg className="w-2.5 h-2.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
        <span>{label}</span>
      </span>
    );
  }

  if (type === 'healthy') {
    return (
      <span
        className={`inline-flex items-center rounded-[2px] border border-[#1B7F57]/40 bg-[#F0FDF6] text-[#1B7F57] dark:border-[#4ED39A]/40 dark:bg-[#0A2B1D] dark:text-[#4ED39A] ${sizeClasses} ${className}`}
        role="status"
        aria-label={`Healthy normal status: ${label}`}
      >
        <svg className="w-2.5 h-2.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
        </svg>
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-[2px] border border-[#1F7280]/30 bg-[#F2F7F6] text-[#1F7280] dark:border-[#2EA2B5]/30 dark:bg-[#0E2A3C] dark:text-[#2EA2B5] ${sizeClasses} ${className}`}
      role="status"
    >
      <span className="text-[10px] leading-none select-none" aria-hidden="true">■</span>
      <span>{label}</span>
    </span>
  );
};
