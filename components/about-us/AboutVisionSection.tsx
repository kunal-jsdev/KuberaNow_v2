import ReactMarkdown from 'react-markdown';

import { ABOUT_VISION } from '../../constants/about';

export default function AboutVisionSection() {
  return (
    <section className='border-career-stroke bg-about-gradient overflow-hidden rounded-lg border-[1.25px] p-3 lg:rounded-lg lg:p-8'>
      <div className='flex flex-col gap-4 lg:gap-4'>
        <div className='border-career-stroke border-b pb-2'>
          <div className='relative flex h-8.25 shrink-0 items-center'>
            <span
              className='bg-primary absolute left-0 h-5.5 w-1 rounded-xs shadow-[2px_0px_0px_0px_var(--color-career-accent)]'
              aria-hidden
            />
            <h2 className='pl-3 text-lg leading-5.5 font-bold text-white lg:text-2xl lg:leading-7'>
              {ABOUT_VISION.title}
            </h2>
          </div>
        </div>

        <div className='flex flex-col gap-3 lg:gap-4'>
          {ABOUT_VISION.paragraphs.map((paragraph) => (
            <ReactMarkdown
              key={paragraph}
              components={{
                p: ({ children }) => (
                  <p className='text-xs leading-4.5 text-white lg:text-base lg:leading-5'>
                    {children}
                  </p>
                ),
                em: ({ children }) => (
                  <strong className='font-bold'>{children}</strong>
                ),
                strong: ({ children }) => (
                  <strong className='font-bold'>{children}</strong>
                ),
              }}
            >
              {paragraph}
            </ReactMarkdown>
          ))}
        </div>

        <div className='w-full max-w-[582px] rounded-[10px] border border-white/15 bg-white/[0.07] px-4 py-4 lg:px-6'>
          <p className='text-xs leading-5 font-bold text-nowrap text-white lg:text-center lg:text-base'>
            <span className='block lg:inline'>
              {'"'}
              {ABOUT_VISION.tagline.primary}
            </span>
            <span className='text-career-accent block lg:inline'>
              {' '}
              {ABOUT_VISION.tagline.accent}
              <span className='text-white'>{'"'}</span>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
