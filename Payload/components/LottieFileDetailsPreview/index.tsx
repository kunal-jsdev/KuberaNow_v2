'use client';

import {
  type FC,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useConfig, useDocumentInfo } from '@payloadcms/ui';

import { CircularProgressBar } from '../CircularProgressBar';

export const LottieFileDetailsPreview: FC = () => {
  const { id, data: docData } = useDocumentInfo();
  const { config } = useConfig();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState<string | null>(null);
  const [headerThumbnailEl, setHeaderThumbnailEl] = useState<Element | null>(
    null
  );

  const documentData = docData as Record<string, unknown> | undefined;

  const activeUrl = useMemo(() => {
    if (typeof documentData?.url === 'string' && documentData.url) {
      return documentData.url;
    }
    if (
      typeof documentData?.cloudinaryUrl === 'string' &&
      documentData.cloudinaryUrl
    ) {
      return documentData.cloudinaryUrl;
    }
    return fetchedUrl;
  }, [documentData, fetchedUrl]);

  useEffect(() => {
    if (activeUrl || !id) return;

    let cancelled = false;
    const apiBase = config?.serverURL || '';
    const endpoint = `${apiBase}/api/lottie-files/${id}?depth=0`;

    fetch(endpoint)
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => {
        if (!cancelled && doc) {
          const resolved = doc.url || doc.cloudinaryUrl;
          if (resolved) {
            setFetchedUrl(resolved);
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, activeUrl, config?.serverURL]);

  useEffect(() => {
    if (!activeUrl) return;

    let cancelled = false;

    fetch(activeUrl)
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (!cancelled && text) {
          setJsonText(text);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeUrl]);

  useEffect(() => {
    if (!containerRef.current) return;

    const findThumbnail = () => {
      const root =
        containerRef.current?.closest('.collection-edit') ||
        containerRef.current?.closest('.drawer__content') ||
        containerRef.current?.closest('form') ||
        document;

      const thumb =
        root.querySelector('.file-details__thumbnail') ||
        root.querySelector('.file-field .thumbnail') ||
        root.querySelector('.thumbnail');

      if (thumb) {
        setHeaderThumbnailEl(thumb);
      }
    };

    findThumbnail();
    const timer = setTimeout(findThumbnail, 150);
    const interval = setInterval(findThumbnail, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [docData, activeUrl]);

  return (
    <div
      ref={containerRef}
      style={{ display: 'contents' }}
    >
      <style>{`
        .file-details__thumbnail > svg,
        .file-details__thumbnail > .shimmer-effect,
        .thumbnail.file-details__thumbnail > svg {
          display: none !important;
        }
        .file-details__thumbnail,
        .thumbnail.file-details__thumbnail {
          position: relative !important;
          overflow: hidden !important;
          width: 70px !important;
          min-width: 70px !important;
          max-width: 70px !important;
        }
        .file-details__thumbnail canvas,
        .thumbnail.file-details__thumbnail canvas {
          object-fit: contain !important;
          aspect-ratio: 1 / 1 !important;
          max-width: 100% !important;
          max-height: 100% !important;
        }
        .file-details__main-detail {
          padding-left: 10px !important;
        }
      `}</style>

      {headerThumbnailEl && (
        <HeaderThumbnailPortal
          target={headerThumbnailEl}
          src={activeUrl || undefined}
          data={jsonText}
        />
      )}
    </div>
  );
};

function HeaderThumbnailPortal({
  target,
  src,
  data,
}: {
  target: Element;
  src?: string;
  data?: string | null;
}) {
  let content: ReactNode = null;

  if (data) {
    content = (
      <DotLottieReact
        data={data}
        loop
        autoplay
        layout={{ fit: 'contain', align: [0.5, 0.5] }}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: '1 / 1',
          objectFit: 'contain',
        }}
      />
    );
  } else if (src) {
    content = (
      <DotLottieReact
        src={src}
        loop
        autoplay
        layout={{ fit: 'contain', align: [0.5, 0.5] }}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: '1 / 1',
          objectFit: 'contain',
        }}
      />
    );
  } else {
    content = <CircularProgressBar size={18} />;
  }

  return createPortal(
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: '1 / 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {content}
      </div>
    </div>,
    target
  );
}

export default LottieFileDetailsPreview;
