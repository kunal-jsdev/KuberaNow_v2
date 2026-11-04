import type { GlobalAfterReadHook, GlobalBeforeChangeHook } from 'payload';

type SizableDoc = {
  width?: number | null;
  height?: number | null;
  mobileWidth?: number | null;
  mobileHeight?: number | null;
  desktopWidth?: number | null;
  desktopHeight?: number | null;
  displayOn?: string | null;
  desktopEnabled?: boolean | null;
  mobileEnabled?: boolean | null;
  lottieJson?: unknown;
  desktopLottieJson?: unknown;
  mobileLottieJson?: unknown;
  link?: string | null;
  desktopLink?: string | null;
  mobileLink?: string | null;
  position?: string | null;
  desktopPosition?: string | null;
  mobilePosition?: string | null;
  horizontalSpacing?: number | null;
  desktopHorizontalSpacing?: number | null;
  mobileHorizontalSpacing?: number | null;
  verticalSpacing?: number | null;
  desktopVerticalSpacing?: number | null;
  mobileVerticalSpacing?: number | null;
  [key: string]: unknown;
};

const DEFAULT_LINK =
  'https://www.whatsapp.com/channel/0029VbDPNhHISTkJEDTirJ16';
const DEFAULT_POSITION = 'bottom-right';

export const migrateLegacySize: GlobalAfterReadHook = async ({ doc, req }) => {
  const current = doc as SizableDoc;
  if (!current) return doc;

  const displayOn = current.displayOn;
  const isDesktopDisplay =
    displayOn === 'desktop' || displayOn === 'both' || !displayOn;
  const isMobileDisplay =
    displayOn === 'mobile' || displayOn === 'both' || !displayOn;

  const desktopEnabled =
    typeof current.desktopEnabled === 'boolean'
      ? current.desktopEnabled
      : isDesktopDisplay;

  const mobileEnabled =
    typeof current.mobileEnabled === 'boolean'
      ? current.mobileEnabled
      : isMobileDisplay;

  const desktopLottieJson =
    current.desktopLottieJson !== undefined
      ? current.desktopLottieJson
      : (current.lottieJson ?? null);
  const mobileLottieJson =
    current.mobileLottieJson !== undefined ? current.mobileLottieJson : null;

  const desktopLink = current.desktopLink ?? current.link ?? DEFAULT_LINK;
  const mobileLink =
    current.mobileLink ?? current.desktopLink ?? current.link ?? DEFAULT_LINK;

  const desktopPosition =
    current.desktopPosition ?? current.position ?? DEFAULT_POSITION;
  const mobilePosition =
    current.mobilePosition ?? current.position ?? DEFAULT_POSITION;

  const getSpacing = (
    primary: unknown,
    fallback: unknown,
    defaultValue: number
  ): number => {
    if (typeof primary === 'number') return primary;
    if (typeof fallback === 'number') return fallback;
    return defaultValue;
  };

  const getPositiveDimension = (
    primary: unknown,
    fallback: unknown,
    defaultValue: number
  ): number => {
    if (typeof primary === 'number' && primary > 0) return primary;
    if (typeof fallback === 'number' && fallback > 0) return fallback;
    return defaultValue;
  };

  const desktopHorizontalSpacing = getSpacing(
    current.desktopHorizontalSpacing,
    current.horizontalSpacing,
    24
  );

  const mobileHorizontalSpacing = getSpacing(
    current.mobileHorizontalSpacing,
    current.horizontalSpacing,
    16
  );

  const desktopVerticalSpacing = getSpacing(
    current.desktopVerticalSpacing,
    current.verticalSpacing,
    24
  );

  const mobileVerticalSpacing = getSpacing(
    current.mobileVerticalSpacing,
    current.verticalSpacing,
    16
  );

  const desktopWidth = getPositiveDimension(
    current.desktopWidth,
    current.width,
    300
  );

  const desktopHeight = getPositiveDimension(
    current.desktopHeight,
    current.height,
    400
  );

  const mobileWidth =
    typeof current.mobileWidth === 'number' && current.mobileWidth > 0
      ? current.mobileWidth
      : 180;
  const mobileHeight =
    typeof current.mobileHeight === 'number' && current.mobileHeight > 0
      ? current.mobileHeight
      : 240;

  return {
    ...current,
    desktopEnabled,
    mobileEnabled,
    desktopLottieJson,
    mobileLottieJson,
    desktopLink,
    mobileLink,
    desktopPosition,
    mobilePosition,
    desktopHorizontalSpacing,
    mobileHorizontalSpacing,
    desktopVerticalSpacing,
    mobileVerticalSpacing,
    desktopWidth,
    desktopHeight,
    mobileWidth,
    mobileHeight,
  };
};

