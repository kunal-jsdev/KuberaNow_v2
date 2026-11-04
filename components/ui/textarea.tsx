import { forwardRef } from 'react';

import clsx from 'clsx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <>
        <textarea
          className={clsx(
            'border-career-input-border placeholder:text-career-muted focus-visible:border-primary flex min-h-15 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 bg-white focus-visible:border-red-500',
            !error && props.value && 'bg-[#EFEFFF] focus:bg-white',
            !error && !props.value && 'bg-white',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className='text-xs text-red-500'>{error}</span>}
      </>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
