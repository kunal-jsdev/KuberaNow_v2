import { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-career-dark text-sm font-semibold'>
        {label} {required && <span className='text-red-900'>*</span>}
      </label>
      {children}
    </div>
  );
}
