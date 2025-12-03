import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Icon } from './icon';

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-2 font-light whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors',
  {
    variants: {
      size: {
        default: 'px-2 py-0.5 rounded-2xl text-base leading-6',
        small: 'px-1 py-0.5 rounded-lg text-[10px] leading-3',
      },
      variant: {
        'in-progress': 'bg-primary-30 text-text-primary',
        outbid: 'bg-coral-30 text-text-primary',
        winning: 'bg-[#ADFF90] text-text-primary',
        done: 'bg-gray-50 text-white',
        time: 'text-text-primary',
        'time-urgent': 'bg-coral-30 text-text-primary',
        'time-outbid': 'bg-coral-30 text-text-primary',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'in-progress',
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  children,
  showTimeIcon = false,
  timeIconSize,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    showTimeIcon?: boolean;
    timeIconSize?: number | string;
  }) {
  const Comp = asChild ? Slot : 'span';

  const getTimeIconSize = () => {
    if (timeIconSize) return timeIconSize;
    return size === 'small' ? 12 : 20;
  };

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {showTimeIcon && (
        <Icon name="Time" size={getTimeIconSize()} className="shrink-0" />
      )}
    </Comp>
  );
}

export { Badge, badgeVariants };