export const syncLegacyFloatingCtaFields: GlobalBeforeChangeHook = async ({
  data,
  req,
}) => {
  const current = data as SizableDoc;
  if (!current) return data;

  const desktopEnabled = current.desktopEnabled !== false;
  const mobileEnabled = current.mobileEnabled !== false;

  let displayOn: 'both' | 'desktop' | 'mobile' | 'none' = 'both';
  if (desktopEnabled && mobileEnabled) {
    displayOn = 'both';
  } else if (desktopEnabled && !mobileEnabled) {
    displayOn = 'desktop';
  } else if (!desktopEnabled && mobileEnabled) {
    displayOn = 'mobile';
  } else {
    displayOn = 'none';
  }

  const desktopLottieJson =
    current.desktopLottieJson !== undefined
      ? current.desktopLottieJson
      : (current.lottieJson ?? null);

  const desktopLink = current.desktopLink || current.link || DEFAULT_LINK;
  const mobileLink =
    current.mobileLink || current.desktopLink || current.link || DEFAULT_LINK;

  const desktopPosition =
    current.desktopPosition || current.position || DEFAULT_POSITION;
  const mobilePosition =
    current.mobilePosition || current.position || DEFAULT_POSITION;

  const desktopHorizontalSpacing =
    typeof current.desktopHorizontalSpacing === 'number'
      ? current.desktopHorizontalSpacing
      : 24;
  const mobileHorizontalSpacing =
    typeof current.mobileHorizontalSpacing === 'number'
      ? current.mobileHorizontalSpacing
      : 16;

  const desktopVerticalSpacing =
    typeof current.desktopVerticalSpacing === 'number'
      ? current.desktopVerticalSpacing
      : 24;
  const mobileVerticalSpacing =
    typeof current.mobileVerticalSpacing === 'number'
      ? current.mobileVerticalSpacing
      : 16;

  const desktopWidth =
    typeof current.desktopWidth === 'number' && current.desktopWidth > 0
      ? current.desktopWidth
      : 300;
  const desktopHeight =
    typeof current.desktopHeight === 'number' && current.desktopHeight > 0
      ? current.desktopHeight
      : 400;

  const mobileWidth =
    typeof current.mobileWidth === 'number' && current.mobileWidth > 0
      ? current.mobileWidth
      : 180;
  const mobileHeight =
    typeof current.mobileHeight === 'number' && current.mobileHeight > 0
      ? current.mobileHeight
      : 240;

  return {
    ...current,
    displayOn,
    desktopEnabled,
    mobileEnabled,
    desktopLottieJson: desktopLottieJson || null,
    mobileLottieJson: current.mobileLottieJson || null,
    desktopLink,
    mobileLink,
    desktopPosition,
    mobilePosition,
    desktopHorizontalSpacing,
    mobileHorizontalSpacing,
    desktopVerticalSpacing,
    mobileVerticalSpacing,
    desktopWidth,
    desktopHeight,
    mobileWidth,
    mobileHeight,
    lottieJson: desktopLottieJson || current.mobileLottieJson || null,
    link: desktopLink,
    position: desktopPosition,
    horizontalSpacing: desktopHorizontalSpacing,
    verticalSpacing: desktopVerticalSpacing,
  };
};
