import { ContentBlock } from '@/Payload/types/disclaimerType';

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className='space-y-2 md:space-y-3'>
      {blocks.map((block) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p
                key={block.id}
                className='text-content-small md:text-content-big text-text-disclaimer leading-4 md:leading-5'
              >
                {block.text}
              </p>
            );
          case 'bullets':
            return (
              <ul
                key={block.id}
                className='list-disc pl-5 md:pl-6'
              >
                {block.items.map((item) => (
                  <li
                    key={item.id}
                    className='text-content-small md:text-content-big text-text-disclaimer'
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            );
          default:
            return (
              <div className='text-content-small md:text-content-big rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-yellow-700'>
                No content available.
              </div>
            );
        }
      })}
    </div>
  );
}
