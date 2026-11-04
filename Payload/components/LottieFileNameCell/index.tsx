'use client';

import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useConfig, useListDrawerContext } from '@payloadcms/ui';
import type { DefaultCellComponentProps } from 'payload';

import { CircularProgressBar } from '../CircularProgressBar';

export const LottieFileNameCell: FC<DefaultCellComponentProps> = (props) => {
  const { cellData: filename, collectionSlug, rowData, linkURL } = props;
  const { config } = useConfig();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState<string | null>(null);

  let drawerContext: ReturnType<typeof useListDrawerContext> | null = null;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    drawerContext = useListDrawerContext();
  } catch {}

  const isSelectionDrawer = Boolean(
    drawerContext?.isInDrawer ||
    drawerContext?.onSelect ||
    typeof props.onClick === 'function'
  );

  const docId = rowData?.id ? String(rowData.id) : '';

  const activeUrl = useMemo(() => {
    if (typeof rowData?.url === 'string' && rowData.url) {
      return rowData.url;
    }
    if (typeof rowData?.cloudinaryUrl === 'string' && rowData.cloudinaryUrl) {
      return rowData.cloudinaryUrl;
    }
    return fetchedUrl;
  }, [rowData, fetchedUrl]);

  useEffect(() => {
    if (activeUrl || !docId) return;

    let cancelled = false;
    const apiBase = config?.serverURL || '';
    const endpoint = `${apiBase}/api/lottie-files/${docId}?depth=0`;

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
  }, [docId, activeUrl, config?.serverURL]);

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

  const handleSelect = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (typeof props.onClick === 'function') {
        props.onClick({
          cellData: filename,
          collectionSlug: collectionSlug || 'lottie-files',
          rowData,
        });
        return;
      }

      if (typeof drawerContext?.onSelect === 'function') {
        (drawerContext.onSelect as (args: unknown) => void)({
          collectionSlug: collectionSlug || 'lottie-files',
          doc: rowData,
          docID: String(rowData?.id),
        });
      }
    },
    [collectionSlug, drawerContext, filename, props, rowData]
  );

  useEffect(() => {
    if (!containerRef.current || !isSelectionDrawer) return;

    const tr = containerRef.current.closest('tr');
    if (!tr) return;

    const handleRowClick = (e: MouseEvent) => {
      if (
        (e.target as HTMLElement)?.closest(
          'button:not(.lottie-filename-btn), a'
        )
      ) {
        return;
      }
      handleSelect();
    };

    tr.style.cursor = 'pointer';
    tr.addEventListener('click', handleRowClick);

    return () => {
      tr.removeEventListener('click', handleRowClick);
    };
  }, [isSelectionDrawer, handleSelect]);

  let previewGraphic = <CircularProgressBar size={16} />;
  if (jsonText) {
    previewGraphic = (
      <DotLottieReact
        data={jsonText}
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
  } else if (activeUrl) {
    previewGraphic = (
      <DotLottieReact
        src={activeUrl}
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
  }

  const thumbnailContent = (
    <div
      style={{
        width: '36px',
        height: '36px',
        minWidth: '36px',
        minHeight: '36px',
        borderRadius: '3px',
        background: 'var(--theme-elevation-100, rgba(255, 255, 255, 0.04))',
        border: 'none',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '2px',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {previewGraphic}
    </div>
  );

  const inner = (
    <div
      ref={containerRef}
      className='lottie-filename-cell'
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: '100%',
        verticalAlign: 'middle',
      }}
    >
      <style>{`
        .lottie-filename-btn:hover .lottie-filename-text,
        .lottie-filename-link:hover .lottie-filename-text {
          text-decoration: underline !important;
        }
      `}</style>
      {thumbnailContent}
      <span
        className='lottie-filename-text'
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--theme-elevation-900, #f0f0f0)',
          textDecoration: 'inherit',
        }}
      >
        {String(filename || '')}
      </span>
    </div>
  );

  if (isSelectionDrawer) {
    return (
      <button
        type='button'
        className='lottie-filename-btn'
        onClick={handleSelect}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          font: 'inherit',
          color: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          outline: 'none',
        }}
      >
        {inner}
      </button>
    );
  }

  if (linkURL) {
    return (
      <a
        href={linkURL}
        className='lottie-filename-link'
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'inline-flex',
        }}
      >
        {inner}
      </a>
    );
  }

  return inner;
};

export default LottieFileNameCell;
