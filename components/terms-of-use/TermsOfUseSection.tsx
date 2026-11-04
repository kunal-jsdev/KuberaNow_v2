import { STATIC_PAGE_SEO } from '../../constants/pageSeo';
import ContentPanel from '../common/ContentPanel';
import MarkdownContent from '../common/MarkdownContent';
import PageSectionHeader from '../common/PageSectionHeader';
type TermsOfUseSectionProps = {
  content: string;
};

export default function TermsOfUseSection({ content }: TermsOfUseSectionProps) {
  return (
    <>
      <ContentPanel>
        <section className='flex w-full flex-col gap-6'>
          <PageSectionHeader
            title={STATIC_PAGE_SEO.terms.h1}
            as='h1'
            titleClassName='text-career-dark'
          />
          <MarkdownContent
            content={content}
            variant='terms'
          />
        </section>
      </ContentPanel>
    </>
  );
}
