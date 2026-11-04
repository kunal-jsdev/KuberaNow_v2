import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';

import remarkGfm from 'remark-gfm';

type MarkdownVariant = 'default' | 'privacy' | 'terms';

const SECTION_HEADING_PATTERN = /^(\d+(?:\.\d+)*)\s+(.+)$/;

function extractText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return extractText(child.props.children);
      }

      return '';
    })
    .join('');
}
const sharedComponents: Pick<Components, 'a' | 'strong'> = {
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className='text-career-dark font-bold'>{children}</strong>
  ),
};

function SectionHeading({
  as: Tag,
  children,
}: {
  as: 'h2' | 'h3';
  children: ReactNode;
}) {
  const text = extractText(children).trim();
  const match = SECTION_HEADING_PATTERN.exec(text);
  const className =
    Tag === 'h2'
      ? 'mb-3 lg:mb-4 mt-4 lg:mt-8 flex gap-4 text-[16px] lg:text-subheading-big font-bold leading-[26px] text-career-dark first:mt-0'
      : 'mb-3 lg:mb-4 mt-2 lg:mt-6 flex gap-4 text-[14px] lg:text-[18px] font-bold leading-[22px] text-career-dark';

  if (match) {
    return (
      <Tag className={className}>
        <span className='shrink-0'>{match[1]}</span>
        <span>{match[2]}</span>
      </Tag>
    );
  }

  return <Tag className={className}>{children}</Tag>;
}
export const termsComponents: Components = {
  ...sharedComponents,
  h2: ({ children }) => <SectionHeading as='h2'>{children}</SectionHeading>,
  p: ({ children }) => (
    <p className='text-content-small text-career-dark mb-2! leading-4 font-normal last:mb-0! md:leading-5 lg:mb-4! lg:text-[16px] [&:has(+h2)]:mb-0!'>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className='text-content-small text-career-dark mb-3 list-disc space-y-2 pl-6 leading-4 md:space-y-3 md:text-[16px] md:leading-5'>
      {children}
    </ul>
  ),
  li: ({ children }) => <li>{children}</li>,
};
const linkAndStrong: Pick<Components, 'a' | 'strong'> = {
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className='text-career-dark font-bold'>{children}</strong>
  ),
};

const defaultComponents: Components = {
  ...linkAndStrong,
  h2: ({ children }) => (
    <h2 className='text-career-dark text-subheading-big mt-4 mb-4 leading-4.5 font-bold first:mt-0'>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className='text-career-dark mt-4 mb-2 text-lg leading-4.5 font-bold'>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className='text-career-dark mb-4 text-lg leading-5.5 last:mb-0'>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className='text-career-dark mb-4 list-disc space-y-4 pl-5 text-lg leading-5.5'>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className='text-career-dark mb-4 list-decimal space-y-3 pl-5 text-sm leading-5.5'>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className='pl-0.5'>{children}</li>,
  em: ({ children }) => (
    <em className='text-career-muted mb-3 block text-xs leading-4 not-italic'>
      {children}
    </em>
  ),
};

const privacyWrapperClassName =
  'flex flex-col [&_h2+h3]:mt-0 [&_h3+ul]:space-y-0 [&_h4+p:has(+p)]:mb-1.5 [&_h4+p:not(:has(+p))]:mb-4 [&_p:has(+h2)]:mb-0 [&_ul:has(+h2)]:mb-0 [&_ul:has(+h3)]:mb-0';

const privacyComponents: Components = {
  ...linkAndStrong,
  h2: ({ children }) => <SectionHeading as='h2'>{children}</SectionHeading>,
  h3: ({ children }) => <SectionHeading as='h3'>{children}</SectionHeading>,
  h4: ({ children }) => (
    <h4 className='text-career-dark mb-2 text-sm leading-5.5 font-bold lg:text-lg'>
      {children}
    </h4>
  ),
  p: ({ children }) => {
    const text = extractText(children).trim();

    if (text.startsWith('Managed by:')) {
      return (
        <p className='text-career-muted is-managed-by mb-2 text-[10px] leading-4 font-normal lg:mb-4 lg:text-xs'>
          {children}
        </p>
      );
    }

    return (
      <p className='text-content-small text-career-dark mb-2! leading-4 font-normal last:mb-0! md:leading-5 lg:mb-4! lg:text-[16px] [&:has(+.is-managed-by)]:mb-1.5! [&:has(+h2)]:mb-0!'>
        {children}
      </p>
    );
  },
  ul: ({ children }) => (
    <ul className='text-career-dark text-content-small mb-0 list-disc space-y-2 pl-6.75 leading-normal font-normal lg:space-y-4 lg:text-lg lg:leading-5.5'>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className='text-career-dark mb-0 list-decimal space-y-4 pl-6.75 text-lg leading-5.5 font-normal'>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className='text-xs leading-4 font-normal md:text-[16px] md:leading-5'>
      {children}
    </li>
  ),
};

type MarkdownContentProps = {
  content: string;
  className?: string;
  variant?: MarkdownVariant;
};

export default function MarkdownContent({
  content,
  className = '',
  variant = 'default',
}: MarkdownContentProps) {
  const wrapperClassName =
    variant === 'privacy'
      ? `${privacyWrapperClassName} ${className}`
      : `flex flex-col ${className}`;
  let components: Components;

  if (variant === 'terms') {
    components = termsComponents;
  } else if (variant === 'privacy') {
    components = privacyComponents;
  } else {
    components = defaultComponents;
  }

  return (
    <div className={wrapperClassName}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
