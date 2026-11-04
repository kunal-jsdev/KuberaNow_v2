'use client';

import { FieldLabel, useField } from '@payloadcms/ui';
import type { TextFieldClientComponent } from 'payload';

export const LinkField: TextFieldClientComponent = (props) => {
  const { path, field } = props;
  const { value = '', setValue } = useField<string>({ path });

  return (
    <div className='field-type text'>
      <FieldLabel
        label={field.label ?? 'Link'}
        path={path}
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--theme-elevation-400, #9a9a9a)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <svg
            width='15'
            height='15'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
            <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
          </svg>
        </span>
        <input
          type='text'
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
          placeholder='https://whatsapp.com/channel/0029Va4K0PZ5a245NkmqBA2M'
          style={{
            paddingLeft: '36px',
            width: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default LinkField;
