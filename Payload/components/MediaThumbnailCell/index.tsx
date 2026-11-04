'use client';

import {
  Link,
  Thumbnail,
  useConfig,
  useListDrawerContext,
} from '@payloadcms/ui';
import type {
  ClientCollectionConfig,
  DefaultCellComponentProps,
  SanitizedCollectionConfig,
} from 'payload';
import { formatAdminURL, getBestFitFromSizes, isImage } from 'payload/shared';

import { LottieAd } from '@/components/sidebar/LottieAd';

type MediaRow = {
  cloudinaryUrl?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  sizes?: Record<string, { url?: string; width?: number }> | null;
  thumbnailURL?: string | null;
  updatedAt?: string | null;
  url?: string | null;
  width?: number | null;
};

type MediaThumbnailCellProps = DefaultCellComponentProps & {
  readonly collectionConfig?: ClientCollectionConfig;
};

const LOTTIE_MIME_TYPES = ['application/json', 'application/lottie+json'];

/** Turn Payload's `null`-able row values into the `undefined` its props expect. */
const orUndefined = <T,>(value: T | null | undefined): T | undefined =>
  value ?? undefined;

const isLottie = (row: MediaRow): boolean => {
  if (LOTTIE_MIME_TYPES.includes(row.mimeType ?? '')) return true;

  // Cloudinary stores some .json uploads as a raw/octet-stream type, so fall
  // back to the extension before giving up on the preview.
  return (row.filename ?? '').toLowerCase().endsWith('.json');
};

/**
 * List-view thumbnail for the Media collection.
 *
 * Payload's built-in file cell only previews files that pass
 * `isImage(mimeType)`, and its `Thumbnail` verifies the URL by loading it into
 * `new Image()` — a Lottie `.json` fails both checks and falls back to the
 * generic file icon. Lottie rows get the real player instead; everything else
 * keeps the stock thumbnail behaviour.
 *
 * A custom Cell also replaces `DefaultCell` outright, including the wrapper it
 * puts around the contents, so that wrapper is rebuilt here. Note that a custom
 * Cell is rendered straight from `renderCell` and never passes through
 * `RenderDefaultCell`, which is what would normally swap the link for a select
 * handler inside an upload drawer — so the drawer state is read from
 * `useListDrawerContext` directly instead of arriving via props.
 */
export const MediaThumbnailCell = (props: MediaThumbnailCellProps) => {
  const {
    cellData,
    className,
    collectionConfig,
    collectionSlug,
    link,
    linkURL,
    onClick,
    rowData,
    viewType,
  } = props;

  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig();

  const { drawerSlug, onSelect } = useListDrawerContext();

  const row = (rowData ?? {}) as MediaRow;
  const filename =
    typeof cellData === 'string' ? cellData : (row.filename ?? '');

  const uploadConfig = collectionConfig?.upload as
    | SanitizedCollectionConfig['upload']
    | undefined;

  const url = orUndefined(row.url);
  const thumbnailURL = orUndefined(row.thumbnailURL);

  const lottieSrc = isLottie(row) ? row.cloudinaryUrl || row.url || null : null;

  const fileSrc =
    isImage(row.mimeType ?? '') && url
      ? getBestFitFromSizes({
          sizes: orUndefined(row.sizes),
          thumbnailURL,
          url,
          width: orUndefined(row.width),
        })
      : thumbnailURL;

  const contents = (
    <div className={lottieSrc ? 'file media-thumbnail-cell' : 'file'}>
      {lottieSrc ? (
        <div className='thumbnail thumbnail--size-small file__thumbnail'>
          <LottieAd
            src={lottieSrc}
            ariaLabel={filename || 'Lottie animation'}
          />
        </div>
      ) : (
        <Thumbnail
          className='file__thumbnail'
          collectionSlug={collectionSlug}
          doc={{ ...row, filename }}
          fileSrc={fileSrc}
          imageCacheTag={
            uploadConfig?.cacheTags ? orUndefined(row.updatedAt) : undefined
          }
          size='small'
          uploadConfig={uploadConfig}
        />
      )}
      <span className='file__filename'>{filename}</span>
    </div>
  );

  // Inside an upload drawer the linked column picks the doc rather than
  // navigating to it. `link` is only true for that column, which is the same
  // condition `RenderDefaultCell` uses to make the swap.
  const selectsInDrawer = Boolean(drawerSlug) && link !== false;

  if (selectsInDrawer || typeof onClick === 'function') {
    const handleClick = () => {
      if (typeof onClick === 'function') {
        onClick({ cellData, collectionSlug, rowData: rowData ?? {} });
        return;
      }

      onSelect?.({
        collectionSlug,
        doc: rowData ?? {},
        docID: String(rowData?.id),
      });
    };

    return (
      <button
        className={[className, 'default-cell__first-cell']
          .filter(Boolean)
          .join(' ')}
        onClick={handleClick}
        type='button'
      >
        {contents}
      </button>
    );
  }

  if (link) {
    const href =
      linkURL ??
      (collectionSlug
        ? formatAdminURL({
            adminRoute,
            path: `/collections/${collectionSlug}${
              viewType === 'trash' ? '/trash' : ''
            }/${encodeURIComponent(String(rowData?.id))}`,
          })
        : '');

    return (
      <Link
        className={className}
        href={href}
        prefetch={false}
      >
        {contents}
      </Link>
    );
  }

  return <span className={className}>{contents}</span>;
};

export default MediaThumbnailCell;
