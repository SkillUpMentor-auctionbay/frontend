'use client';

import Image from 'next/image';
import * as React from 'react';

// Available icon names from public/icons/
export type IconName =
  | 'Add'
  | 'Home'
  | 'Chevron right'
  | 'Location'
  | 'Eye'
  | 'Check'
  | 'Edit'
  | 'Eur'
  | 'Trending up'
  | 'Settings'
  | 'Time'
  | 'Delete'
  | 'Search'
  | 'Person'
  | 'Notifications none';

export interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  color?: string;
}

// Helper function to convert size to Tailwind classes
const sizeToClass = (size: number | string): string => {
  if (typeof size === 'string') {
    return size; // Allow custom Tailwind classes
  }

  const sizeMap: Record<number, string> = {
    8: 'size-2',
    10: 'size-2.5',
    12: 'size-3',
    14: 'size-3.5',
    16: 'size-4',
    20: 'size-5',
    24: 'size-6',
    28: 'size-7',
    32: 'size-8',
  };

  return sizeMap[size] || `size-[${size}px]`;
};

// Helper function to convert size to numeric value
const sizeToPixels = (size: number | string): number => {
  if (typeof size === 'string') {
    // Extract number from CSS classes like "size-4" -> 16
    const match = size.match(/size-\[(\d+(?:\.\d+)?)px\]/);
    if (match) {
      return parseFloat(match[1]);
    }
    // Fallback for custom classes
    return 16;
  }
  return size;
};

// Helper function to determine filter based on color
const getColorFilter = (color?: string): string => {
  if (!color) return '';

  // Map Tailwind colors to appropriate filters
  const colorFilters: Record<string, string> = {
    'text-white': 'brightness(0) invert(1)',
    'text-gray-90': 'brightness(0) invert(0.1)', // Dark gray
    'text-gray-10': 'brightness(0) invert(0.9)', // Light gray
  };

  return colorFilters[color] || '';
};

export const Icon = React.forwardRef<HTMLImageElement, IconProps>(
  ({ name, size = 16, className, color, ...props }, ref) => {
    const sizeClass = sizeToClass(size);
    const sizePixels = sizeToPixels(size);
    const iconSrc = `/icons/${name}.svg`;
    const colorFilter = getColorFilter(color);

    return (
      <Image
        ref={ref}
        src={iconSrc}
        alt={`${name} icon`}
        width={sizePixels}
        height={sizePixels}
        className={`inline-flex items-center justify-center ${sizeClass} ${className || ''}`}
        style={{
          verticalAlign: 'middle',
          alignSelf: 'center',
          objectFit: 'contain',
          filter: colorFilter || undefined,
        }}
        unoptimized={true} // Keep SVG format for better scaling
        {...props}
      />
    );
  },
);

Icon.displayName = 'Icon';
