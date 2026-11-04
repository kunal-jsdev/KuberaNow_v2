'use client';

import { FieldLabel, useField } from '@payloadcms/ui';
import type { RadioFieldClientComponent } from 'payload';

import './index.scss';

export const VideoSourceField: RadioFieldClientComponent = ({
  field,
  path: pathFromProps,
  readOnly,
}) => {
  const path = pathFromProps ?? field.name;
  const { value, setValue, showError, errorMessage } = useField<string>({
    path,
  });

  return (
    <div className='field-type radio video-source-field'>
      <FieldLabel
        label={field.label || 'Video Source'}
        path={path}
      />
      <div className='video-source-options'>
        <button
          type='button'
          onClick={() => {}}
          disabled
          className={`video-source-option ${value === 'youtube' ? 'active' : ''} disabled`}
          style={{ opacity: 0.5, cursor: 'not-allowed' }}
        >
          <div className='option-content'>
            <div
              className='option-icon'
              style={{ color: '#ff0000' }}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path d='M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15V9 l5.2,3L10,15z' />
              </svg>
            </div>
            <div className='option-text'>
              <div className='option-label'>YouTube URL (upcoming)</div>
              <div className='option-description'>Add video from YouTube</div>
            </div>
          </div>
          <div
            className={`option-radio ${value === 'youtube' ? 'active' : ''}`}
          />
        </button>

        <button
          type='button'
          onClick={() => !readOnly && setValue('upload')}
          className={`video-source-option ${value === 'upload' ? 'active' : ''} ${readOnly ? 'disabled' : ''}`}
        >
          <div className='option-content'>
            <div
              className='option-icon'
              style={{ color: '#fff' }}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path d='M9 16h6v-6h4l-7-7-7 7h4v6zm3-10.17L14.17 8H13v6h-2V8H9.83L12 5.83zM5 18h14v2H5z' />
              </svg>
            </div>
            <div className='option-text'>
              <div className='option-label'>Upload Video</div>
              <div className='option-description'>Upload from your device</div>
            </div>
          </div>
          <div
            className={`option-radio ${value === 'upload' ? 'active' : ''}`}
          />
        </button>
      </div>
      {showError && errorMessage && (
        <div className='field-error'>{errorMessage}</div>
      )}
    </div>
  );
};

export default VideoSourceField;
