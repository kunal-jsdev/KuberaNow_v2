'use client';

import { type FC } from 'react';

import { useVideoPlayer } from './useVideoPlayer';

export const BufferingIndicator: FC<{ className?: string }> = ({
  className = '',
}) => {
  const { isBuffering } = useVideoPlayer();

  if (!isBuffering) return null;

  return (
    <div
      aria-label='Loading video'
      className={`pointer-events-none absolute inset-0 z-15 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-opacity duration-200 ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 15,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        className='h-12 w-12 animate-spin rounded-full border-3 border-white/20 border-t-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          borderTopColor: '#ffffff',
          animation: 'spin 0.8s linear infinite',
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.35)',
        }}
      />
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default BufferingIndicator;
