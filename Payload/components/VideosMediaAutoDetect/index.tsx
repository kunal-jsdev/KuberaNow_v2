'use client';

import { type FC, useEffect, useRef } from 'react';

import { useField, useFormFields, useFormProcessing } from '@payloadcms/ui';
import { toast } from 'sonner';

function cleanVideoTitle(filename: string): string {
  if (!filename) return '';
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  const cleaned = withoutExt
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : '';
}

export const VideosMediaAutoDetect: FC = () => {
  const fileField = useFormFields(([fields]) => fields?.file?.value);
  const isProcessing = useFormProcessing();

  const { value: title, setValue: setTitle } = useField<string>({
    path: 'title',
  });
  const lastFileRef = useRef<File | null>(null);
  const wasUploadingRef = useRef(false);
  const originalBtnHtmlRef = useRef<string | null>(null);
  const activeBtnRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const file = fileField as File | undefined;
    if (!file || !(file instanceof File) || file === lastFileRef.current) {
      return;
    }
    lastFileRef.current = file;

    if (!title && file.name) {
      const derived = cleanVideoTitle(file.name);
      if (derived) {
        setTitle(derived);
      }
    }
  }, [fileField, title, setTitle]);

  useEffect(() => {
    if (isProcessing && fileField instanceof File) {
      wasUploadingRef.current = true;

      const btn = (document.getElementById('action-save') ||
        document.querySelector('button[id*="save"]') ||
        document.querySelector('.form-submit button') ||
        document.querySelector('button[type="submit"]')) as HTMLElement | null;

      if (btn) {
        activeBtnRef.current = btn;
        if (originalBtnHtmlRef.current === null) {
          originalBtnHtmlRef.current = btn.innerHTML;
        }

        btn.classList.add('cf-save-uploading');
        btn.innerHTML = `
          <span style="display:inline-flex;align-items:center;gap:8px;">
            <svg class="cf-btn-spinner" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:cfBtnSpin 0.75s linear infinite;">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
            </svg>
            <span>Uploading...</span>
          </span>
        `;
      }
    } else if (!isProcessing) {
      if (wasUploadingRef.current) {
        wasUploadingRef.current = false;

        const btn = activeBtnRef.current;
        if (btn && originalBtnHtmlRef.current !== null) {
          btn.innerHTML = originalBtnHtmlRef.current;
          btn.classList.remove('cf-save-uploading');
          originalBtnHtmlRef.current = null;
          activeBtnRef.current = null;
        }

        toast.success('Video uploaded to Cloudflare Stream successfully!');
      }
    }
  }, [isProcessing, fileField]);

  return (
    <style>{`
      @keyframes cfBtnSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .cf-save-uploading {
        position: relative !important;
        overflow: hidden !important;
        pointer-events: none !important;
        opacity: 0.95 !important;
        background: #18181b !important;
        color: #ffffff !important;
      }
    `}</style>
  );
};

export default VideosMediaAutoDetect;
