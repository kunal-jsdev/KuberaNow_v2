type SectionAccentProps = {
  className?: string;
};

function SectionAccent({ className = '' }: SectionAccentProps) {
  return (
    <span
      className={`bg-primary absolute left-0 h-[22px] w-1 rounded-xs shadow-[2px_0px_0px_0px_var(--color-career-accent)] ${className}`}
    />
  );
}

export default SectionAccent;
