import { FC } from 'react';

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical';

import { cn } from '@/Payload/lib/utilities/ui';

import RichText from '../RichText';

export type ContentBlockProps = {
  blockType: 'content';
  id?: string | null;
  blockName?: string | null;
  heading?: string | null;
  alignment?: ('left' | 'center') | null;
  richText?: DefaultTypedEditorState | null;
};

const hasRichText = (
  value: ContentBlockProps['richText']
): value is DefaultTypedEditorState => Boolean(value?.root?.children?.length);

export const ContentBlock: FC<ContentBlockProps> = ({
  heading,
  alignment = 'left',
  richText,
}) => {
  const title = heading?.trim();
  const showRichText = hasRichText(richText);

  if (!title && !showRichText) {
    return null;
  }

  return (
    <section
      className={cn('w-full py-8', {
        'text-center': alignment === 'center',
      })}
    >
      {title && (
        <h2 className='mb-4 text-2xl font-semibold md:text-3xl'>{title}</h2>
      )}
      {showRichText && (
        <RichText
          data={richText}
          enableGutter={false}
        />
      )}
    </section>
  );
};
