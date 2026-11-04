import { forwardRef } from 'react';

import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <>
        <input
          type={type}
          className={clsx(
            'border-career-input-border placeholder:text-career-muted focus-visible:border-primary flex h-11 w-full rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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
Input.displayName = 'Input';

export { Input };
