'use client';

import {
  PublishButton,
  useDocumentInfo,
  useFormModified,
  useTranslation,
} from '@payloadcms/ui';

import { LiveBlogTabIndicator } from '../LiveBlogTabIndicator';

/**
 * NewsPublishButton:
 * Handles dynamic labelling based on document and form state:
 * - Brand new / never published document: "Publish"
 * - Published document with pending modifications or newer drafts: "Publish changes"
 * - Published document with no unsaved changes: "Published" (disabled)
 */
export default function NewsPublishButton() {
  const { id, hasPublishedDoc, unpublishedVersionCount } = useDocumentInfo();
  const modified = useFormModified();
  const { t } = useTranslation();

  const hasNewerVersions = (unpublishedVersionCount ?? 0) > 0;
  const hasChanges = Boolean(modified || hasNewerVersions);

  let label: string;
  if (!id || !hasPublishedDoc) {
    label = t('version:publish');
  } else if (hasChanges) {
    label = t('version:publishChanges');
  } else {
    label = t('version:published');
  }

  return (
    <>
      <LiveBlogTabIndicator />
      <PublishButton label={label} />
    </>
  );
}
