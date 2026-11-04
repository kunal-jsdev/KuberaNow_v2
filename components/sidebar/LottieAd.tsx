'use client';

import { LottieSvg } from 'lottie-react';

/**
 * Renders a Lottie animation from a remote .json file.
 *
 * `src` takes the URL directly — the player fetches and parses it on the
 * client, so the animation data never travels in the RSC payload.
 *
 * Uses the `svg`-only build, which carries a smaller copy of the engine than
 * the full `Lottie` component.
 */
export function LottieAd({
  src,
  className = '',
  ariaLabel,
}: {
  src: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <LottieSvg
      src={src}
      loop
      autoplay
      className={className}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    />
  );
}

export default LottieAd;
