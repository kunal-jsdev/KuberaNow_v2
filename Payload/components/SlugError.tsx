'use client';

export const SlugError: React.FC<any> = ({ showError, message }) => {
  if (!showError || !message) return null;

  return (
    <div
      style={{
        marginTop: '0.25rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'rgba(245, 158, 11, 0.1)', // Light orange background
        borderLeft: '4px solid #f59e0b', // Orange left border
        color: '#b45309', // Darker orange text
        borderRadius: '4px',
        fontSize: '14px',
        lineHeight: '1.5',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-start',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        zIndex: 10,
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'></path>
          <line
            x1='12'
            y1='9'
            x2='12'
            y2='13'
          ></line>
          <line
            x1='12'
            y1='17'
            x2='12.01'
            y2='17'
          ></line>
        </svg>
      </div>
      <div>
        <strong>Warning: </strong>
        {message}
      </div>
    </div>
  );
};
