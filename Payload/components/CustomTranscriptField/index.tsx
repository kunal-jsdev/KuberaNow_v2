'use client';

import { useRef, useState } from 'react';

import { FieldLabel, useField } from '@payloadcms/ui';
import type { TextareaFieldClientComponent } from 'payload';

export const CustomTranscriptField: TextareaFieldClientComponent = ({
  field,
  path: pathFromProps,
  readOnly,
}) => {
  const path = pathFromProps ?? field.name;
  const { value, setValue, showError, errorMessage } = useField<string>({
    path,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

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
    gap: '6px',
    transition: 'all 0.15s ease',
  };

  const handleImportClick = () => {
    // Disabled: import feature coming in next release
    if (readOnly) return;
    // if (fileInputRef.current) {
    //   fileInputRef.current.click();
    // }
  };

  const processFile = async (file: File) => {
    try {
      const text = await file.text();
      setValue(text);
      setImportStatus(`Imported ${file.name}`);
      setTimeout(() => setImportStatus(null), 4000);
    } catch {
      setImportStatus('Failed to read file');
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    e.target.value = '';
  };

  const handleClear = () => {
    if (readOnly) return;
    setValue('');
    setImportStatus('Cleared');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const hasValue = Boolean(value && value.trim().length > 0);

  return (
    <div
      className='field-type textarea custom-transcript-field'
      style={{ marginBottom: '2rem' }}
    >
      <FieldLabel
        label={field.label || 'Transcript'}
        path={path}
      />

      <input
        ref={fileInputRef}
        type='file'
        accept='.txt,.vtt,.srt,.sub,.sbv,text/*'
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <textarea
        value={value || ''}
        readOnly
        rows={hasValue ? 8 : 1}
        onKeyDown={(e) => {
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
          }
        }}
        placeholder='Importing transcript will be available in the upcoming release...'
        style={{
          width: '100%',
          height: hasValue ? '180px' : '40px',
          minHeight: hasValue ? '120px' : '40px',
          background: 'var(--theme-elevation-100)',
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: '4px',
          padding: hasValue ? '12px' : '9px 12px',
          color: 'var(--theme-elevation-800)',
          fontFamily: 'inherit',
          fontSize: '13px',
          lineHeight: '1.4',
          resize: 'none',
          marginBottom: '12px',
          cursor: 'default',
          overflowY: hasValue ? 'auto' : 'hidden',
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        <button
          type='button'
          style={{
            ...buttonStyle,
            opacity: 0.5,
            cursor: 'not-allowed',
          }}
          disabled
          title='Generate Transcript is disabled for now'
        >
          Generate Transcript
        </button>
        <button
          type='button'
          onClick={handleImportClick}
          style={{
            ...buttonStyle,
            opacity: 0.5,
            cursor: 'not-allowed',
          }}
          disabled
          title='Import File is disabled for now (coming in next release)'
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
            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
            <polyline points='17 8 12 3 7 8' />
            <line
              x1='12'
              y1='3'
              x2='12'
              y2='15'
            />
          </svg>
          Import File
        </button>

        {value && (
          <button
            type='button'
            onClick={handleClear}
            style={{
              ...buttonStyle,
              opacity: readOnly ? 0.5 : 1,
              cursor: readOnly ? 'not-allowed' : 'pointer',
            }}
            disabled={readOnly}
          >
            Clear
          </button>
        )}

        {importStatus && (
          <span
            style={{
              fontSize: '0.8rem',
              color: importStatus.startsWith('Failed') ? '#ef4444' : '#10b981',
              fontWeight: 500,
            }}
          >
            {importStatus}
          </span>
        )}
      </div>

      {field.admin?.description && (
        <div
          className='field-description'
          style={{ fontSize: '0.85rem', color: 'var(--theme-elevation-400)' }}
        >
          {typeof field.admin.description === 'string'
            ? field.admin.description
            : 'Import from file only (.vtt, .srt, .txt). Non-editable to preserve subtitle timestamp integrity.'}
        </div>
      )}

      {showError && errorMessage && (
        <div className='field-error'>{errorMessage}</div>
      )}
    </div>
  );
};

export default CustomTranscriptField;
