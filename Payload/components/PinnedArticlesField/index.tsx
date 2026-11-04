'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { components as SelectComponents } from 'react-select';

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  ReactSelect,
  useConfig,
  useField,
  useFormFields,
} from '@payloadcms/ui';
import type { RelationshipFieldClientComponent } from 'payload';
import * as qs from 'qs-esm';

type ArticleOption = {
  label: string;
  value: string;
  title: string;
  article_id?: string;
  [key: string]: unknown;
};

const extractId = (val: unknown): string | null => {
  if (!val) return null;
  if (typeof val === 'object' && val !== null && 'id' in val) {
    return (val as { id: unknown }).id
      ? String((val as { id: unknown }).id)
      : null;
  }
  return String(val);
};

const Select = ReactSelect as React.ComponentType<
  React.ComponentProps<typeof ReactSelect> & {
    formatOptionLabel?: (option: ArticleOption) => React.ReactNode;
    isOptionDisabled?: (option: ArticleOption) => boolean;
  }
>;

export const PinnedArticlesField: RelationshipFieldClientComponent = (
  props
) => {
  const { path: pathFromProps, field, readOnly } = props;
  const className = field?.admin?.className;
  const style = field?.admin?.style;
  const path = pathFromProps ?? field.name;

  const isMulti = Boolean(field && 'hasMany' in field && field.hasMany);
  const maxRows = (field && 'maxRows' in field && field.maxRows) || 3;

  const categoryValue = useFormFields(([fields]) => fields?.category?.value);
  const isCategoryField = categoryValue !== undefined;
  const categoryId =
    typeof categoryValue === 'object' &&
    categoryValue !== null &&
    'id' in categoryValue
      ? (categoryValue as { id: unknown }).id
      : categoryValue;

  const { value, setValue, showError } = useField<any>({ path });
  const { config } = useConfig();
  const { routes, serverURL } = config;
  const apiBase = `${serverURL || ''}${routes.api}`;

  const [options, setOptions] = useState<ArticleOption[]>([]);
  const [docMap, setDocMap] = useState<
    Record<string, { id: string; title: string; article_id?: string }>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef<number>(1);
  const hasNextPageRef = useRef<boolean>(true);
  const searchRef = useRef<string>('');
  const isFetchingRef = useRef<boolean>(false);
  const fetchIdRef = useRef<number>(0);
  const lastFetchedCategoryRef = useRef<string | null>(null);

  // Derive list of currently selected IDs
  const selectedIds: string[] = useMemo(() => {
    if (isMulti) {
      if (Array.isArray(value)) {
        return value.map(extractId).filter((id): id is string => Boolean(id));
      }
      return [];
    }
    const id = extractId(value);
    return id ? [id] : [];
  }, [isMulti, value]);

  // Fetch article details for any selected IDs not in docMap
  useEffect(() => {
    const missing = selectedIds.filter((id) => !docMap[id]);
    if (missing.length === 0) return;

    let isMounted = true;
    const fetchMissing = async () => {
      try {
        const queryObj = {
          depth: 0,
          limit: missing.length,
          where: {
            id: { in: missing },
          },
        };
        const res = await fetch(`${apiBase}/news?${qs.stringify(queryObj)}`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data?.docs)) {
          setDocMap((prev) => {
            const next = { ...prev };
            data.docs.forEach((doc: any) => {
              next[String(doc.id)] = {
                id: String(doc.id),
                title: doc.title,
                article_id: doc.article_id,
              };
            });
            return next;
          });
        }
      } catch {
        // Ignore fetch errors
      }
    };

    void fetchMissing();
    return () => {
      isMounted = false;
    };
  }, [selectedIds, apiBase, docMap]);

  // Synchronize category pinned articles when category changes (for PinnedNewsCategories)
  const lastCategoryRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isCategoryField) return;

    if (!categoryId) {
      lastCategoryRef.current = null;
      return;
    }

    const categoryIdStr = String(categoryId);
    if (lastCategoryRef.current === categoryIdStr) {
      return;
    }

    lastCategoryRef.current = categoryIdStr;

    let isMounted = true;
    const fetchCategoryPinned = async () => {
      try {
        const res = await fetch(
          `${apiBase}/news-categories/${categoryId}?depth=0`,
          { credentials: 'include' }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          if (
            Array.isArray(data?.pinnedArticles) &&
            data.pinnedArticles.length > 0
          ) {
            const ids = data.pinnedArticles.map((item: any) =>
              typeof item === 'object' && item !== null ? item.id : item
            );
            setValue(ids);
          } else {
            setValue([]);
          }
        }
      } catch {
        // Ignore fetch errors
      }
    };

    void fetchCategoryPinned();
    return () => {
      isMounted = false;
    };
  }, [categoryValue, categoryId, isCategoryField, apiBase, setValue]);

  // Search and paginate function that queries BOTH title AND article_id inside the dropdown
  const fetchOptions = useCallback(
    async (searchText: string, pageToFetch = 1, append = false) => {
      if (append) {
        if (isFetchingRef.current || !hasNextPageRef.current) return;
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      isFetchingRef.current = true;
      const currentFetchId = ++fetchIdRef.current;

      try {
        const andConditions: any[] = [
          {
            _status: { equals: 'published' },
          },
        ];

        const trimmed = searchText.trim();
        if (trimmed) {
          andConditions.push({
            or: [
              { title: { like: trimmed } },
              { article_id: { like: trimmed } },
            ],
          });
        }

        if (categoryId) {
          andConditions.push({
            category: { equals: categoryId },
          });
        }

        const queryObj = {
          depth: 0,
          limit: 20,
          page: pageToFetch,
          sort: '-publishedAt',
          where: {
            and: andConditions,
          },
        };

        const res = await fetch(`${apiBase}/news?${qs.stringify(queryObj)}`, {
          credentials: 'include',
        });

        if (currentFetchId !== fetchIdRef.current) {
          return;
        }

        if (res.ok) {
          const data = await res.json();
          const docs = data?.docs || [];
          const hasNext = Boolean(data?.hasNextPage);
          const currentPage =
            typeof data?.page === 'number' ? data.page : pageToFetch;

          pageRef.current = currentPage;
          hasNextPageRef.current = hasNext;

          setDocMap((prev) => {
            const next = { ...prev };
            docs.forEach((doc: any) => {
              next[String(doc.id)] = {
                id: String(doc.id),
                title: doc.title,
                article_id: doc.article_id,
              };
            });
            return next;
          });

          const newOptions: ArticleOption[] = docs.map((doc: any) => ({
            label: doc.article_id
              ? `${doc.title} (${doc.article_id})`
              : doc.title,
            value: String(doc.id),
            title: doc.title,
            article_id: doc.article_id,
          }));

          if (append) {
            setOptions((prev) => {
              const existingIds = new Set(prev.map((opt) => opt.value));
              const uniqueNew = newOptions.filter(
                (opt) => !existingIds.has(opt.value)
              );
              return [...prev, ...uniqueNew];
            });
          } else {
            setOptions(newOptions);
          }
        }
      } catch {
        // Ignore fetch errors
      } finally {
        if (currentFetchId === fetchIdRef.current) {
          isFetchingRef.current = false;
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [apiBase, categoryId]
  );

  const handleInputChange = useCallback(
    (newSearch: string, actionMeta?: { action?: string }) => {
      if (!actionMeta || actionMeta.action === 'input-change') {
        searchRef.current = newSearch;
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
          pageRef.current = 1;
          hasNextPageRef.current = true;
          void fetchOptions(newSearch, 1, false);
        }, 250);
      }
    },
    [fetchOptions]
  );

  const handleMenuOpen = useCallback(() => {
    const currentCatStr = categoryId ? String(categoryId) : null;
    if (
      options.length === 0 ||
      lastFetchedCategoryRef.current !== currentCatStr
    ) {
      lastFetchedCategoryRef.current = currentCatStr;
      searchRef.current = '';
      pageRef.current = 1;
      hasNextPageRef.current = true;
      void fetchOptions('', 1, false);
    }
  }, [options.length, categoryId, fetchOptions]);

  const handleMenuClose = useCallback(() => {
    if (searchRef.current !== '') {
      searchRef.current = '';
      pageRef.current = 1;
      hasNextPageRef.current = true;
      void fetchOptions('', 1, false);
    }
  }, [fetchOptions]);

  const handleMenuScrollToBottom = useCallback(() => {
    if (isFetchingRef.current || !hasNextPageRef.current) return;
    void fetchOptions(searchRef.current, pageRef.current + 1, true);
  }, [fetchOptions]);

  const handleChange = useCallback(
    (selected: any) => {
      if (isMulti) {
        if (!selected || !Array.isArray(selected)) {
          setValue([]);
        } else {
          setValue(selected.map((item: any) => item.value));
        }
      } else {
        if (!selected) {
          setValue(null);
        } else {
          setValue(selected.value);
        }
      }
    },
    [isMulti, setValue]
  );

  // Format ReactSelect value without nested ternaries
  const selectValue = useMemo(() => {
    const formatSelectedOption = (id: string): ArticleOption => {
      const doc = docMap[id];
      let label = `Article ID: ${id}`;
      if (doc?.title) {
        label = doc.article_id ? `${doc.title} (${doc.article_id})` : doc.title;
      }

      return {
        label,
        value: id,
        title: doc?.title || `Article ID: ${id}`,
        article_id: doc?.article_id,
      };
    };

    if (isMulti) {
      return selectedIds.map(formatSelectedOption);
    }
    if (selectedIds[0]) {
      return formatSelectedOption(selectedIds[0]);
    }
    return undefined;
  }, [isMulti, selectedIds, docMap]);

  const formatOptionLabel = useCallback(
    (option: ArticleOption) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '2px 0',
        }}
      >
        <span style={{ fontWeight: 500, lineHeight: 1.35 }}>
          {option.title || option.label}
        </span>
      </div>
    ),
    []
  );

  const selectComponents = useMemo(
    () => ({
      MenuList: (menuListProps: any) => (
        <SelectComponents.MenuList {...menuListProps}>
          {menuListProps.children}
          {isLoadingMore && (
            <div
              className='rs__menu-notice rs__menu-notice--loading'
              style={{
                textAlign: 'center',
                fontSize: '0.85rem',
                opacity: 0.7,
                padding: '8px',
              }}
            >
              Loading more articles...
            </div>
          )}
        </SelectComponents.MenuList>
      ),
    }),
    [isLoadingMore]
  );

  const isMaxReached = isMulti && selectedIds.length >= maxRows;

  return (
    <div
      className={[
        'field-type',
        'relationship',
        className,
        showError && 'error',
        readOnly && 'relationship--read-only',
      ]
        .filter(Boolean)
        .join(' ')}
      id={`field-${path.replace(/\./g, '__')}`}
      style={style}
    >
      <FieldLabel
        label={field?.label || (isMulti ? 'Articles' : 'Article')}
        path={path}
        required={field?.required}
      />
      <div className='field-type__wrap'>
        {showError && (
          <FieldError
            path={path}
            showError={showError}
          />
        )}
        <div className='relationship__wrap'>
          <Select
            key={categoryId ? String(categoryId) : 'all'}
            components={selectComponents}
            disabled={readOnly || (isCategoryField && !categoryId)}
            filterOption={() => true}
            formatOptionLabel={formatOptionLabel}
            isClearable={!field?.required}
            isLoading={isLoading || isLoadingMore}
            isMulti={isMulti}
            isOptionDisabled={(option: ArticleOption) => {
              if (isMulti && isMaxReached) {
                return !selectedIds.includes(option.value);
              }
              return false;
            }}
            isSearchable
            onChange={handleChange}
            onInputChange={handleInputChange}
            onMenuClose={handleMenuClose}
            onMenuOpen={handleMenuOpen}
            onMenuScrollToBottom={handleMenuScrollToBottom}
            options={options}
            placeholder={
              isCategoryField && !categoryId
                ? 'Select a category first...'
                : field?.admin?.placeholder ||
                  'Search by article title or article ID...'
            }
            showError={showError}
            value={selectValue}
          />
        </div>
        {field?.admin?.description && (
          <FieldDescription
            description={field.admin.description}
            path={path}
          />
        )}
      </div>
    </div>
  );
};

export default PinnedArticlesField;
