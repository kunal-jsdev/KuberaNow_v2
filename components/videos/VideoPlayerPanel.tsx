import { CustomVideoPlayer } from '@/components/common/VideoPlayer';
import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';
import { buildVideoSegment } from '@/Payload/lib/utilities/videoId';
import type { Tag, Video } from '@/payload-types';

import VideoCategoryChip from './VideoCategoryChip';
import VideoDescription from './VideoDescription';

type VideoPlayerPanelProps = {
  video: Video;
  /** Absolute page URL, used by the player's share menu. */
  url: string;
};

/**
 * Figma "Full Video" (Web): white card, 1px #DADCFF inside stroke, 6px radius,
 * 20px padding. 910×512 player (8px radius), 16px gap, then chip, title and
 * description 8px apart.
 */
export default function VideoPlayerPanel({
  video,
  url,
}: VideoPlayerPanelProps) {
  const poster = getMediaUrl(video.videoThumbnail) || video.thumbnailUrl;
  const category = typeof video.category === 'object' ? video.category : null;
  const categoryTitle = category?.title;
  const tags = (video.tags ?? [])
    .filter((tag): tag is Tag => typeof tag === 'object')
    .map(({ id, title, slug }) => ({ id, title, slug }));

  return (
    <article className='bg-surface ring-career-stroke flex w-full max-w-237.5 min-w-0 flex-col gap-4 rounded-md p-3 shadow-[0px_1px_1px_0px_rgba(74,32,38,0.06),0px_1px_0.5px_0px_rgba(74,32,38,0.04)] ring-1 ring-inset md:p-5'>
      <div className='border-career-stroke aspect-910/512 w-full overflow-hidden rounded-lg border bg-black'>
        <CustomVideoPlayer
          // YouTube sources are "upcoming" in the CMS; the HLS player can't
          // play a YouTube link, so only uploaded (Cloudflare) videos get one.
          src={video.videoSource === 'upload' ? video.hlsUrl : null}
          poster={poster}
          ratio='16:9'
          title={video.title}
          description={video.description}
          url={url}
          slug={buildVideoSegment(video.slug, video.video_id)}
          autoPlay
          style={{ aspectRatio: 'auto', borderRadius: 0, boxShadow: 'none' }}
        />
      </div>

      <div className='flex w-full flex-col items-start gap-2'>
        {categoryTitle && (
          <VideoCategoryChip
            title={categoryTitle}
            slug={category?.slug}
          />
        )}
        <h1 className='text-career-dark w-full text-xl leading-7 font-bold wrap-anywhere md:text-[26px] md:leading-8'>
          {video.title}
        </h1>
        <VideoDescription
          text={video.description}
          tags={tags}
        />
      </div>
    </article>
  );
}
