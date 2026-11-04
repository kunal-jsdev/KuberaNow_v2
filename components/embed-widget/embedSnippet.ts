const BLOCKED_TAGS = new Set([
  'style',
  'link',
  'meta',
  'base',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'svg',
  'math',
  'template',
  'noscript',
  'title',
  'head',
  'html',
  'body',
  'frame',
  'frameset',
]);

const URL_ATTRIBUTES = new Set([
  'href',
  'src',
  'poster',
  'cite',
  'action',
  'formaction',
]);

const BLOCKED_ATTRIBUTES = new Set(['srcdoc', 'formaction', 'action']);
const SNIPPET_START = /^<\s*[a-z][a-z0-9-]*[\s/>]/i;

export function looksLikeEmbedSnippet(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.endsWith('>') && SNIPPET_START.test(trimmed);
}

function resolveUrl(value: string): URL | null {
  try {
    return new URL(
      value.trim().startsWith('//') ? `https:${value.trim()}` : value,
      window.location.href
    );
  } catch {
    return null;
  }
}

function isSafeUrl(value: string): boolean {
  const url = resolveUrl(value);
  return (
    url !== null &&
    ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)
  );
}

type Counts = { elements: number };

function copyAllowed(source: Node, target: Node, counts: Counts) {
  if (source.nodeType === Node.TEXT_NODE) {
    target.appendChild(document.createTextNode(source.textContent ?? ''));
    return;
  }
  if (source.nodeType !== Node.ELEMENT_NODE) return;

  const element = source as Element;
  const tag = element.tagName.toLowerCase();
  if (BLOCKED_TAGS.has(tag)) return;

  let scriptSrc: string | null = null;
  if (tag === 'script') {
    const src = element.getAttribute('src');
    const url = src ? resolveUrl(src) : null;
    if (!url || url.protocol !== 'https:') return;
    scriptSrc = url.href;
  }

  const copy = document.createElement(tag);
  for (const { name, value } of Array.from(element.attributes)) {
    const attribute = name.toLowerCase();
    if (attribute.startsWith('on') || BLOCKED_ATTRIBUTES.has(attribute)) {
      continue;
    }
    if (URL_ATTRIBUTES.has(attribute) && !isSafeUrl(value)) continue;
    if (tag === 'script' && attribute === 'src') continue;
    copy.setAttribute(attribute, value);
  }

  if (scriptSrc) copy.setAttribute('src', scriptSrc);
  if (tag === 'a') {
    copy.setAttribute('target', '_blank');
    copy.setAttribute('rel', 'noopener noreferrer');
  }
  if (tag === 'iframe') {
    const src = element.getAttribute('src');
    const url = src ? resolveUrl(src) : null;
    if (!url || !['https:'].includes(url.protocol)) return;
    copy.setAttribute('src', url.href);
    copy.setAttribute('loading', 'lazy');
    copy.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  }

  counts.elements += 1;
  element.childNodes.forEach((child) => copyAllowed(child, copy, counts));
  target.appendChild(copy);
}

export function buildEmbedFragment(html: string): DocumentFragment | null {
  const template = document.createElement('template');
  template.innerHTML = html;
  const fragment = document.createDocumentFragment();
  const counts: Counts = { elements: 0 };

  template.content.childNodes.forEach((node) =>
    copyAllowed(node, fragment, counts)
  );
  fragment.querySelectorAll('script').forEach((inert) => {
    const live = document.createElement('script');
    for (const { name, value } of Array.from(inert.attributes)) {
      live.setAttribute(name, value);
    }
    live.text = inert.textContent ?? '';
    inert.replaceWith(live);
  });

  return counts.elements > 0 ? fragment : null;
}
