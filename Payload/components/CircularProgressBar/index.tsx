'use client';

import type { FC } from 'react';

type CircularProgressBarProps = {
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
};

export const CircularProgressBar: FC<CircularProgressBarProps> = ({
  size = 18,
  strokeWidth = 2.5,
  color = '#10b981',
  trackColor = 'var(--theme-elevation-200, rgba(255, 255, 255, 0.15))',
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
      }}
    >
      <style>{`
        @keyframes circular-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        style={{
          animation: 'circular-spin 0.75s linear infinite',
        }}
      >
        <circle
          cx='12'
          cy='12'
          r='9'
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx='12'
          cy='12'
          r='9'
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray='56'
          strokeDashoffset='42'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

export default CircularProgressBar;
