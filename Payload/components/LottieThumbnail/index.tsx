'use client';

import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useConfig, useField } from '@payloadcms/ui';

import { CircularProgressBar } from '../CircularProgressBar';

type FieldProps = {
  path?: string;
  field?: {
    name?: string;
  };
};

export const LottieThumbnail: FC<FieldProps> = (props) => {
  const fieldPath = props.path || props.field?.name || 'desktopLottieJson';
  const { value } = useField({ path: fieldPath });
  const { config } = useConfig();
  const [fetchedUrl, setFetchedUrl] = useState<{
    key: string;
    url: string;
  } | null>(null);
  const [targetThumbnailEl, setTargetThumbnailEl] = useState<Element | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  const directUrl =
    typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>).url ||
        (value as Record<string, unknown>).cloudinaryUrl
      : undefined;

  let docId = '';
  if (typeof value === 'string' || typeof value === 'number') {
    docId = String(value);
  } else if (typeof value === 'object' && value !== null) {
    docId = String((value as Record<string, unknown>).id ?? '');
  }

  let lottieUrl: string | null = null;
  if (typeof directUrl === 'string' && directUrl) {
    lottieUrl = directUrl;
  } else if (docId && fetchedUrl && fetchedUrl.key === docId) {
    lottieUrl = fetchedUrl.url;
  }
  const hasValue = Boolean(value);

  useEffect(() => {
    if (!docId) return;

    const apiBase = config?.serverURL || '';
    const url = `${apiBase}/api/lottie-files/${docId}?depth=0`;
    let cancelled = false;

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => {
        if (!cancelled && doc) {
          const foundUrl = doc.url || doc.cloudinaryUrl;
          if (foundUrl) {
            setFetchedUrl({ key: docId, url: foundUrl });
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [docId, config?.serverURL]);

  useEffect(() => {
    if (!containerRef.current) return;

    const findAndAttach = () => {
      const fieldContainer =
        containerRef.current?.closest('.field-type.upload') ||
        containerRef.current?.closest('.upload') ||
        containerRef.current?.parentElement;

      if (!fieldContainer) return;

      const thumbEl =
        fieldContainer.querySelector(
          '.upload-relationship-details__thumbnail'
        ) || fieldContainer.querySelector('.thumbnail');

      if (thumbEl) {
        setTargetThumbnailEl(thumbEl);
      } else {
        setTargetThumbnailEl(null);
      }
    };

    findAndAttach();
    const timer = setTimeout(findAndAttach, 150);
    const interval = setInterval(findAndAttach, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [value]);

  return (
    <div
      ref={containerRef}
      className='lottie-thumbnail-injector'
      style={{ display: 'contents' }}
    >
      {targetThumbnailEl && hasValue && (
        <LottieThumbnailPortal
          target={targetThumbnailEl}
          src={lottieUrl}
        />
      )}
    </div>
  );
};

function LottieThumbnailPortal({
  target,
  src,
}: {
  target: Element;
  src: string | null;
}) {
  const [data, setData] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => {
    const svg = target.querySelector('svg');
    if (svg) {
      svg.style.display = 'none';
    }

    return () => {
      if (svg) {
        svg.style.display = '';
      }
    };
  }, [target]);

  useEffect(() => {
    if (!src) {
      return;
    }

    let cancelled = false;
    fetch(src)
      .then((res) => (res.ok ? res.text() : null))
      .then((jsonStr) => {
        if (!cancelled && jsonStr) {
          setData(jsonStr);
          setLoadedSrc(src);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadedSrc(src);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  const isReady = Boolean(src && loadedSrc === src);
  const activeData = isReady ? data : null;

  let lottieContent: ReactNode = null;
  if (activeData) {
    lottieContent = (
      <DotLottieReact
        data={activeData}
        loop
        autoplay
        style={{
          width: '100%',
          height: '100%',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
    );
  } else if (src) {
    lottieContent = (
      <DotLottieReact
        src={src}
        loop
        autoplay
        style={{
          width: '100%',
          height: '100%',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
    );
  }

  return createPortal(
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 'inherit',
      }}
    >
      {!isReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            background: 'inherit',
          }}
        >
          <CircularProgressBar size={16} />
        </div>
      )}

      {lottieContent}
    </div>,
    target
  );
}

export default LottieThumbnail;
