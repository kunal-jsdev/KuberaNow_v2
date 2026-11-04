type ContentPanelProps = {
  children: React.ReactNode;
  className?: string;
};

export default function ContentPanel({
  children,
  className = '',
}: ContentPanelProps) {
  return (
    <div
      className={`ring-border-soft bg-surface shadow-content-panel box-border w-full max-w-[950px] min-w-0 rounded-lg p-3 ring md:p-5 ${className}`}
    >
      {children}
    </div>
  );
}
