import ReactMarkdown from 'react-markdown';

import { ABOUT_INTRO, ABOUT_STORY } from '../../constants/about';
import { STATIC_PAGE_SEO } from '../../constants/pageSeo';
import PageSectionHeader from '../common/PageSectionHeader';
import ContactCardShell from '../contact-us/ContactCardShell';

import AboutCoverSection from './AboutCoverSection';
import AboutValuesSection from './AboutValuesSection';
import AboutVisionSection from './AboutVisionSection';

function AboutTextSection({
  title,
  paragraphs,
  as = 'h3',
}: {
  title: string;
  paragraphs: readonly string[];
  as?: 'h1' | 'h3';
}) {
  return (
    <ContactCardShell
      padding='mobile'
      className='lg:rounded-lg lg:p-5'
    >
      <div className='flex w-full flex-col gap-4 lg:gap-6'>
        <PageSectionHeader
          title={title}
          as={as}
          titleClassName='text-lg leading-[22px] text-career-dark lg:text-2xl lg:leading-7'
        />

        <div className='flex flex-col gap-2 lg:gap-4'>
          {paragraphs.map((paragraph) => (
            <ReactMarkdown
              key={paragraph}
              components={{
                p: ({ children }) => (
                  <p className='text-career-dark text-xs leading-4.5 lg:text-base lg:leading-5'>
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
      </div>
    </ContactCardShell>
  );
}

export default function AboutUsSection() {
  return (
    <section className='box-border flex w-full max-w-237.5 min-w-0 flex-col gap-4 lg:gap-5'>
      <AboutTextSection
        title={STATIC_PAGE_SEO.about.h1}
        as='h1'
        paragraphs={ABOUT_INTRO.paragraphs}
      />

      <AboutTextSection
        title={ABOUT_STORY.title}
        paragraphs={ABOUT_STORY.paragraphs}
      />

      <AboutCoverSection />
      <AboutVisionSection />
      <AboutValuesSection />
    </section>
  );
}
