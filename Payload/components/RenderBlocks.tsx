import type { FC } from 'react';

import type { Page } from '@/payload-types';

import { BannerBlock } from './Banner/Component';
import { ContentBlock } from './Content/Component';

type LayoutBlock = NonNullable<Page['layout']>[number];
type BlockSlug = LayoutBlock['blockType'];

const blockComponents: Record<BlockSlug, FC<LayoutBlock>> = {
  banner: BannerBlock as FC<LayoutBlock>,
  content: ContentBlock as FC<LayoutBlock>,
};

export const RenderBlocks = ({ blocks }: { blocks?: Page['layout'] }) => {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block, index) => {
        const Block = blockComponents[block.blockType];

        if (!Block) return null;

        return (
          <Block
            key={block.id ?? index}
            {...block}
          />
        );
      })}
    </>
  );
};

export default RenderBlocks;
