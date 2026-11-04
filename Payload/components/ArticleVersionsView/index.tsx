import { Fragment } from 'react';

import {
  Gutter,
  ListQueryProvider,
  SetDocumentStepNav,
  SortColumn,
} from '@payloadcms/ui';
import { notFound } from 'next/navigation';
import type { Column, DocumentViewServerProps, Where } from 'payload';
import { isNumber } from 'payload/shared';

import {
  CreatedAtCell,
  ModifiedByCell,
  StatusCell,
  VersionsTableClient,
} from './VersionsTableClient';

const baseClass = 'versions';

function normalizeUserId(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === 'string' && val.trim() !== '') return val.trim();
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (obj.id) return String(obj.id);
    if (obj._id) return String(obj._id);
  }
  return null;
}

export default async function ArticleVersionsView(
  props: DocumentViewServerProps
) {
  const {
    initPageResult: {
      collectionConfig,
      docID: id,
      globalConfig,
      req,
      req: { i18n, t, user },
    },
    routeSegments: segments,
    searchParams: { limit, page, sort } = {},
    versions: { disableGutter = false } = {},
  } = props;

  const collectionSlug = collectionConfig?.slug;
  const globalSlug = globalConfig?.slug;
  const isTrashed = segments?.[2] === 'trash';

  const defaultLimit = collectionSlug
    ? collectionConfig?.admin?.pagination?.defaultLimit || 10
    : 10;
  const limitToUse = isNumber(limit) ? Number(limit) : defaultLimit;
  const sortToUse = typeof sort === 'string' && sort ? sort : '-updatedAt';

  const whereQuery: Where = {
    parent: {
      equals: id,
    },
  };

  let versionsData;
  try {
    if (collectionSlug) {
      versionsData = await req.payload.findVersions({
        collection: collectionSlug,
        depth: 0,
        limit: limitToUse,
        page: page ? parseInt(String(page), 10) : 1,
        sort: sortToUse,
        user,
        where: whereQuery,
        overrideAccess: false,
      });
    }
  } catch (err) {
    req.payload.logger.error({
      err,
      msg: 'Error fetching versions',
    });
    return notFound();
  }

  if (!versionsData) {
    return notFound();
  }

  // Collect all unique user IDs referenced across versions (updatedBy and author)
  const userIds = new Set<string>();
  for (const doc of versionsData.docs || []) {
    const versionObj = (doc as unknown as { version?: Record<string, unknown> })
      .version;
    const updatedById = normalizeUserId(versionObj?.updatedBy);
    const authorId = normalizeUserId(versionObj?.author);

    if (updatedById) userIds.add(updatedById);
    if (authorId) userIds.add(authorId);
  }

  // Batch-fetch users for all collected IDs
  const usersMap = new Map<
    string,
    { name?: string | null; email?: string | null }
  >();

  if (userIds.size > 0) {
    try {
      const usersResult = await req.payload.find({
        collection: 'users',
        where: {
          id: {
            in: Array.from(userIds),
          },
        },
        depth: 0,
        pagination: false,
        overrideAccess: true,
        req,
      });

      for (const u of usersResult.docs || []) {
        const uid = normalizeUserId(u.id);
        if (uid) {
          usersMap.set(uid, {
            name: typeof u.name === 'string' ? u.name : null,
            email: typeof u.email === 'string' ? u.email : null,
          });
        }
      }
    } catch (err) {
      req.payload.logger.error({
        err,
        msg: 'Error loading user data for versions table',
      });
    }
  }

  const docs = versionsData.docs || [];

  // Build the table columns including the "Modified By" column
  const columns: Column[] = [
    {
      accessor: 'updatedAt',
      active: true,
      field: {
        name: '',
        type: 'date',
      },
      Heading: (
        <SortColumn
          Label={t('general:updatedAt')}
          name='updatedAt'
        />
      ),
      renderedCells: docs.map((doc) => (
        <CreatedAtCell
          key={`updatedAt-${doc.id}`}
          collectionSlug={collectionSlug}
          docID={id!}
          isTrashed={isTrashed}
          rowData={{
            id: doc.id,
            updatedAt: doc.updatedAt,
          }}
        />
      )),
    },
    {
      accessor: 'modifiedBy',
      active: true,
      field: {
        name: '',
        type: 'text',
      },
      Heading: (
        <SortColumn
          disable
          Label='Author / Modified By'
          name='modifiedBy'
        />
      ),
      renderedCells: docs.map((doc) => {
        const docRecord = doc as unknown as {
          version?: Record<string, unknown>;
          autosave?: boolean;
        };
        const versionObj = docRecord.version;
        const updatedById = normalizeUserId(versionObj?.updatedBy);
        const authorId = normalizeUserId(versionObj?.author);

        const targetUserId = updatedById || authorId;
        const userData = targetUserId ? usersMap.get(targetUserId) : null;

        return (
          <ModifiedByCell
            key={`modifiedBy-${doc.id}`}
            userName={userData?.name}
            userEmail={userData?.email}
          />
        );
      }),
    },
    {
      accessor: 'id',
      active: true,
      field: {
        name: '',
        type: 'text',
      },
      Heading: (
        <SortColumn
          disable
          Label={t('version:versionID')}
          name='id'
        />
      ),
      renderedCells: docs.map((doc) => (
        <span
          key={`id-${doc.id}`}
          style={{ fontFamily: 'monospace', fontSize: '12px' }}
        >
          {doc.id}
        </span>
      )),
    },
    {
      accessor: '_status',
      active: true,
      field: {
        name: '',
        type: 'checkbox',
      },
      Heading: (
        <SortColumn
          disable
          Label={t('version:status')}
          name='status'
        />
      ),
      renderedCells: docs.map((doc) => {
        const docRecord = doc as unknown as {
          version?: Record<string, unknown>;
          autosave?: boolean;
        };
        const versionObj = docRecord.version;
        return (
          <StatusCell
            key={`status-${doc.id}`}
            isAutosave={Boolean(docRecord.autosave)}
            status={
              typeof versionObj?._status === 'string'
                ? versionObj._status
                : null
            }
          />
        );
      }),
    },
  ];

  const pluralLabel =
    typeof collectionConfig?.labels?.plural === 'function'
      ? collectionConfig.labels.plural({ i18n, t })
      : (collectionConfig?.labels?.plural ?? globalConfig?.label);

  const GutterComponent = disableGutter ? Fragment : Gutter;

  return (
    <>
      <SetDocumentStepNav
        collectionSlug={collectionSlug}
        globalSlug={globalSlug}
        id={id}
        isTrashed={isTrashed}
        pluralLabel={pluralLabel}
        useAsTitle={collectionConfig?.admin?.useAsTitle || globalSlug}
        view={i18n.t('version:versions')}
      />
      <main className={baseClass}>
        <GutterComponent className={`${baseClass}__wrap`}>
          <ListQueryProvider
            data={versionsData}
            modifySearchParams
            orderableFieldName={
              collectionConfig?.orderable === true ? '_order' : undefined
            }
            query={{
              limit: limitToUse,
              sort: sortToUse,
            }}
          >
            <VersionsTableClient
              baseClass={baseClass}
              columns={columns}
              paginationLimits={collectionConfig?.admin?.pagination?.limits}
            />
          </ListQueryProvider>
        </GutterComponent>
      </main>
    </>
  );
}
