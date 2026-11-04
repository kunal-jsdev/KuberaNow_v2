type LiveIndicatorDotProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_MAP: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-2 w-2 md:h-2.5 md:w-2.5',
  md: 'h-2.5 w-2.5 md:h-3.5 md:w-3.5',
  lg: 'h-3 w-3 md:h-4 md:w-4',
};

export default function LiveIndicatorDot({
  className = '',
  size = 'md',
}: LiveIndicatorDotProps) {
  const sizeClasses = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <span
      className={`mt-[-4px] mr-1 inline-flex items-center justify-center overflow-visible align-middle select-none md:mr-2.5 ${className}`}
      aria-label='Live blog active'
    >
      <span
        className={`animate-live-heartbeat inline-block shrink-0 rounded-full bg-[#BD1C1C] ${sizeClasses}`}
        aria-hidden='true'
      />
    </span>
  );
}
