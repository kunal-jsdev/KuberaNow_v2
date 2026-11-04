'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/** Previews kept loaded (paused) after use, so hovering back is instant. */
const WARM_PREVIEWS = 4;

type VideoPreviewContextValue = {
  /** The one card currently playing its preview (null: none). */
  activeId: string | null;
  /** Cards whose preview player stays mounted: the active one + recent ones. */
  warmIds: string[];
  setActiveId: (id: string) => void;
  /**
   * Mouse left this card: stop it (if it's still the one playing) and fall
   * back to the default preview, if there is one.
   */
  clearActiveId: (id: string) => void;
};

const VideoPreviewContext = createContext<VideoPreviewContextValue | null>(
  null
);

/**
 * Card previews for a listing: a hovered card plays while the mouse is on
 * it. Whenever nothing is hovered, the default card (the first video on
 * /videos) previews instead — on load, and again after each hover ends. Cards outside a provider (e.g.
 * "You May Like This") never play.
 */
export function VideoPreviewProvider({
  initialActiveId,
  children,
}: {
  initialActiveId: string | null;
  children: ReactNode;
}) {
  const [activeId, setActive] = useState(initialActiveId);
  const [warmIds, setWarmIds] = useState<string[]>(
    initialActiveId ? [initialActiveId] : []
  );

  // Keep the default card's player loaded alongside recent ones, so falling
  // back to it resumes instantly instead of reloading.
  const keepWarm = useCallback(
    (id: string) =>
      setWarmIds((prev) => {
        const rest = prev.filter(
          (warm) => warm !== id && warm !== initialActiveId
        );
        const pinned =
          initialActiveId && id !== initialActiveId ? [initialActiveId] : [];
        return [id, ...pinned, ...rest].slice(0, WARM_PREVIEWS);
      }),
    [initialActiveId]
  );

  // Called on hover: that card becomes the one playing.
  const setActiveId = useCallback(
    (id: string) => {
      setActive(id);
      keepWarm(id);
    },
    [keepWarm]
  );

  const clearActiveId = useCallback(
    (id: string) => {
      setActive((current) => (current === id ? initialActiveId : current));
    },
    [initialActiveId]
  );

  // Fetch the HLS library up front, so the first hover doesn't wait for it.
  useEffect(() => {
    import('hls.js').catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ activeId, warmIds, setActiveId, clearActiveId }),
    [activeId, warmIds, setActiveId, clearActiveId]
  );

  return (
    <VideoPreviewContext.Provider value={value}>
      {children}
    </VideoPreviewContext.Provider>
  );
}

export function useVideoPreview() {
  return useContext(VideoPreviewContext);
}
