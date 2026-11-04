import {
  isFacebookShareUrl,
  resolveShareUrl,
} from '@/components/social-embed/resolveShareUrl';
import SocialEmbed from '@/components/social-embed/SocialEmbed';
import { parseSocialUrl } from '@/components/social-embed/socialParser';

type Props = {
  url: string;
};

export default async function ResolvedSocialEmbed({ url }: Props) {
  let target = url;

  if (isFacebookShareUrl(url)) {
    const resolved = await resolveShareUrl(url);
    if (resolved) target = resolved;
  }

  return (
    <SocialEmbed
      info={parseSocialUrl(target)}
      url={target}
    />
  );
}
