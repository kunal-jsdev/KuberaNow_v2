'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { UploadField } from '@payloadcms/ui';
import type { UploadFieldClientProps } from 'payload';

import { LottieAd } from '@/components/sidebar/LottieAd';

const THUMBNAIL_SELECTOR = '.upload-relationship-details__thumbnail';
const FILENAME_SELECTOR = '.upload-relationship-details__filename a';

/**
 * The upload field, with a working preview for Lottie JSON files.
 *
 * Payload renders the selected file through `ThumbnailComponent`, which proves
 * the URL by loading it into `new Image()`. A `.json` never loads that way, so
 * it always falls back to the generic file icon.
 *
 * There is no seam for replacing just that thumbnail: `RelationshipContent` is
 * internal, `afterInput` renders below the whole card, and the field's own
 * value is only the related id — the populated doc lives in state Payload does
 * not expose. So the stock field is rendered untouched and the card it produces
 * is read from the DOM: the filename anchor carries both the name and the file
 * URL, which is everything the player needs.
 *
 * The player is portalled *into* the thumbnail element rather than laid over
 * it, so it inherits whatever box Payload gave that element (40px on the
 * medium card, 25px on the small one) instead of restating those sizes here.
 */
export const LottieUploadField = (props: UploadFieldClientProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lottieSrc, setLottieSrc] = useState<string | null>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);

  const syncPreview = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const link = container.querySelector<HTMLAnchorElement>(FILENAME_SELECTOR);
    const href = link?.getAttribute('href') ?? null;
    const name = link?.textContent?.trim().toLowerCase() ?? '';

    const nextSrc = href && name.endsWith('.json') ? href : null;
    const thumbnail = container.querySelector<HTMLElement>(THUMBNAIL_SELECTOR);

    setLottieSrc((current) => (current === nextSrc ? current : nextSrc));
    setMount((current) => {
      const next = nextSrc ? thumbnail : null;
      return current === next ? current : next;
    });

    if (thumbnail) {
      // Blank the stock file icon without unmounting it, so the node Payload
      // rendered stays under its own control.
      thumbnail.classList.toggle('has-lottie-preview', Boolean(nextSrc));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    syncPreview();

    // The card mounts, swaps and unmounts as the editor picks or clears a
    // file, all inside Payload's own subtree.
    const observer = new MutationObserver(syncPreview);
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [syncPreview]);

  return (
    <div
      className='lottie-upload-field'
      ref={containerRef}
    >
      <UploadField {...props} />
      {mount && lottieSrc
        ? createPortal(
            <span
              className='lottie-upload-field__preview'
              aria-hidden='true'
            >
              <LottieAd src={lottieSrc} />
            </span>,
            mount
          )
        : null}
    </div>
  );
};

export default LottieUploadField;
