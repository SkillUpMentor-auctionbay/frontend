import React from 'react';
import { cn } from '@/lib/utils';

interface ImageFallbackProps {
  children?: React.ReactNode;
  fallbackType?: 'text' | 'initials';
  text?: string;
  initials?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function ImageFallback({
  children,
  fallbackType = 'text',
  text = 'No Image!',
  initials,
  className = '',
  size = 'full'
}: ImageFallbackProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-32 h-32 text-base',
    full: 'w-full h-full text-base'
  };

  const baseClasses = 'flex items-center justify-center bg-gray-200 text-gray-500 rounded';
  const classes = cn(baseClasses, sizeClasses[size], className);

  if (fallbackType === 'initials' && initials) {
    return (
      <div className={classes}>
        <span className="font-medium">{initials}</span>
      </div>
    );
  }

  return (
    <div className={classes}>
      {children || <span>{text}</span>}
    </div>
  );
}