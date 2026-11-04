import {
  Children,
  type CSSProperties,
  type ElementType,
  Fragment,
  isValidElement,
  type ReactNode,
} from 'react';

type MobileInterleaveRootProps = {
  as?: ElementType;
  className?: string;
  /** Non-visual children (JSON-LD, sr-only headings…) that must not count as items. */
  preamble?: ReactNode;
  /** The main-panel items, in order. */
  children?: ReactNode;
};

/** Number of DOM nodes `node` renders at this level (fragments are transparent). */
function countNodes(node: ReactNode): number {
  return Children.toArray(node).reduce<number>(
    (total, child) =>
      total +
      (isValidElement<{ children?: ReactNode }>(child) &&
      child.type === Fragment
        ? countNodes(child.props.children)
        : 1),
    0
  );
}

/**
 * Page root that opts into the mobile main/sidebar interleaving
 * (see app/(frontend)/mobile-interleave.css). Its children are the main items.
 *
 * Every page that shows the sidebar on mobile must use this root: the sidebar is
 * hidden on mobile by default and only revealed (interleaved) for marked pages.
 * Render nothing-visual children via `preamble`, and don't hide items with CSS
 * (render nothing instead) — hidden elements still take an interleave slot.
 */
export default function MobileInterleaveRoot({
  as: Tag = 'div',
  className,
  preamble,
  children,
}: MobileInterleaveRootProps) {
  return (
    <Tag
      data-mobile-interleave
      style={{ '--interleave-skip': countNodes(preamble) } as CSSProperties}
      className={className}
    >
      {preamble}
      {children}
    </Tag>
  );
}
