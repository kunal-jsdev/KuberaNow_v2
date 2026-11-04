/** Navy pill with a cyan dot — e.g. "Chairman & Managing Director", "CEO". */
export default function LeaderBadge({ label }: { label: string }) {
  return (
    <span className='inline-flex h-3.75 shrink-0 items-center gap-0.5 rounded-full bg-[#0a0a6e] px-1 py-0.5 lg:h-auto lg:gap-1 lg:px-2.5 lg:py-1.5'>
      <span
        aria-hidden
        className='size-1 shrink-0 rounded-full bg-[#19e3f0] lg:size-2.5'
      />
      <span className='text-[6px] leading-2.5 font-semibold whitespace-nowrap text-white lg:text-xs lg:leading-4'>
        {label}
      </span>
    </span>
  );
}
