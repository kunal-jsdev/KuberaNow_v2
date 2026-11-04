'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { useLiveBlogRealtime } from './LiveBlogRealtimeContext';

export default function LiveNewUpdatePill() {
  const { newUpdatesCount, scrollToLatest, clearNewUpdatesCount } =
    useLiveBlogRealtime();

  return (
    <AnimatePresence>
      {newUpdatesCount > 0 && (
        <motion.div
          key='live-new-update-pill'
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className='fixed right-4 bottom-5 z-50 flex max-w-sm items-center sm:right-6 sm:bottom-6 md:right-8 md:bottom-8'
        >
          <div className='flex items-center gap-2.5 rounded-full border border-blue-400/30 bg-[#0A194E]/95 py-2 pr-2.5 pl-3.5 text-white shadow-2xl shadow-blue-950/40 backdrop-blur-md transition-all hover:bg-[#0A194E] hover:shadow-blue-900/50 sm:py-2.5 sm:pr-3 sm:pl-4'>
            {/* Pulsing Lightning Icon */}
            <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-xs'>
              <svg
                className='h-3.5 w-3.5 fill-current'
                viewBox='0 0 20 20'
                aria-hidden='true'
              >
                <path d='M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z' />
              </svg>
            </div>

            {/* Click to View Action */}
            <button
              type='button'
              onClick={scrollToLatest}
              className='flex flex-col text-left'
            >
              <div className='flex items-center gap-1.5 text-xs font-bold tracking-wide text-white sm:text-sm'>
                <span>
                  {newUpdatesCount} New{' '}
                  {newUpdatesCount === 1 ? 'Update' : 'Updates'}
                </span>
                <span className='rounded bg-blue-500/30 px-1 py-0.5 text-[10px] font-semibold text-blue-200'>
                  View ⬆
                </span>
              </div>
              <span className='font-sans-guj text-[11px] leading-tight text-slate-300'>
                નવો લાઈવ અપડેટ જોવા ક્લિક કરો
              </span>
            </button>

            {/* Dismiss Cross */}
            <button
              type='button'
              onClick={clearNewUpdatesCount}
              aria-label='Dismiss notification'
              className='ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white'
            >
              <svg
                className='h-3.5 w-3.5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
