'use client';

import { type FC, useEffect } from 'react';

import { useField } from '@payloadcms/ui';

export const LiveBlogTabIndicator: FC = () => {
  const { value: isLiveBlog } = useField<boolean>({ path: 'isLiveBlog' });

  const isLiveActive = Boolean(isLiveBlog);

  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('kuberanow:live-blogs-updated'));
    } catch {}
  }, [isLiveActive]);

  useEffect(() => {
    let observer: MutationObserver | null = null;

    const observe = () => {
      const tabsWrap = document.querySelector('.tabs-field__tabs-wrap');
      if (tabsWrap && observer) {
        observer.observe(tabsWrap, {
          childList: true,
          subtree: false,
        });
      }
    };

    const updateIndicator = () => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        '.tabs-field__tab-button'
      );
      let liveBlogTabBtn: HTMLButtonElement | null = null;

      for (const btn of buttons) {
        if (btn.textContent?.includes('Live Blog')) {
          liveBlogTabBtn = btn;
          break;
        }
      }

      if (!liveBlogTabBtn) return;

      const existingCircle = liveBlogTabBtn.querySelector(
        '.live-blog-tab-green-circle'
      );

      if (isLiveActive) {
        if (!existingCircle) {
          const circle = document.createElement('span');
          circle.className = 'live-blog-tab-green-circle';
          circle.setAttribute('aria-hidden', 'true');
          circle.title = 'Live Blog is active';

          // Disconnect to avoid triggering the observer on our own DOM addition
          if (observer) observer.disconnect();
          liveBlogTabBtn.appendChild(circle);
          observe();
        }
      } else {
        if (existingCircle) {
          if (observer) observer.disconnect();
          existingCircle.remove();
          observe();
        }
      }
    };

    observer = new MutationObserver(() => {
      updateIndicator();
    });

    updateIndicator();
    observe();

    return () => {
      if (observer) {
        observer.disconnect();
      }
      document
        .querySelectorAll('.live-blog-tab-green-circle')
        .forEach((el) => el.remove());
    };
  }, [isLiveActive]);

  return (
    <style>{`
      .live-blog-tab-green-circle {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #c8332f;
        align-self: flex-start;
        margin-top: calc(0.55em - 2px);
        margin-left: 3px;
        flex-shrink: 0;
        pointer-events: none;
        user-select: none;
        transform-origin: center;
        animation: live-blog-heartbeat 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      }

      @keyframes live-blog-heartbeat {
        0% {
          transform: scale(1);
        }
        14% {
          transform: scale(1.35);
        }
        28% {
          transform: scale(1);
        }
        42% {
          transform: scale(1.45);
        }
        70% {
          transform: scale(1);
        }
        100% {
          transform: scale(1);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .live-blog-tab-green-circle {
          animation: none;
        }
      }
    `}</style>
  );
};

export default LiveBlogTabIndicator;
