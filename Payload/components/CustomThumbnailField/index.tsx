/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  FieldLabel,
  useConfig,
  useDocumentDrawer,
  useField,
  useListDrawer,
} from '@payloadcms/ui';
import type { UploadFieldClientComponent } from 'payload';

export const CustomThumbnailField: UploadFieldClientComponent = ({
  field,
  path: pathFromProps,
  readOnly,
}) => {
  const path = pathFromProps ?? field.name;
  const { value, setValue, showError, errorMessage } = useField<any>({ path });
  const { value: ratio } = useField<string>({ path: 'ratio' });
  const { config } = useConfig();

  const buttonStyle: React.CSSProperties = {
    height: '32px',
    borderRadius: '6px',
    background: '#202024',
    border: '1px solid #2B2B30',
    color: '#fff',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  };

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);

  const [
    ListDrawer,
    _,
    { openDrawer: openListDrawer, closeDrawer: closeListDrawer },
  ] = useListDrawer({
    collectionSlugs: ['media'],
  });

  const [
    CreateDocDrawer,
    ,
    { openDrawer: openCreateDocDrawer, closeDrawer: closeCreateDocDrawer },
  ] = useDocumentDrawer({
    collectionSlug: 'media',
  });

  const [fetchedDoc, setFetchedDoc] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    if (typeof value === 'string') {
      fetch(`${config.serverURL}${config.routes.api}/media/${value}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) setFetchedDoc(data);
        })
        .catch(() => {
          if (isMounted) setFetchedDoc(null);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [value, config.serverURL, config.routes.api]);

  let displayDoc: any = null;
  if (typeof value === 'object' && value !== null) {
    displayDoc = value;
  } else if (typeof value === 'string') {
    displayDoc = fetchedDoc;
  }

  const hasCustomThumbnail = Boolean(
    (typeof value === 'object' && value !== null && value.url) ||
    (typeof value === 'string' && displayDoc?.url)
  );

  const handleSelect = useCallback(
    (args: any) => {
      if (!args) return;

      let targetDoc: any = null;
      let targetId: string | null = null;

      if (Array.isArray(args) && args.length > 0) {
        const item = args[0];
        if (typeof item === 'object' && item !== null) {
          targetDoc = item.doc || item;
          targetId =
            targetDoc.id ||
            targetDoc._id ||
            (typeof item === 'string' ? item : null);
        } else if (typeof item === 'string') {
          targetId = item;
        }
      } else if (typeof args === 'object' && args !== null) {
        targetDoc = args.doc || args;
        targetId =
          args.docID ||
          targetDoc.id ||
          targetDoc._id ||
          (typeof args === 'string' ? args : null);
      } else if (typeof args === 'string') {
        targetId = args;
      }

      if (targetId) {
        setValue(targetId);
        closeListDrawer();
        if (targetDoc && typeof targetDoc === 'object' && targetDoc.url) {
          setFetchedDoc(targetDoc);
        } else {
          fetch(`${config.serverURL}${config.routes.api}/media/${targetId}`)
            .then((res) => res.json())
            .then((data) => setFetchedDoc(data))
            .catch(() => {});
        }
      }
    },
    [setValue, closeListDrawer, config.serverURL, config.routes.api]
  );

  const handleDocCreate = useCallback(
    (args: any) => {
      if (!args) return;
      const doc = args?.doc || args;
      const id = doc?.id || doc?._id || (typeof doc === 'string' ? doc : null);
      if (id) {
        setValue(id);
        closeCreateDocDrawer();
        if (typeof doc === 'object' && doc.url) {
          setFetchedDoc(doc);
        } else {
          fetch(`${config.serverURL}${config.routes.api}/media/${id}`)
            .then((res) => res.json())
            .then((data) => setFetchedDoc(data))
            .catch(() => {});
        }
      }
    },
    [setValue, closeCreateDocDrawer, config.serverURL, config.routes.api]
  );

  const handleRemove = useCallback(() => {
    setValue(null);
    setFetchedDoc(null);
  }, [setValue]);

  const renderThumbnailContent = () => {
    if (displayDoc?.url) {
      return (
        <img
          src={displayDoc.url}
          alt='Custom thumbnail preview'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--theme-elevation-400)',
          fontSize: '0.85rem',
          textAlign: 'center',
          padding: '16px',
          userSelect: 'none',
        }}
      >
        <span style={{ fontWeight: 500 }}>
          {ratio === '9:16' ? '9:16' : '16:9'} thumbnail preview
        </span>
        <span style={{ fontSize: '0.9rem', color: '#71717a' }}>
          Leave empty to automatically use Cloudflare thumbnail
        </span>
      </div>
    );
  };

  return (
    <div
      className='field-type upload custom-thumbnail-field'
      style={{ marginBottom: '2rem' }}
    >
      <FieldLabel
        label={field.label || 'Video Thumbnail'}
        path={path}
      />

      <div
        style={{
          width: ratio === '9:16' ? 'auto' : '100%',
          height: '428px',
          aspectRatio: ratio === '9:16' ? '9/16' : '16/9',
          maxWidth: '100%',
          background: '#202528',
          border: '1px solid #2B2B30',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          margin: ratio === '9:16' ? '0 auto 10px auto' : '0 0 10px 0',
        }}
      >
        {renderThumbnailContent()}
      </div>

      {field.admin?.description && (
        <div
          className='field-description'
          style={{
            marginBottom: '16px',
            fontSize: '0.85rem',
            color: 'var(--theme-elevation-400)',
          }}
        >
          {typeof field.admin.description === 'string'
            ? field.admin.description
            : 'Upload a high-quality thumbnail...'}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type='button'
          disabled={readOnly}
          onClick={() => setIsReplaceModalOpen(true)}
          style={{
            ...buttonStyle,
            opacity: readOnly ? 0.5 : 1,
            cursor: readOnly ? 'not-allowed' : 'pointer',
          }}
        >
          {hasCustomThumbnail ? 'Replace' : 'Upload'}
        </button>
        <button
          type='button'
          onClick={handleRemove}
          disabled={readOnly || !hasCustomThumbnail}
          style={{
            ...buttonStyle,
            opacity: readOnly || !hasCustomThumbnail ? 0.5 : 1,
            cursor: readOnly || !hasCustomThumbnail ? 'not-allowed' : 'pointer',
          }}
        >
          Remove
        </button>
      </div>

      {isReplaceModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px',
          }}
          onClick={() => setIsReplaceModalOpen(false)}
        >
          <div
            style={{
              background: '#18181b',
              border: '1px solid #2b2b30',
              borderRadius: '10px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {hasCustomThumbnail
                  ? 'Replace Thumbnail'
                  : 'Upload Custom Thumbnail'}
              </h3>
              <button
                type='button'
                onClick={() => setIsReplaceModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1,
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#9ca3af',
                lineHeight: 1.5,
              }}
            >
              {hasCustomThumbnail
                ? 'How would you like to select the replacement thumbnail?'
                : 'Upload a custom thumbnail image or select one from existing media library.'}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '12px 0',
              }}
            >
              <button
                type='button'
                onClick={() => {
                  setIsReplaceModalOpen(false);
                  openCreateDocDrawer();
                }}
                style={{
                  height: '36px',
                  padding: '0 18px',
                  borderRadius: '999px',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <line
                    x1='12'
                    y1='5'
                    x2='12'
                    y2='19'
                  />
                  <line
                    x1='5'
                    y1='12'
                    x2='19'
                    y2='12'
                  />
                </svg>
                Create New
              </button>

              <span
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: 500,
                }}
              >
                or
              </span>

              <button
                type='button'
                onClick={() => {
                  setIsReplaceModalOpen(false);
                  openListDrawer();
                }}
                style={{
                  height: '36px',
                  padding: '0 18px',
                  borderRadius: '999px',
                  background: '#202024',
                  color: '#fff',
                  border: '1px solid #3b3b40',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.15s ease, border-color 0.15s ease',
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
                >
                  <rect
                    x='3'
                    y='3'
                    width='18'
                    height='18'
                    rx='2'
                    ry='2'
                  />
                  <circle
                    cx='8.5'
                    cy='8.5'
                    r='1.5'
                  />
                  <polyline points='21 15 16 10 5 21' />
                </svg>
                Choose from existing
              </button>
            </div>
          </div>
        </div>
      )}

      {showError && errorMessage && (
        <div className='field-error'>{errorMessage}</div>
      )}

      <ListDrawer onSelect={handleSelect} />
      <CreateDocDrawer onSave={handleDocCreate} />
    </div>
  );
};

export default CustomThumbnailField;
