'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  components as SelectComponents,
  type InputProps,
  type MultiValueGenericProps,
} from 'react-select';

import {
  EditIcon,
  FieldDescription,
  FieldLabel,
  ReactSelect,
  toast,
  useConfig,
  useDebounce,
  useDocumentDrawer,
  useField,
} from '@payloadcms/ui';
import type { RelationshipFieldClientComponent, TypeWithID } from 'payload';

import { isValidTagTitle, TAG_TITLE_RULE } from '@/utils/titleRules';

const BaseInput = SelectComponents.Input;
const BaseMultiValueLabel = SelectComponents.MultiValueLabel;

type Option = { label: string; value: string };

type TagDoc = { id: number | string; title: string };

type TagsResponse = { docs?: TagDoc[] };

type MaybeNewOption = Option & { __isNew__?: boolean };

const toOption = (doc: TagDoc): Option => ({
  label: doc.title,
  value: String(doc.id),
});

const TAGS_SLUG = 'tags';
const SEARCH_LIMIT = 50;

const invalidTitleMessage = (title: string): string | null =>
  isValidTagTitle(title) ? null : `Tag "${title}" ${TAG_TITLE_RULE}`;

type PayloadError = {
  message?: string;
  data?: { errors?: { message?: string; path?: string }[] };
};

const readCreateError = (json: unknown, title: string): string => {
  const error = (json as { errors?: PayloadError[] })?.errors?.[0];
  const fieldMessage = error?.data?.errors?.find((e) => e?.message)?.message;

  return fieldMessage ?? error?.message ?? `Could not create tag "${title}".`;
};

const splitTitles = (raw: string): string[] => {
  const seen = new Set<string>();

  return raw
    .split(',')
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) return false;
      const key = part.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

/**
 * Sets an input's value the way the browser would, so React and react-select
 * both observe the change. Assigning `el.value` alone does not notify them.
 */
