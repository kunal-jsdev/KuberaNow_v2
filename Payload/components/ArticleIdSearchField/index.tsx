'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useConfig, useField } from '@payloadcms/ui';
import type { RelationshipFieldClientComponent } from 'payload';

type ArticleDoc = {
  id: string | number;
  title?: string;
  article_id?: string;
};

/**
 * Custom single-value article picker.
 * Searches by title OR article_id in the same dropdown — no separate input.
 *
 * Used for the `article` relationship inside Pinned Articles and
 * Latest News Pinned Articles globals.
 */
export const ArticleSearchField: RelationshipFieldClientComponent = (props) => {
  const { path: pathFromProps, field } = props;
  const path = pathFromProps ?? field.name;

  const { value, setValue } = useField<
    string | number | { id: string | number } | null
  >({ path });

  const { config } = useConfig();
  const apiBase = `${config.serverURL || ''}${config.routes.api}`;

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ArticleDoc[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ArticleDoc | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedIdRef = useRef<string | null>(null);

  // Resolve current value to a display document
  useEffect(() => {
    let isMounted = true;
    if (!value) {
      resolvedIdRef.current = null;
      void Promise.resolve().then(() => {
        if (isMounted) setSelectedDoc(null);
      });
      return;
    }
    const id =
      typeof value === 'object' && value !== null
        ? String((value as any).id ?? '')
        : String(value);

    if (!id || id === resolvedIdRef.current) return;
    resolvedIdRef.current = id;

    // If value is already a populated object, use it directly
    if (typeof value === 'object' && value !== null && (value as any).title) {
      const doc = value as any;
      void Promise.resolve().then(() => {
        if (isMounted) setSelectedDoc(doc);
      });
      return;
    }

    fetch(`${apiBase}/news/${id}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (isMounted) setSelectedDoc(d || null);
      })
      .catch(() => {
        if (isMounted) setSelectedDoc(null);
      });

    return () => {
      isMounted = false;
    };
  }, [value, apiBase]);

  // Debounced search — title OR article_id, only published
  const search = useCallback(
    (term: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      if (!term.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      searchTimer.current = setTimeout(async () => {
        try {
          const enc = encodeURIComponent(term);
          const url = `${apiBase}/news?where[and][0][or][0][title][like]=${enc}&where[and][0][or][1][article_id][like]=${enc}&where[and][1][_status][equals]=published&depth=0&limit=10`;
          const res = await fetch(url, { credentials: 'include' });
          const data = await res.json();
          setResults(data.docs ?? []);
        } catch {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [apiBase]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (doc: ArticleDoc) => {
    resolvedIdRef.current = String(doc.id);
    setValue(doc.id);
    setSelectedDoc(doc);
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    resolvedIdRef.current = null;
    setValue(null);
    setSelectedDoc(null);
    setSearchTerm('');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '6px 10px',
    fontSize: '13px',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '4px',
    background: 'var(--theme-input-bg)',
    color: 'var(--theme-text)',
    outline: 'none',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 2px)',
    left: 0,
    right: 0,
    background: 'var(--theme-bg)',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '4px',
    zIndex: 999,
    maxHeight: '220px',
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
  };

  const description =
    typeof (field as any).admin?.description === 'string'
      ? (field as any).admin.description
      : '';

  return (
    <div ref={containerRef}>
      {selectedDoc ? (
        /* ── Selected state ── */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '4px',
            background: 'var(--theme-elevation-50, var(--theme-bg))',
          }}
        >
          <span
            style={{ flex: 1, fontSize: '13px', color: 'var(--theme-text)' }}
          >
            {selectedDoc.title ?? `ID: ${selectedDoc.id}`}
          </span>
          {selectedDoc.article_id && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--theme-elevation-500)',
                fontFamily: 'monospace',
              }}
            >
              {selectedDoc.article_id}
            </span>
          )}
          <button
            type='button'
            onClick={handleClear}
            title='Clear'
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--theme-elevation-500)',
              fontSize: '16px',
              lineHeight: 1,
              padding: '0 2px',
            }}
          >
            x
          </button>
        </div>
      ) : (
        /* ── Search state ── */
        <div style={{ position: 'relative' }}>
          <input
            type='text'
            placeholder='Search by title or Article ID...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
              search(e.target.value);
            }}
            onFocus={() => setIsOpen(true)}
            style={inputStyle}
          />

          {isOpen && (searchTerm || isSearching) && (
            <div style={dropdownStyle}>
              {isSearching && (
                <div
                  style={{
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: 'var(--theme-elevation-500)',
                  }}
                >
                  Searching...
                </div>
              )}
              {!isSearching && results.length === 0 && searchTerm && (
                <div
                  style={{
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: 'var(--theme-elevation-500)',
                  }}
                >
                  No articles found
                </div>
              )}
              {results.map((doc) => (
                <div
                  key={doc.id}
                  onMouseDown={() => handleSelect(doc)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--theme-elevation-100)',
                    fontSize: '13px',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      'var(--theme-elevation-100)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <span style={{ color: 'var(--theme-text)' }}>
                    {doc.title}
                  </span>
                  {doc.article_id && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--theme-elevation-500)',
                        fontFamily: 'monospace',
                        marginLeft: '8px',
                        flexShrink: 0,
                      }}
                    >
                      {doc.article_id}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {description && (
        <p
          style={{
            margin: '4px 0 0',
            fontSize: '12px',
            color: 'var(--theme-elevation-500)',
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default ArticleSearchField;
