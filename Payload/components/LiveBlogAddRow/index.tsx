'use client';

import { type FC, type MouseEvent, useCallback } from 'react';

import { Button, useField, useForm } from '@payloadcms/ui';

type LiveBlogAddRowProps = {
  path?: string;
  schemaPath?: string;
  readOnly?: boolean;
};

export const LiveBlogAddRow: FC<LiveBlogAddRowProps> = ({
  path = 'liveUpdates',
  schemaPath = 'liveUpdates',
  readOnly = false,
}) => {
  const { addFieldRow } = useForm();
  const { disabled } = useField<number>({ path });

  const handleAddLiveBlog = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (readOnly || disabled) return;

      addFieldRow({
        path,
        rowIndex: 0,
        schemaPath,
      });

      setTimeout(() => {
        const container =
          document.getElementById(`field-${path.replace(/\./g, '__')}`) ||
          document.getElementById(`field-${path}`);
        if (container) {
          const headlineInput = container.querySelector<HTMLInputElement>(
            'input[name*="headline"], input[id*="headline"]'
          );
          if (headlineInput) {
            headlineInput.focus({ preventScroll: true });
          }
        }
      }, 50);
    },
    [addFieldRow, path, schemaPath, readOnly, disabled]
  );

  if (readOnly) return null;

  return (
    <div
      className='live-blog-add-row-container'
      style={{
        display: 'flex',
        alignItems: 'center',
        margin: '-6px 0 -8px 0',
        padding: 0,
      }}
    >
      <Button
        buttonStyle='icon-label'
        className='live-blog-top-add-row-btn'
        disabled={disabled}
        icon='plus'
        iconPosition='left'
        iconStyle='with-border'
        onClick={handleAddLiveBlog}
      >
        Add Live Blog
      </Button>
      <style>{`
        .live-blog-add-row-container .live-blog-top-add-row-btn.btn {
          margin: 0 !important;
          padding-top: 20px !important;
          padding-bottom: 15px !important;
        }
      `}</style>
    </div>
  );
};

export default LiveBlogAddRow;
