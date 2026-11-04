import { useId } from 'react';

import { GUJARAT_PATH } from './GujaratPath';

export const GANDHINAGAR = { x: 500, y: 348 };

type GujaratIconProps = {
  className?: string;
  showGandhinagar?: boolean;
  labelOpacity?: number;
};

function GujaratIcon({ className, showGandhinagar = false }: GujaratIconProps) {
  const gradientId = `gujaratLightBlue-${useId().replace(/:/g, '')}`;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='144 144 512 512'
      className={className}
      aria-hidden={!showGandhinagar}
      aria-label={showGandhinagar ? 'Gujarat map with Gandhinagar' : undefined}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop
            offset='0%'
            stopColor='#bfdbfe'
          />
          <stop
            offset='50%'
            stopColor='#93c5fd'
          />
          <stop
            offset='100%'
            stopColor='#60a5fa'
          />
        </linearGradient>
      </defs>
      <path
        d={GUJARAT_PATH}
        fill={`url(#${gradientId})`}
        stroke='#93c5fd'
        strokeWidth='2'
        strokeLinejoin='round'
      />
      {showGandhinagar && (
        <>
          <g data-hero-gandhinagar>
            <line
              x1={GANDHINAGAR.x}
              y1={GANDHINAGAR.y}
              x2={GANDHINAGAR.x}
              y2={GANDHINAGAR.y - 22}
              stroke='#1e3a8a'
              strokeWidth='1.5'
              opacity='0.8'
            />
            <circle
              cx={GANDHINAGAR.x}
              cy={GANDHINAGAR.y}
              r='5'
              fill='#1e3a8a'
            />
            <circle
              cx={GANDHINAGAR.x}
              cy={GANDHINAGAR.y}
              r='2.2'
              fill='#ffffff'
            />
          </g>
          <text
            data-hero-gandhinagar-label
            x={GANDHINAGAR.x}
            y={GANDHINAGAR.y - 30}
            textAnchor='middle'
            fill='#1e3a8a'
            fontSize='16'
            fontWeight='600'
            letterSpacing='0.04em'
          >
            Gandhinagar
          </text>
        </>
      )}
    </svg>
  );
}

export default GujaratIcon;
