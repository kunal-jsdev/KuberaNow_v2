'use client';

import { useEffect, useRef } from 'react';

import { useField } from '@payloadcms/ui';
import type { SelectFieldDescriptionClientComponent } from 'payload';

export const RatioDescription: SelectFieldDescriptionClientComponent = () => {
  const { value: ratio } = useField<string>({ path: 'ratio' });
  const { value: originalRatio, setValue: setOriginalRatio } = useField<string>(
    {
      path: 'originalRatio',
    }
  );
  const { value: streamUid } = useField<string>({ path: 'streamUid' });
  const { value: videoSource } = useField<string>({ path: 'videoSource' });

  const fetchedRef = useRef(false);

  // If streamUid is present but originalRatio is not yet set, fetch once from videos-media
  useEffect(() => {
    if (
      !originalRatio &&
      streamUid &&
      videoSource !== 'youtube' &&
      !fetchedRef.current
    ) {
      fetchedRef.current = true;
      let isMounted = true;
      fetch(
        `/api/videos-media?where[streamUid][equals]=${encodeURIComponent(
          streamUid
        )}&limit=1&depth=0`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isMounted || !data?.docs?.[0]) return;
          const mediaDoc = data.docs[0];
          const detected =
            mediaDoc.ratio ||
            (mediaDoc.height &&
            mediaDoc.width &&
            mediaDoc.height > mediaDoc.width
              ? '9:16'
              : '16:9');
          if (detected && typeof setOriginalRatio === 'function') {
            setOriginalRatio(detected, true);
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, [originalRatio, streamUid, videoSource, setOriginalRatio]);

  // Determine if there is a ratio mismatch
  const isHorizontalToVertical = originalRatio === '16:9' && ratio === '9:16';
  const isVerticalToHorizontal = originalRatio === '9:16' && ratio === '16:9';
  const hasMismatch = Boolean(
    originalRatio && (isHorizontalToVertical || isVerticalToHorizontal)
  );

  if (!hasMismatch) {
    return null;
  }

  return (
    <div
      role='alert'
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '6px',
        fontSize: '12px',
        lineHeight: '1.4',
        color: '#facc15',
        whiteSpace: 'nowrap',
      }}
    >
      <svg
        width='14'
        height='14'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        style={{ flexShrink: 0, color: '#eab308' }}
      >
        <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' />
        <line
          x1='12'
          y1='9'
          x2='12'
          y2='13'
        />
        <line
          x1='12'
          y1='17'
          x2='12.01'
          y2='17'
        />
      </svg>
      <span>
        {isHorizontalToVertical
          ? 'Video is 16:9. Changing to 9:16 will show top & bottom black bars.'
          : 'Video is 9:16. Changing to 16:9 will show side black bars.'}
      </span>
    </div>
  );
};

export default RatioDescription;
