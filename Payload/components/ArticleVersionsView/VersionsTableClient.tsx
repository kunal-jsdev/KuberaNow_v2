'use client';

import type { FC } from 'react';

import {
  Link,
  LoadingOverlayToggle,
  Pagination,
  PerPage,
  Pill,
  Table,
  useConfig,
  useListQuery,
  useTranslation,
} from '@payloadcms/ui';
import { formatDate } from '@payloadcms/ui/shared';
import { useSearchParams } from 'next/navigation';
import type { Column } from 'payload';
import { formatAdminURL } from 'payload/shared';

export const ModifiedByCell: FC<{
  userName?: string | null;
  userEmail?: string | null;
}> = ({ userName, userEmail }) => {
  if (!userName && !userEmail) {
    return (
      <span
        style={{
          color: 'var(--theme-elevation-400)',
          fontStyle: 'italic',
          fontSize: '13px',
        }}
      >
        —
      </span>
    );
  }

  const displayName = userName || userEmail?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'var(--theme-elevation-200)',
          color: 'var(--theme-elevation-800)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 600,
          flexShrink: 0,
          border: '1px solid var(--theme-elevation-300)',
        }}
      >
        {initial}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          lineHeight: 1.2,
        }}
      >
        <span
          style={{
            fontWeight: 500,
            fontSize: '13px',
            color: 'var(--theme-elevation-900)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {displayName}
        </span>
        {userEmail && userName ? (
          <span
            style={{
              fontSize: '11px',
              color: 'var(--theme-elevation-500)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {userEmail}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export const CreatedAtCell: FC<{
  collectionSlug?: string;
  docID: string | number;
  isTrashed?: boolean;
  rowData?: {
    id?: string;
    updatedAt?: string;
  };
}> = ({ collectionSlug, docID, isTrashed, rowData }) => {
  const { id, updatedAt } = rowData || {};
  const { config } = useConfig();
  const { admin, routes } = config;
  const { dateFormat } = admin;
  const { admin: adminRoute } = routes;
  const { i18n } = useTranslation();
  const trashedDocPrefix = isTrashed ? 'trash/' : '';

  const to = formatAdminURL({
    adminRoute,
    path: `/collections/${collectionSlug}/${trashedDocPrefix}${docID}/versions/${id}`,
  });

  return (
    <Link
      href={to}
      prefetch={false}
    >
      {formatDate({
        date: updatedAt,
        i18n,
        pattern: dateFormat,
      })}
    </Link>
  );
};

export const StatusCell: FC<{
  isAutosave?: boolean;
  status?: string | null;
  isCurrentlyPublished?: boolean;
}> = ({ isAutosave, status, isCurrentlyPublished }) => {
  const { t } = useTranslation();

  let statusPill = null;
  if (isCurrentlyPublished || status === 'published') {
    statusPill = (
      <Pill
        pillStyle='success'
        size='small'
      >
        {t('version:published')}
      </Pill>
    );
  } else if (status === 'draft') {
    statusPill = (
      <Pill
        pillStyle='warning'
        size='small'
      >
        {t('version:draft')}
      </Pill>
    );
  }

  return (
    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
      {isAutosave ? (
        <Pill
          pillStyle='light'
          size='small'
        >
          {t('version:autosave')}
        </Pill>
      ) : null}
      {statusPill}
    </div>
  );
};

export const VersionsTableClient: FC<{
  baseClass?: string;
  columns: Column[];
  paginationLimits?: number[];
}> = ({ baseClass = 'versions', columns, paginationLimits }) => {
  const { data, handlePageChange, handlePerPageChange } = useListQuery();
  const searchParams = useSearchParams();
  const limit = searchParams.get('limit');
  const { i18n } = useTranslation();
  const versionCount = data?.totalDocs || 0;
  const isLoading = !data;

  const totalDocs = data?.totalDocs ?? 0;
  const currentPage = data?.page ?? 1;
  const currentLimit = data?.limit ?? 10;
  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <LoadingOverlayToggle
        name='versions'
        show={isLoading}
      />
      {versionCount === 0 && (
        <div className={`${baseClass}__no-versions`}>
          {i18n.t('version:noFurtherVersionsFound')}
        </div>
      )}
      {versionCount > 0 && data && (
        <>
          <Table
            columns={columns}
            data={data.docs as Record<string, unknown>[]}
          />
          <div className={`${baseClass}__page-controls`}>
            <Pagination
              hasNextPage={Boolean(data.hasNextPage)}
              hasPrevPage={Boolean(data.hasPrevPage)}
              limit={currentLimit}
              nextPage={data.nextPage ?? undefined}
              numberOfNeighbors={1}
              onChange={handlePageChange}
              page={currentPage}
              prevPage={data.prevPage ?? undefined}
              totalPages={totalPages}
            />
            {totalDocs > 0 && (
              <>
                <div className={`${baseClass}__page-info`}>
                  {currentPage * currentLimit - (currentLimit - 1)}-
                  {totalPages > 1 && totalPages !== currentPage
                    ? currentLimit * currentPage
                    : totalDocs}{' '}
                  {i18n.t('general:of')} {totalDocs}
                </div>
                {paginationLimits && paginationLimits.length > 0 && (
                  <PerPage
                    handleChange={handlePerPageChange}
                    limit={limit ? Number(limit) : currentLimit}
                    limits={paginationLimits}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};
