'use client';

import {
  DefaultNodeTypes,
  type DefaultTypedEditorState,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical';
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react';

import EmbedHtml from '@/components/embed-widget/EmbedHtml';
import { looksLikeEmbedSnippet } from '@/components/embed-widget/embedSnippet';
import { isFacebookShareUrl } from '@/components/social-embed/resolveShareUrl';
import SocialEmbed from '@/components/social-embed/SocialEmbed';
import { parseSocialUrl } from '@/components/social-embed/socialParser';
import { cn } from '@/Payload/lib/utilities/ui';

type NodeTypes = DefaultNodeTypes;

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields?.doc;
  if (!doc || !doc.value || typeof doc.value !== 'object') {
    return '#';
  }
  const slug = (doc.value as { slug?: string }).slug || '';
  return doc.relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`;
};

function extractTextFromNode(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as {
    text?: string;
    children?: unknown[];
    fields?: { url?: string; code?: string; html?: string };
  };
  if (typeof n.fields?.url === 'string' && n.fields.url.trim()) {
    return n.fields.url.trim();
  }
  if (typeof n.text === 'string' && n.text.trim()) {
    return n.text.trim();
  }
  if (Array.isArray(n.children)) {
    return n.children.map(extractTextFromNode).filter(Boolean).join(' ');
  }
  return '';
}

const linkConverterObj = LinkJSXConverter({ internalDocToHref });

const liveJsxConverters: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  ...linkConverterObj,
  text: (args) => {
    const text = args.node.text;
    const plain =
      typeof defaultConverters.text === 'function'
        ? defaultConverters.text(args)
        : text;
    if (looksLikeEmbedSnippet(text)) {
      return (
        <EmbedHtml
          as='span'
          html={text.trim()}
          fallback={plain}
          className='my-3'
        />
      );
    }
    return plain;
  },
  link: (args) => {
    const url = args.node.fields?.url || extractTextFromNode(args.node);
    if (url && (isFacebookShareUrl(url) || parseSocialUrl(url))) {
      return <SocialEmbed url={url} />;
    }
    if (typeof linkConverterObj.link === 'function') {
      return linkConverterObj.link(args);
    }
    if (typeof defaultConverters.link === 'function') {
      return defaultConverters.link(args);
    }
    return null;
  },
  autolink: (args) => {
    const url = args.node.fields?.url || extractTextFromNode(args.node);
    if (url && (isFacebookShareUrl(url) || parseSocialUrl(url))) {
      return <SocialEmbed url={url} />;
    }
    if (typeof linkConverterObj.autolink === 'function') {
      return linkConverterObj.autolink(args);
    }
    if (typeof defaultConverters.autolink === 'function') {
      return defaultConverters.autolink(args);
    }
    return null;
  },
  paragraph: (args) => {
    const textContent = extractTextFromNode(args.node).trim();
    if (
      textContent &&
      (isFacebookShareUrl(textContent) || parseSocialUrl(textContent))
    ) {
      return <SocialEmbed url={textContent} />;
    }
    const paragraph =
      typeof defaultConverters.paragraph === 'function' ? (
        defaultConverters.paragraph(args)
      ) : (
        <p>{args.nodesToJSX({ nodes: args.node.children })}</p>
      );
    if (textContent && looksLikeEmbedSnippet(textContent)) {
      return (
        <EmbedHtml
          html={textContent}
          fallback={paragraph}
          className='my-3'
        />
      );
    }
    return paragraph;
  },
  quote: (args) => {
    const textContent = extractTextFromNode(args.node).trim();
    if (
      textContent &&
      (isFacebookShareUrl(textContent) || parseSocialUrl(textContent))
    ) {
      return <SocialEmbed url={textContent} />;
    }
    if (typeof defaultConverters.quote === 'function') {
      return defaultConverters.quote(args);
    }
    return (
      <blockquote>{args.nodesToJSX({ nodes: args.node.children })}</blockquote>
    );
  },
  code: (args) => {
    if (typeof defaultConverters.code === 'function') {
      return defaultConverters.code(args);
    }
    return (
      <pre>
        <code>{args.nodesToJSX({ nodes: args.node.children })}</code>
      </pre>
    );
  },
});

type LiveRichTextProps = {
  data: DefaultTypedEditorState;
  enableGutter?: boolean;
  enableProse?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function LiveRichText({
  data,
  className,
  enableProse = false,
  enableGutter = false,
  ...rest
}: LiveRichTextProps) {
  if (
    !data ||
    !data.root ||
    !Array.isArray(data.root.children) ||
    data.root.children.length === 0
  ) {
    return null;
  }

  return (
    <ConvertRichText
      data={data}
      converters={liveJsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className
      )}
      {...rest}
    />
  );
}
