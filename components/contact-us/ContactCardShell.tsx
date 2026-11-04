import type { ReactNode } from 'react';

type ContactCardShellProps = {
  children: ReactNode;
  className?: string;
  padding?: 'desktop' | 'mobile';
};

export default function ContactCardShell({
  children,
  className = '',
  padding = 'desktop',
}: ContactCardShellProps) {
  const paddingClass =
    padding === 'mobile' ? 'p-3 rounded-md' : 'p-5 rounded-lg';

  return (
    <article
      className={`border-career-stroke bg-surface shadow-contact-card border ${paddingClass} ${className}`}
    >
      {children}
    </article>
  );
}
