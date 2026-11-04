'use client';

import { useMemo } from 'react';

import {
  FieldDescription,
  FieldLabel,
  ReactSelect,
  useField,
} from '@payloadcms/ui';
import type { SelectFieldClientProps } from 'payload';

const ALL = '__all__';

type Option = { label: string; value: string };

type PagesVisibilityFieldProps = SelectFieldClientProps & {
  /** The catch-all choice, stored as an empty selection, e.g. "All Market Pages". */
  allLabel?: string;
};

/**
 * A multi-select of the sub-pages a sidebar widget can target (market pages,
 * video pages), taking its choices from the select field's own options. An
 * empty selection means every sub-page and shows as the `allLabel` option.
 */
export const PagesVisibilityField = ({
  field,
  path,
  readOnly,
  allLabel = 'All Pages',
}: PagesVisibilityFieldProps) => {
  const { setValue, value } = useField<string[]>({ path });

  const allOption: Option = useMemo(
    () => ({ label: allLabel, value: ALL }),
    [allLabel]
  );

  const options: Option[] = useMemo(
    () =>
      (field?.options ?? []).map((option) =>
        typeof option === 'string'
          ? { label: option, value: option }
          : {
              label:
                typeof option.label === 'string' ? option.label : option.value,
              value: option.value,
            }
      ),
    [field?.options]
  );

  const selectedOptions = useMemo(() => {
    const selected = value ?? [];

    if (!selected.length) return [allOption];

    return selected.map(
      (entry) =>
        options.find((option) => option.value === entry) ?? {
          label: entry,
          value: entry,
        }
    );
  }, [value, options, allOption]);

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
        options={[allOption, ...options]}
        value={selectedOptions}
        onChange={(selected) => {
          const picked = (
            Array.isArray(selected) ? selected : [selected]
          ).filter(Boolean) as Option[];

          // The "All" option is exclusive both ways: picking it drops the
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

export default PagesVisibilityField;
