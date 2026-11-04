import { getFloatingCta } from '@/Payload/lib/utilities/getFloatingCta';
import type { LottieFile } from '@/payload-types';

import FloatingCtaWidget, {
  type FloatingCtaWidgetProps,
} from './FloatingCtaWidget';

function getLottieUrl(field: unknown): string | null {
  if (!field) return null;
  if (typeof field === 'object' && field !== null) {
    const doc = field as LottieFile;
    return doc.cloudinaryUrl || doc.url || null;
  }
  return null;
}

export default async function FloatingCtaLoader() {
  const data = await getFloatingCta();

  if (!data) return null;

  const desktopLottieUrl = getLottieUrl(data.desktopLottieJson);
  const mobileLottieUrl = getLottieUrl(data.mobileLottieJson);

  const props: FloatingCtaWidgetProps = {
    desktop: {
      enabled: data.desktopEnabled ?? false,
      lottieUrl: desktopLottieUrl,
      link: data.desktopLink ?? null,
      position: data.desktopPosition ?? 'bottom-right',
      horizontalSpacing: data.desktopHorizontalSpacing ?? 24,
      verticalSpacing: data.desktopVerticalSpacing ?? 24,
      width: data.desktopWidth ?? 300,
      height: data.desktopHeight ?? 400,
    },
    mobile: {
      enabled: data.mobileEnabled ?? false,
      lottieUrl: mobileLottieUrl,
      link: data.mobileLink ?? data.desktopLink ?? null,
      position: data.mobilePosition ?? 'bottom-right',
      horizontalSpacing: data.mobileHorizontalSpacing ?? 16,
      verticalSpacing: data.mobileVerticalSpacing ?? 16,
      width: data.mobileWidth ?? 180,
      height: data.mobileHeight ?? 240,
    },
  };

  return <FloatingCtaWidget {...props} />;
}
