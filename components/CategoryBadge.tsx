type CategoryBadgeProps = {
  category?: string;
  children?: React.ReactNode;
  className?: string;
};

export function CategoryBadge({
  category,
  children,
  className = '',
}: CategoryBadgeProps) {
  if (!children && !category) return null;

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border border-career-chip-border bg-career-chip-bg px-2 py-1 text-[10px] leading-none text-primary ${className}`.trim()}
    >
      {children ?? category}
    </span>
  );
}
