'use client';

import { Sparkles } from 'lucide-react';

interface GeminiBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle';
  showText?: boolean;
}

export default function GeminiBadge({
  size = 'md',
  variant = 'default',
  showText = true,
}: GeminiBadgeProps) {
  const sizeClasses = {
    sm: {
      container: 'px-2 py-0.5 gap-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    lg: {
      container: 'px-4 py-2 gap-2',
      icon: 'w-5 h-5',
      text: 'text-base',
    },
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30',
    subtle: 'bg-accent-purple/10 border border-accent-purple/20',
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center rounded-full ${classes.container} ${variantClasses[variant]}`}
    >
      <Sparkles className={`${classes.icon} text-accent-purple`} />
      {showText && (
        <span
          className={`${classes.text} font-medium bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent`}
        >
          AI 동화
        </span>
      )}
    </div>
  );
}
