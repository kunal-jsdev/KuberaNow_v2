'use client';

import { useEffect, useState } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createClientFeature } from '@payloadcms/richtext-lexical/client';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/\S+/g);
  return matches ? matches.length : 0;
}

const WordCountPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [stats, setStats] = useState({
    words: 0,
    selectedWords: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const text = root.getTextContent();
        const totalWords = countWords(text);

        let selWords = 0;
        try {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && !selection.isCollapsed()) {
            const selText = selection.getTextContent();
            if (selText.trim().length > 0) {
              selWords = countWords(selText);
            }
          }
        } catch {
          selWords = 0;
        }

        setStats({
          words: totalWords,
          selectedWords: selWords,
        });
      });
    };

    updateStats();

    // Listen to document content updates
    const unregisterUpdateListener = editor.registerUpdateListener(() => {
      updateStats();
    });

    // Listen to cursor / selection highlight changes
    const unregisterSelectionCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateStats();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      unregisterUpdateListener();
      unregisterSelectionCommand();
    };
  }, [editor]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '8px',
        padding: '6px 12px',
        fontSize: '12px',
        lineHeight: '1.4',
        color: 'var(--theme-elevation-500, #777)',
        backgroundColor: 'var(--theme-elevation-50, #fafafa)',
        borderTop:
          '1px solid var(--theme-elevation-150, rgba(128, 128, 128, 0.15))',
        userSelect: 'none',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {stats.selectedWords > 0 ? (
        <span>
          <strong>{stats.selectedWords.toLocaleString()}</strong> of{' '}
          <strong>{stats.words.toLocaleString()}</strong> words selected
        </span>
      ) : (
        <span>
          <strong>{stats.words.toLocaleString()}</strong>{' '}
          {stats.words === 1 ? 'word' : 'words'}
        </span>
      )}
    </div>
  );
};

export const WordCountFeatureClient = createClientFeature({
  plugins: [
    {
      Component: WordCountPlugin,
      position: 'bottom',
    },
  ],
});
