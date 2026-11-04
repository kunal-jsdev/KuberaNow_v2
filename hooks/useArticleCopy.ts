'use client';

import { useEffect } from 'react';

/**
 * Attaches a `copy` event listener to `containerRef`. Whenever the user
 * copies anything from inside that container, the clipboard is replaced with
 * only the article title and URL — the selected text is intentionally dropped.
 *
 *   <articleTitle>
 *   <articleUrl>
 *
 * Copying from outside the container (navigation, header, inputs, etc.)
 * is left completely untouched.
 */
export function useArticleCopy(
  containerRef: React.RefObject<HTMLElement | null>,
  articleUrl: string
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleCopy = (event: ClipboardEvent) => {
      // Guard: ignore if the event target is an input or textarea
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const selection = window.getSelection();

      // Guard: nothing selected
      if (!selection || selection.isCollapsed) return;

      // Guard: selection must originate inside the article container
      if (!container.contains(selection.anchorNode)) return;

      // Guard: empty selection text
      if (!selection.toString().trim()) return;

      event.preventDefault();

      // Put only a "Read the full article" label + URL — no selected text
      const clipboardText = `Read the full article:\n${articleUrl}`;
      event.clipboardData?.setData('text/plain', clipboardText);
    };

    container.addEventListener('copy', handleCopy);
    return () => {
      container.removeEventListener('copy', handleCopy);
    };
  }, [containerRef, articleUrl]);
}
