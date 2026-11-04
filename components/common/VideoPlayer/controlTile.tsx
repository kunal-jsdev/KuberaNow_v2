import Image from 'next/image';

import { type ControlIconPair, ICON_DIR } from './controlTileStyles';

type ControlIconProps = {
  icon: ControlIconPair;
  isPhone: boolean;
  /** Figma mirrors the fullscreen arrows (rotate 180° + flip Y). */
  flip?: boolean;
};

export function ControlIcon({ icon, isPhone, flip = false }: ControlIconProps) {
  const spec = isPhone ? icon.mobile : icon.web;
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${spec.slot}px`,
        height: `${spec.slot}px`,
        flexShrink: 0,
        pointerEvents: 'none',
      }}
    >
      <Image
        src={spec.src}
        alt=''
        width={spec.width}
        height={spec.height}
        unoptimized
        draggable={false}
        style={{
          display: 'block',
          width: `${spec.width}px`,
          height: `${spec.height}px`,
          maxWidth: 'none',
          transform: flip ? 'scaleX(-1)' : undefined,
        }}
      />
    </span>
  );
}

/** The thin gradient rule between a control's icon and its open options. */
export function ControlDivider({
  isPhone,
  isVertical = false,
}: {
  isPhone: boolean;
  isVertical?: boolean;
}) {
  const length = isPhone ? 24 : 30;
  return (
    <span
      aria-hidden
      style={{
        position: 'relative',
        width: isVertical ? `${length}px` : 0,
        height: isVertical ? 0 : `${length}px`,
        flexShrink: 0,
        pointerEvents: 'none',
      }}
    >
      <Image
        src={`${ICON_DIR}/divider-${isPhone ? 'mobile' : 'web'}.svg`}
        alt=''
        width={length}
        height={1}
        unoptimized
        draggable={false}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${length}px`,
          height: '1px',
          maxWidth: 'none',
          transform: `translate(-50%, -50%)${isVertical ? '' : ' rotate(90deg)'}`,
        }}
      />
    </span>
  );
}
