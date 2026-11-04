import { Metadata } from 'next';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import ContentPanel from '../../../components/common/ContentPanel';
import MarkdownContent from '../../../components/common/MarkdownContent';
import PageSectionHeader from '../../../components/common/PageSectionHeader';
import { STATIC_PAGE_SEO } from '../../../constants/pageSeo';
import { buildStaticPageJsonLd } from '../../../lib/utils/jsonLd';

const PRIVACY_DESCRIPTION =
  'How KuberaNow collects, uses, shares, and retains your personal data including our cookies policy, your rights under the Digital Personal Data Protection Act, 2023, and how to reach our Grievance Officer.';

export const metadata: Metadata = {
  title: STATIC_PAGE_SEO.privacy.title,
  description: PRIVACY_DESCRIPTION,
};

async function getPrivacyPolicyContent() {
  const filePath = path.join(process.cwd(), 'content/privacy-policy.md');

  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read privacy policy content at ${filePath}`, {
      cause: error,
    });
  }
}

export default async function PrivacyPolicyPage() {
  const content = await getPrivacyPolicyContent();

  const privacyJsonLd = buildStaticPageJsonLd({
    path: '/privacy-policy',
    title: STATIC_PAGE_SEO.privacy.title,
    description: PRIVACY_DESCRIPTION,
  });

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }}
      />
      <ContentPanel className='p-5 shadow-[0px_1px_1px_rgba(74,32,38,0.06),0px_1px_0.5px_rgba(74,32,38,0.04)]'>
        <div className='flex flex-col gap-3 lg:gap-6'>
          <PageSectionHeader
            title={STATIC_PAGE_SEO.privacy.h1}
            as='h1'
          />
          <MarkdownContent
            content={content}
            variant='privacy'
          />
        </div>
      </ContentPanel>
    </>
  );
}
