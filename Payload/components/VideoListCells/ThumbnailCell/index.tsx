'use client';

import { type CSSProperties, type FC, useEffect, useState } from 'react';

import { useConfig } from '@payloadcms/ui';
import Link from 'next/link';

export const ThumbnailCell: FC<any> = ({ cellData, rowData }) => {
  const { config } = useConfig();
  const adminRoute = config.routes.admin;
  const editUrl = `${adminRoute}/collections/videos/${rowData?.id}`;
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  const isVertical = rowData?.ratio === '9:16';

  const rawThumb = cellData || rowData?.videoThumbnail;
  const thumbId = typeof rawThumb === 'string' ? rawThumb : rawThumb?.id;
  const directUrl =
    typeof rawThumb === 'object' && rawThumb !== null ? rawThumb.url : null;

  useEffect(() => {
    let isMounted = true;
    if (thumbId && !directUrl) {
      fetch(`${config.serverURL}${config.routes.api}/media/${thumbId}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data?.url) {
            setFetchedUrl(data.url);
          }
        })
        .catch(() => {});
    } else if (
      !directUrl &&
      rowData?.id &&
      !rowData?.thumbnailUrl &&
      !rowData?.streamUid
    ) {
      fetch(
        `${config.serverURL}${config.routes.api}/videos/${rowData.id}?depth=0`
      )
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data) {
            if (data.thumbnailUrl) {
              setFetchedUrl(data.thumbnailUrl);
            } else if (data.streamUid) {
              const streamDomain =
                process.env.CLOUDFLARE_STREAM_DOMAIN || 'cloudflarestream.com';
              setFetchedUrl(
                `https://${streamDomain}/${data.streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`
              );
            }
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [
    thumbId,
    directUrl,
    rowData?.id,
    rowData?.thumbnailUrl,
    rowData?.streamUid,
    config.serverURL,
    config.routes.api,
  ]);

  const streamDomain =
    process.env.CLOUDFLARE_STREAM_DOMAIN || 'cloudflarestream.com';

  const customUrl = directUrl || fetchedUrl;
  const thumbUrl =
    customUrl ||
    rowData?.thumbnailUrl ||
    (rowData?.streamUid
      ? `https://${streamDomain}/${rowData.streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`
      : null);

  const containerStyle: CSSProperties = {
    height: '46px',
    aspectRatio: isVertical ? '9/16' : '16/9',
    backgroundColor: 'var(--theme-elevation-100, #1c1d20)',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const isImgFailed = Boolean(thumbUrl && failedUrls[thumbUrl]);
  const showImage = Boolean(thumbUrl && !isImgFailed);

  return (
    <Link
      href={editUrl}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
      }}
      title={rowData?.title || 'Edit Video'}
    >
      <div style={containerStyle}>
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={thumbUrl}
            src={thumbUrl as string}
            alt={rowData?.title || 'Video thumbnail'}
            onError={() => {
              if (thumbUrl) {
                setFailedUrls((prev) => ({ ...prev, [thumbUrl]: true }));
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--theme-elevation-150, #222326)',
              color: 'var(--theme-elevation-450, #71717a)',
            }}
          >
            <svg
              width={isVertical ? 13 : 18}
              height={isVertical ? 13 : 18}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth={isVertical ? 1.7 : 1.8}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polygon points='23 7 16 12 23 17 23 7' />
              <rect
                x='1'
                y='5'
                width='15'
                height='14'
                rx='2'
                ry='2'
              />
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ThumbnailCell;
