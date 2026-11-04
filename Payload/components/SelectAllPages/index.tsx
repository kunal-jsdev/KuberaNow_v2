'use client';

import { useEffect } from 'react';

import {
  CheckboxInput,
  useField,
  useForm,
  useFormFields,
} from '@payloadcms/ui';

const PAGE_FIELDS = [
  'showOnHome',
  'showOnArticle',
  'showOnTag',
  'showOnCategory',
  'showOnMarket',
  'showOnVideo',
] as const;

export const SelectAllPages: React.FC<{
  path?: string;
  readOnly?: boolean;
}> = ({ path, readOnly }) => {
  const { dispatchFields } = useForm();

  const { value, setValue } = useField<boolean>({ path: path || '' });

  const basePath = path ? path.substring(0, path.lastIndexOf('.')) : '';
  const prefix = basePath ? `${basePath}.` : '';

  const allPagesSelected = useFormFields(([fields]) =>
    PAGE_FIELDS.every((name) => Boolean(fields[`${prefix}${name}`]?.value))
  );

  // Keep "Select All Pages" in step with the individual checkboxes: unticking
  // any page clears it, ticking every page sets it again.
  useEffect(() => {
    if (Boolean(value) !== allPagesSelected) {
      setValue(allPagesSelected, true);
    }
  }, [allPagesSelected, value, setValue]);

  const handleToggle = () => {
    if (readOnly) return;

    const newValue = !value;
    setValue(newValue);

    PAGE_FIELDS.forEach((name) => {
      dispatchFields({
        type: 'UPDATE',
        path: `${prefix}${name}`,
        value: newValue,
      });
    });
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <CheckboxInput
        checked={Boolean(value)}
        onToggle={handleToggle}
        label='Select All Pages'
        readOnly={readOnly}
      />
    </div>
  );
};
