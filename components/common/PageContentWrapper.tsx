import type { ReactNode } from 'react';

type PageContentWrapperProps = {
  children: ReactNode;
  className?: string;
};

export default function PageContentWrapper({
  children,
  className = '',
}: PageContentWrapperProps) {
  return (
    <div
      className={`border-border-soft bg-surface rounded-lg border p-4 shadow-sm md:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
