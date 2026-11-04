type PaginationItemProps = {
  children: React.ReactNode;
  active?: boolean;
  'aria-label'?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function PaginationItem({
  children,
  active = false,
  'aria-label': ariaLabel,
  onClick,
  disabled = false,
}: PaginationItemProps) {
  let variantClasses = '';

  if (active) {
    variantClasses = 'bg-primary text-white';
  } else if (disabled) {
    variantClasses = 'invisible pointer-events-none';
  } else {
    variantClasses =
      'border border-career-stroke bg-surface text-career-dark hover:bg-career-stroke';
  }

  return (
    <button
      type='button'
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`flex size-8.5 items-center justify-center rounded-sm text-xs leading-4 transition-colors ${variantClasses}`}
    >
      {children}
    </button>
  );
}
