'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

const TextAreaField = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
  }
>(({ className, label, ...props }, ref) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="font-light leading-6 text-base text-gray-90">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'flex items-center bg-white border border-gray-20 text-gray-40 font-light text-base rounded-2xl px-4 py-2 transition-all w-full min-h-[155px] resize-none outline-none',
          'hover:border-gray-30',
          'focus-within:border-primary-50 focus-within:text-gray-90',
          'placeholder:text-gray-60',
          className,
        )}
        {...props}
      />
    </div>
  );
});

TextAreaField.displayName = 'TextAreaField';

export { TextAreaField };
