'use client';

import { useContext } from 'react';

import { VideoPlayerContextType } from './types';
import { VideoPlayerContext } from './VideoPlayerContext';

export function useVideoPlayer(): VideoPlayerContextType {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error(
      'useVideoPlayer must be used within a VideoPlayerProvider or VideoRoot component.'
    );
  }
  return context;
}

export default useVideoPlayer;
