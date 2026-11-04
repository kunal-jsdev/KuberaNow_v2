'use client';

import { type FC, useEffect, useMemo } from 'react';

import { VideoSurfaceProps } from './types';
import { useVideoPlayer } from './useVideoPlayer';

export const VideoSurface: FC<VideoSurfaceProps> = ({
  src,
  streamUid,
  streamDomain,
  cfStatus,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  className = '',
  style = {},
}) => {
  const { videoRef, togglePlay, toggleMute } = useVideoPlayer();

  const domain =
    streamDomain ||
    process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN ||
    process.env.CLOUDFLARE_STREAM_DOMAIN ||
    'videodelivery.net';

  const isFailed = cfStatus === 'failed';

  const resolvedHlsUrl = useMemo(() => {
    if (isFailed) return null;
    if (cfStatus && cfStatus !== 'ready') return null;
    if (
      src &&
      (src.includes('.m3u8') || src.includes('/manifest/video.m3u8'))
    ) {
      return src;
    }
    if (streamUid) {
      return `https://${domain}/${streamUid}/manifest/video.m3u8`;
    }
    return null;
  }, [src, streamUid, domain, isFailed, cfStatus]);

  const resolvedDirectUrl = useMemo(() => {
    if (resolvedHlsUrl) return null;
    return src || null;
  }, [resolvedHlsUrl, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: any = null;

    if (resolvedHlsUrl) {
      import('hls.js')
        .then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 60,
              maxBufferHole: 0.5,
              manifestLoadingMaxRetry: 6,
              manifestLoadingRetryDelay: 1000,
              manifestLoadingMaxRetryTimeout: 15000,
            });
            hlsInstance.loadSource(resolvedHlsUrl);
            hlsInstance.attachMedia(video);
            (video as any).__hlsInstance = hlsInstance;

            hlsInstance.on(Hls.Events.ERROR, (_event: any, data: any) => {
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hlsInstance.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hlsInstance.recoverMediaError();
                    break;
                  default:
                    hlsInstance.destroy();
                    break;
                }
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = resolvedHlsUrl;
          }
        })
        .catch(() => {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = resolvedHlsUrl;
          }
        });
    } else if (resolvedDirectUrl) {
      video.src = resolvedDirectUrl;
      video.load();
    } else {
      video.removeAttribute('src');
      video.load();
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        if (video) {
          delete (video as any).__hlsInstance;
        }
      }
    };
  }, [resolvedHlsUrl, resolvedDirectUrl, videoRef]);

  // Autoplay is started here rather than with the `autoplay` attribute so a
  // blocked attempt can recover: browsers refuse sound until the visitor has
  // interacted with the site, so retry muted (the volume control unmutes).
  useEffect(() => {
    const video = videoRef.current;
    if (!autoPlay || !video) return;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      video.play().catch((err: unknown) => {
        if ((err as { name?: string })?.name !== 'NotAllowedError') return;
        if (!video.muted) toggleMute();
        video.play().catch(() => {});
      });
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      start();
    } else {
      video.addEventListener('canplay', start, { once: true });
    }
    return () => video.removeEventListener('canplay', start);
  }, [autoPlay, videoRef, toggleMute, resolvedHlsUrl, resolvedDirectUrl]);

  return (
    <video
      ref={videoRef}
      poster={poster || undefined}
      loop={loop}
      muted={muted}
      playsInline
      onClick={togglePlay}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`h-full w-full cursor-pointer bg-black object-contain ${className}`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        backgroundColor: '#000',
        ...style,
      }}
    />
  );
};

export default VideoSurface;
