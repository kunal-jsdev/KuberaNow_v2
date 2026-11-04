'use client';

import { type FC, useEffect, useRef, useState } from 'react';

import { useVideoPlayer } from './useVideoPlayer';

type ActiveAnim = {
  direction: 'forward' | 'backward';
  amount: number;
  id: number;
};

const Chevron: FC<{ direction: 'left' | 'right'; size?: number }> = ({
  direction,
  size = 18,
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='#ffffff'
    strokeWidth='3'
    strokeLinecap='round'
    strokeLinejoin='round'
    style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.8))' }}
  >
    {direction === 'right' ? (
      <polyline points='9 18 15 12 9 6' />
    ) : (
      <polyline points='15 18 9 12 15 6' />
    )}
  </svg>
);

const SeekLabel: FC<{ direction: 'forward' | 'backward'; amount: number }> = ({
  direction,
  amount,
}) => {
  const isForward = direction === 'forward';

  return (
    <div
      className='yt-seek-label'
      style={{
        right: isForward ? '44px' : undefined,
        left: isForward ? undefined : '44px',
        top: '50%',
        transform: 'translateY(-50%) scale(1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#ffffff',
        }}
      >
        {!isForward && (
          <Chevron
            direction='left'
            size={24}
          />
        )}

        <span
          style={{
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '0.3px',
            textShadow:
              '0 1px 6px rgba(0,0,0,0.85), 0 2px 12px rgba(0,0,0,0.6)',
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            lineHeight: 1,
          }}
        >
          {isForward ? `+ ${amount}` : `- ${amount}`}
        </span>

        {isForward && (
          <Chevron
            direction='right'
            size={24}
          />
        )}
      </div>
    </div>
  );
};

const SpeedToast: FC<{ speed: number }> = ({ speed }) => (
  <div className='speed-toast'>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '999px',
        padding: '5px 14px 5px 10px',
        color: '#ffffff',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '18px',
        marginTop: '15px',
        fontWeight: 600,
        letterSpacing: '0.2px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: '15px' }} />
      <span>{speed === 1 ? 'Normal speed' : `${speed}× speed`}</span>
    </div>
  </div>
);

export const SeekFeedbackOverlay: FC = () => {
  const { seekAnimation, speedChangeAnimation } = useVideoPlayer();
  const [forwardAnim, setForwardAnim] = useState<ActiveAnim | null>(null);
  const [backwardAnim, setBackwardAnim] = useState<ActiveAnim | null>(null);
  const [speedToast, setSpeedToast] = useState<{
    speed: number;
    id: number;
  } | null>(null);
  const forwardTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backwardTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speedTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!seekAnimation) return;

    if (seekAnimation.direction === 'forward') {
      if (forwardTimerRef.current) clearTimeout(forwardTimerRef.current);
      const timer = setTimeout(() => {
        setForwardAnim({ ...seekAnimation, id: seekAnimation.key });
        forwardTimerRef.current = setTimeout(() => setForwardAnim(null), 750);
      }, 0);
      return () => clearTimeout(timer);
    }
    if (backwardTimerRef.current) clearTimeout(backwardTimerRef.current);
    const timer = setTimeout(() => {
      setBackwardAnim({ ...seekAnimation, id: seekAnimation.key });
      backwardTimerRef.current = setTimeout(() => setBackwardAnim(null), 750);
    }, 0);
    return () => clearTimeout(timer);
  }, [seekAnimation]);

  useEffect(() => {
    if (!speedChangeAnimation) return;
    if (speedTimerRef.current) clearTimeout(speedTimerRef.current);
    const timer = setTimeout(() => {
      setSpeedToast({
        speed: speedChangeAnimation.speed,
        id: speedChangeAnimation.key,
      });
      speedTimerRef.current = setTimeout(() => setSpeedToast(null), 2000);
    }, 0);
    return () => clearTimeout(timer);
  }, [speedChangeAnimation]);

  return (
    <>
      {backwardAnim && (
        <SeekLabel
          key={`bwd-${backwardAnim.id}`}
          direction='backward'
          amount={backwardAnim.amount}
        />
      )}
      {forwardAnim && (
        <SeekLabel
          key={`fwd-${forwardAnim.id}`}
          direction='forward'
          amount={forwardAnim.amount}
        />
      )}
      {speedToast && (
        <SpeedToast
          key={`spd-${speedToast.id}`}
          speed={speedToast.speed}
        />
      )}

      <style
        jsx
        global
      >{`
        @keyframes ytSeekFade {
          0% {
            opacity: 0;
            transform: scale(0.82);
          }
          15% {
            opacity: 1;
            transform: scale(1.04);
          }
          70% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }
        .yt-seek-label {
          animation: ytSeekFade 0.75s cubic-bezier(0.25, 1, 0.5, 1) both;
          pointer-events: none;
          position: absolute;
          top: 50%;
          transform-origin: center;
        }
        @keyframes speedToastAnim {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-6px) scale(0.88);
          }
          6% {
            opacity: 1;
            transform: translateX(-50%) translateY(0px) scale(1.03);
          }
          10% {
            opacity: 1;
            transform: translateX(-50%) translateY(0px) scale(1);
          }
          88% {
            opacity: 1;
            transform: translateX(-50%) translateY(0px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px) scale(1);
          }
        }
        .speed-toast {
          animation: speedToastAnim 2s ease both;
          pointer-events: none;
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
        }
      `}</style>
    </>
  );
};

export default SeekFeedbackOverlay;