const setInputValue = (el: HTMLInputElement, next: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;

  setter?.call(el, next);
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

export const TagsField: RelationshipFieldClientComponent = ({
  field,
  path: pathFromProps,
  readOnly,
}) => {
  const path = pathFromProps ?? field.name;
  const { setValue, value, showError, errorMessage } = useField<
    (number | string)[]
  >({ path });

  const { config } = useConfig();
  const { routes, serverURL } = config;
  const apiBase = `${serverURL}${routes.api}`;

  const [options, setOptions] = useState<Option[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Titles of already-selected tags, so chips keep their label after reload.
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const hydratedFor = useRef<string>('');

  const selectedIds = useMemo(
    () => (Array.isArray(value) ? value.map(String) : []),
    [value]
  );

  // Mirrored in a ref so callbacks can read the current selection without
  // taking it as a dependency and rebuilding on every change.
  const selectedIdsRef = useRef(selectedIds);
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  useEffect(() => {
    const key = selectedIds.join(',');
    if (!selectedIds.length || hydratedFor.current === key) return;
    hydratedFor.current = key;

    const missing = selectedIds.filter(
      (id) => !selectedOptions.some((option) => option.value === id)
    );
    if (!missing.length) return;

    const query = missing.map((id) => `where[id][in][]=${id}`).join('&');

    void (async () => {
      try {
        const res = await fetch(
          `${apiBase}/${TAGS_SLUG}?depth=0&limit=${missing.length}&${query}`,
          { credentials: 'include' }
        );
        if (!res.ok) return;
        const json: TagsResponse = await res.json();
        const fetched = (json?.docs ?? []).map(toOption);
        setSelectedOptions((prev) => {
          const seen = new Set(prev.map((option) => option.value));
          return [...prev, ...fetched.filter((o) => !seen.has(o.value))];
        });
      } catch {
        // Labels are cosmetic a failure here should not break the field.
      }
    })();
  }, [apiBase, selectedIds, selectedOptions]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          depth: '0',
          limit: String(SEARCH_LIMIT),
          sort: 'title',
        });
        if (debouncedSearch) {
          params.set('where[title][like]', debouncedSearch);
        }

        const res = await fetch(`${apiBase}/${TAGS_SLUG}?${params}`, {
          credentials: 'include',
        });
        if (!res.ok || cancelled) return;

        const json: TagsResponse = await res.json();
        if (cancelled) return;

        setOptions((json?.docs ?? []).map(toOption));
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiBase, debouncedSearch]);

  const createTag = useCallback(
    async (
      title: string,
      { silent = false }: { silent?: boolean } = {}
    ): Promise<Option | null> => {
      const invalid = invalidTitleMessage(title);
      if (invalid) {
        toast.error(invalid);
        return null;
      }

      setIsCreating(true);
      try {
        const existingRes = await fetch(
          `${apiBase}/${TAGS_SLUG}?depth=0&limit=${SEARCH_LIMIT}&where[title][like]=${encodeURIComponent(title)}`,
          { credentials: 'include' }
        );

        if (existingRes.ok) {
          const existingJson: TagsResponse = await existingRes.json();
          const normalised = title.trim().toLocaleLowerCase();
          const existing = (existingJson?.docs ?? []).find(
            (doc) => doc.title?.trim().toLocaleLowerCase() === normalised
          );

          if (existing) {
            const alreadySelected = selectedIdsRef.current.includes(
              String(existing.id)
            );

            if (!silent && !alreadySelected && existing.title !== title) {
              toast.info(`Using existing tag "${existing.title}".`);
            }

            return toOption(existing);
          }
        }

        const res = await fetch(`${apiBase}/${TAGS_SLUG}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });

        const json = await res.json();

        if (!res.ok) {
          toast.error(readCreateError(json, title));
          return null;
        }

        const doc = json?.doc ?? json;
        if (!silent) toast.success(`Tag "${doc.title}" created.`);
        return { label: doc.title, value: String(doc.id) };
      } catch {
        toast.error(`Could not create tag "${title}".`);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [apiBase]
  );

  const cacheOptions = useCallback((tags: Option[]) => {
    if (!tags.length) return;

    const merge = (prev: Option[]) => {
      const seen = new Set(prev.map((option) => option.value));
      return [...prev, ...tags.filter((tag) => !seen.has(tag.value))];
    };

    setSelectedOptions(merge);
    setOptions(merge);
  }, []);

  const resolveTitles = useCallback(
    async (titles: string[]): Promise<Option[]> => {
      if (!titles.length) return [];

      setIsCreating(true);
      try {
        const resolved: Option[] = [];

        for (const title of titles) {
          const tag = await createTag(title, { silent: titles.length > 1 });
          if (tag) resolved.push(tag);
        }

        return resolved;
      } finally {
        setIsCreating(false);
      }
    },
    [createTag]
  );

  const handleChange = useCallback(
    async (incoming: unknown) => {
      const next = (Array.isArray(incoming) ? incoming : [incoming]).filter(
        Boolean
      ) as MaybeNewOption[];

      const keep = next.filter((option) => !option.__isNew__);
      const typed = next
        .filter((option) => option.__isNew__)
        .map((option) => String(option.value))
        .join(',');

      const resolvedTags = await resolveTitles(splitTitles(typed));

      cacheOptions(resolvedTags);
      const nextSelection = [
        ...new Set(
          [...keep, ...resolvedTags].map((option) => String(option.value))
        ),
      ];
      selectedIdsRef.current = nextSelection;
      setValue(nextSelection);
    },
    [cacheOptions, resolveTitles, setValue]
  );

  const commitTyped = useCallback(
    async (raw: string): Promise<boolean> => {
      const titles = splitTitles(raw);
      if (!titles.length) return false;

      const resolvedTags = await resolveTitles(titles);
      if (!resolvedTags.length) return false;

      cacheOptions(resolvedTags);
      const nextSelection = [
        ...new Set([
          ...selectedIdsRef.current,
          ...resolvedTags.map((option) => option.value),
        ]),
      ];
      selectedIdsRef.current = nextSelection;
      setValue(nextSelection);

      if (titles.length > 1) {
        toast.success(`Added ${resolvedTags.length} tags.`);
      }

      return true;
    },
    [cacheOptions, resolveTitles, setValue]
  );

  const [EditDrawer, , { isDrawerOpen, openDrawer }] = useDocumentDrawer({
    collectionSlug: TAGS_SLUG,
    id: editingId ?? undefined,
  });

  const handleDocumentOpen = useCallback(({ id }: { id: number | string }) => {
    setEditingId(String(id));
  }, []);

  const pendingOpenFor = useRef<string | null>(null);
  useEffect(() => {
    if (!editingId || pendingOpenFor.current === editingId) return;
    pendingOpenFor.current = editingId;
    openDrawer();
  }, [editingId, openDrawer]);

  const hasOpened = useRef(false);
  useEffect(() => {
    if (isDrawerOpen) {
      hasOpened.current = true;
      return;
    }

    if (hasOpened.current) {
      hasOpened.current = false;
      pendingOpenFor.current = null;
      setEditingId(null);
    }
  }, [isDrawerOpen]);

  const handleEditSave = useCallback(({ doc }: { doc: TypeWithID }) => {
    const updated = toOption(doc as unknown as TagDoc);
    const replace = (prev: Option[]) =>
      prev.map((option) => (option.value === updated.value ? updated : option));

    setSelectedOptions(replace);
    setOptions(replace);
  }, []);

  const handleEditDelete = useCallback(
    ({ id }: { id: string }) => {
      const removed = String(id);
      const drop = (prev: Option[]) =>
        prev.filter((option) => option.value !== removed);

      setSelectedOptions(drop);
      setOptions(drop);
      setValue(selectedIds.filter((selected) => selected !== removed));
    },
    [selectedIds, setValue]
  );

  const searchRef = useRef('');

  const committing = useRef(false);
  const commitFromInput = useCallback(
    (el: HTMLInputElement) => {
      const raw = el.value;
      if (!splitTitles(raw).length) return false;

      if (committing.current) return false;
      committing.current = true;

      setInputValue(el, '');
      searchRef.current = '';

      void commitTyped(raw).finally(() => {
        committing.current = false;
      });

      return true;
    },
    [commitTyped]
  );

  // Set while the user is moving through options with the arrow keys, so Enter
  // is understood as "select the highlighted option" rather than "commit text".
  const navigatingOptions = useRef(false);
  const boundInput = useRef<HTMLInputElement | null>(null);
  const unbindInput = useRef<(() => void) | null>(null);
  const bindInput = useCallback(
    (el: HTMLInputElement | null) => {
      if (boundInput.current === el) return;

      unbindInput.current?.();
      unbindInput.current = null;

      boundInput.current = el;
      if (!el) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.isComposing) return;

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          navigatingOptions.current = true;
          return;
        }

        if (event.key === ',') {
          if (!navigatingOptions.current && splitTitles(el.value).length) {
            event.preventDefault();
            event.stopPropagation();
            commitFromInput(el);
            return;
          }
        }

        if (event.key !== 'Enter' && event.key !== 'Tab') return;

        if (navigatingOptions.current) {
          navigatingOptions.current = false;
          return;
        }

        if (!splitTitles(el.value).length) return;

        event.preventDefault();
        event.stopPropagation();
        commitFromInput(el);
      };

      // Typing again means the user is back to entering a name, not browsing.
      const onInput = () => {
        navigatingOptions.current = false;
        if (el.value.includes(',')) {
          commitFromInput(el);
        }
      };

      const onBlur = () => {
        // Leaving the field mid-navigation should not turn the browsed-past
        // text into a new tag.
        if (navigatingOptions.current) {
          navigatingOptions.current = false;
          return;
        }

        commitFromInput(el);
      };

      el.addEventListener('keydown', onKeyDown, true);
      el.addEventListener('blur', onBlur);
      el.addEventListener('input', onInput);

      unbindInput.current = () => {
        el.removeEventListener('keydown', onKeyDown, true);
        el.removeEventListener('blur', onBlur);
        el.removeEventListener('input', onInput);
      };
    },
    [commitFromInput]
  );

  // Detach on unmount.
  useEffect(() => () => unbindInput.current?.(), []);

  const selectComponents = useMemo(
    () => ({
      Input: (inputProps: InputProps<Option, true>) => {
        const typed = String(inputProps?.value ?? '');
        if (typed !== searchRef.current) {
          searchRef.current = typed;
          queueMicrotask(() => setSearch(typed));
        }

        return (
          <BaseInput
            {...inputProps}
            innerRef={(el: HTMLInputElement | null) => {
              const forward = inputProps.innerRef as
                ((node: HTMLInputElement | null) => void) | null | undefined;
              if (typeof forward === 'function') forward(el);

              bindInput(el);
            }}
          />
        );
      },
      MultiValueLabel: (labelProps: MultiValueGenericProps<Option, true>) => {
        const option = labelProps.data as Option;

        return (
          <div
            className='relationship--multi-value-label'
            title={option.label}
          >
            <div className='relationship--multi-value-label__content'>
              <BaseMultiValueLabel {...labelProps} />
            </div>
            {!readOnly && (
              <button
                aria-label={`Edit ${option.label}`}
                className='relationship--multi-value-label__drawer-toggler'
                onClick={() => handleDocumentOpen({ id: option.value })}
                // react-select would otherwise treat this as a chip interaction.
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                type='button'
              >
                <EditIcon className='relationship--multi-value-label__icon' />
              </button>
            )}
          </div>
        );
      },
    }),
    [bindInput, handleDocumentOpen, readOnly]
  );

  const valueOptions = useMemo(
    () =>
      selectedIds.map(
        (id) =>
          [...selectedOptions, ...options].find(
            (option) => option.value === id
          ) ?? { label: id, value: id }
      ),
    [options, selectedIds, selectedOptions]
  );

  return (
    <div className='field-type relationship'>
      <FieldLabel
        label={field.label}
        path={path}
      />
      <ReactSelect
        isMulti
        isSortable
        isCreatable
        isClearable
        disabled={readOnly || isCreating}
        isLoading={isLoading || isCreating}
        options={options}
        value={valueOptions}
        onChange={handleChange}
        components={selectComponents}
        filterOption={(option: unknown) => option !== null}
        showError={showError}
        placeholder='Select or type to create a tag'
        noOptionsMessage={({ inputValue }) =>
          inputValue
            ? `No tag matches "${inputValue}" keep typing to create it or it was already added.`
            : 'No tags yet type to create one.'
        }
      />
      {field.admin?.description && (
        <FieldDescription
          description={field.admin.description}
          path={path}
        />
      )}
      {showError && errorMessage && (
        <div className='field-error'>{errorMessage}</div>
      )}
      {editingId && (
        <EditDrawer
          onSave={handleEditSave}
          onDelete={handleEditDelete}
        />
      )}
    </div>
  );
};

export default TagsField;
