import Link from 'next/link';

type VideoCategoryChipProps = {
  title: string;
  /** Category slug; when set the chip links to the category page, /{slug}. */
  slug?: string | null;
};

/**
 * Figma "Chips": Noto Sans 10px/14px bold, 1px tracking, #010874 on #D7D9FF,
 * 2px × 8px padding, 12px radius, 1px #CACDFF border — 18px tall ("Market"
 * is 58 × 18). Figma draws the border inside that size, so it's an inset ring
 * here (a CSS border would add 2px each way). Text centred both ways; Noto
 * Sans because the body font sets Latin text higher in the line (Gujarati
 * names fall back to the site's Gujarati font).
 */
const chipClassName =
  'ring-career-chip-border bg-career-chip-bg text-primary inline-flex shrink-0 items-center justify-center rounded-xl px-2 py-0.5 font-[family-name:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-[10px] leading-3.5 font-bold tracking-[1px] whitespace-nowrap ring-1 ring-inset';

export default function VideoCategoryChip({
  title,
  slug,
}: VideoCategoryChipProps) {
  if (slug) {
    return (
      <Link
        href={`/${slug}`}
        className={`${chipClassName} hover:bg-career-chip-border transition-colors`}
      >
        {title}
      </Link>
    );
  }

  return <span className={chipClassName}>{title}</span>;
}
