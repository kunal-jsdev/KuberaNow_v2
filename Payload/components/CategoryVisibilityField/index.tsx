'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  FieldDescription,
  FieldLabel,
  ReactSelect,
  useField,
} from '@payloadcms/ui';
import type { RelationshipFieldClientComponent } from 'payload';

const ALL = '__all__';

type Option = { label: string; value: string };

const ALL_OPTION: Option = { label: 'All Categories', value: ALL };

export const CategoryVisibilityField: RelationshipFieldClientComponent = ({
  field,
  path,
  readOnly,
}) => {
  const { setValue, value } = useField<(string | { id: string })[]>({ path });
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(
          '/api/news-categories?limit=100&depth=0&sort=title',
          { credentials: 'include', signal: controller.signal }
        );

        if (!res.ok) return;

        const data = (await res.json()) as {
          docs?: { id: string; title: string }[];
        };

        setOptions(
          (data.docs ?? []).map((doc) => ({
            label: doc.title,
            value: doc.id,
          }))
        );
      } catch {
        // Aborted or offline — only "All Categories" stays selectable.
      }
    };

    void load();

    return () => controller.abort();
  }, []);

  // Stored values are ids, but depth > 0 hands back populated objects.
  const selectedIds = useMemo(
    () =>
      (value ?? []).map((entry) =>
        typeof entry === 'object' && entry !== null ? entry.id : entry
      ),
    [value]
  );

  const selectedOptions = useMemo(() => {
    if (!selectedIds.length) return [ALL_OPTION];

    return selectedIds.map(
      (id) =>
        options.find((option) => option.value === id) ?? {
          label: id,
          value: id,
        }
    );
  }, [selectedIds, options]);

  return (
    <div className='field-type'>
      <FieldLabel
        label={field?.label}
        path={path}
      />
      <ReactSelect
        isMulti
        isClearable={false}
        disabled={readOnly}
        options={[ALL_OPTION, ...options]}
        value={selectedOptions}
        onChange={(selected) => {
          const picked = (
            Array.isArray(selected) ? selected : [selected]
          ).filter(Boolean) as Option[];

          // "All Categories" is exclusive both ways: picking it drops the
          // specific ones, and picking a specific one drops it.
          if (!picked.length || picked[picked.length - 1]?.value === ALL) {
            setValue([]);
            return;
          }

          setValue(
            picked
              .filter((option) => option.value !== ALL)
              .map((option) => option.value)
          );
        }}
      />
      <FieldDescription
        description={field?.admin?.description}
        path={path}
      />
    </div>
  );
};

export default CategoryVisibilityField;
