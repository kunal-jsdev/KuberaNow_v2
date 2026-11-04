'use client';

import type { FC } from 'react';

import { useField, useForm } from '@payloadcms/ui';

type ToggleSwitchFieldProps = {
  path: string;
  field: {
    label?: string;
    defaultValue?: boolean;
    admin?: {
      description?: string;
      disabled?: boolean;
    };
  };
};

export const ToggleSwitchField: FC<ToggleSwitchFieldProps> = ({
  path,
  field,
}) => {
  const { value, setValue } = useField<boolean>({ path });
  const { setModified } = useForm();
  let isChecked = Boolean(value);
  if (typeof value === 'boolean') {
    isChecked = value;
  } else if (typeof field.defaultValue === 'boolean') {
    isChecked = field.defaultValue;
  }

  const handleToggle = () => {
    const nextVal = !isChecked;
    setValue(nextVal);
    if (typeof setModified === 'function') {
      setModified(true);
    }
  };

  return (
    <div
      className='field-type toggle-switch-field'
      style={{
        marginBottom: '20px',
        padding: '14px 18px',
        borderRadius: '10px',
        background: 'var(--theme-elevation-50, rgba(255, 255, 255, 0.03))',
        border:
          '1px solid var(--theme-elevation-150, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--theme-elevation-900, #ffffff)',
              letterSpacing: '-0.01em',
            }}
          >
            {field.label ?? 'Enabled'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: isChecked
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(156, 163, 175, 0.12)',
              color: isChecked
                ? '#10b981'
                : 'var(--theme-elevation-400, #9ca3af)',
              border: `1px solid ${
                isChecked
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(156, 163, 175, 0.2)'
              }`,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isChecked ? '#10b981' : '#9ca3af',
              }}
            />
            {isChecked ? 'Active' : 'Disabled'}
          </span>
        </div>
        {field.admin?.description && (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--theme-elevation-400, #888888)',
              lineHeight: 1.4,
            }}
          >
            {field.admin.description}
          </span>
        )}
      </div>

      <button
        type='button'
        role='switch'
        aria-checked={isChecked}
        onClick={handleToggle}
        style={{
          position: 'relative',
          width: '46px',
          height: '26px',
          borderRadius: '9999px',
          background: isChecked
            ? '#10b981'
            : 'var(--theme-elevation-300, #4a4a4a)',
          border: 'none',
          padding: '3px',
          cursor: 'pointer',
          transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: 'block',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            transform: isChecked ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </button>
    </div>
  );
};

export default ToggleSwitchField;
