import type { ReactNode } from 'react';

type ContactIconBadgeProps = {
  children: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
};

export default function ContactIconBadge({
  children,
  size = 'md',
  className = '',
}: ContactIconBadgeProps) {
  const sizeClass = size === 'sm' ? 'h-6 w-6 rounded' : 'h-8 w-8 rounded-md';

  return (
    <div
      className={`bg-contact-gradient flex shrink-0 items-center justify-center p-1 text-white md:p-2 ${sizeClass} ${className}`}
    >
      {children}
    </div>
  );
}
