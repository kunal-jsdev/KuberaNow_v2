'use client';

import { useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createClientFeature } from '@payloadcms/richtext-lexical/client';
import { $hasUpdateTag, ParagraphNode, PASTE_TAG } from 'lexical';

const DefaultJustifyPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerNodeTransform(ParagraphNode, (node) => {
        const isPaste = $hasUpdateTag(PASTE_TAG);
        const format = node.getFormatType();

        if (format === 'justify') {
          return;
        }

        if (isPaste || format === '') {
          node.setFormat('justify');
        }
      }),
    [editor]
  );

  return null;
};

export const DefaultJustifyFeatureClient = createClientFeature({
  plugins: [
    {
      Component: DefaultJustifyPlugin,
      position: 'normal',
    },
  ],
});
