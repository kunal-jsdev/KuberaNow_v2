import type { ReactNode } from 'react';

type VideoSectionProps = {
  children: ReactNode;
  /** Replaces the default width, padding and corners (e.g. the shorts page). */
  layoutClassName?: string;
};

const DEFAULT_LAYOUT = 'w-full max-w-237.5 rounded-lg p-3 md:p-5';

/**
 * Figma "Section": white card, 1px #DEDEDE inside stroke (an inset ring, so it
 * takes no layout space), 20px padding, 8px radius, 24px between children.
 */
export default function VideoSection({
  children,
  layoutClassName = DEFAULT_LAYOUT,
}: VideoSectionProps) {
  return (
    <section
      className={`bg-surface ring-border-gray flex min-w-0 flex-col gap-6 shadow-[0px_1px_1px_0px_rgba(74,32,38,0.06),0px_1px_0.5px_0px_rgba(74,32,38,0.04)] ring-1 ring-inset ${layoutClassName}`}
    >
      {children}
    </section>
  );
}
