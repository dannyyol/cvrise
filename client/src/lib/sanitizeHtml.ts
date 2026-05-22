import DOMPurify from 'dompurify';

const RICH_TEXT_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
  'div',
  'a',
];

const RICH_TEXT_ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

const DOCUMENT_ALLOWED_TAGS = [
  ...RICH_TEXT_ALLOWED_TAGS,
  'header',
  'section',
  'footer',
  'main',
  'article',
  'aside',
  'hr',
  'small',
  'sup',
  'sub',
  'style',
  'table',
  'thead',
  'tbody',
  'tr',
  'td',
  'th',
  // SVG elements for template icons (lucide-react)
  'svg',
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'ellipse',
  'g',
  'use',
  'defs',
];

const DOCUMENT_ALLOWED_ATTR = [
  'href', 'target', 'rel', 'class', 'style', 'id',
  // SVG presentation attributes
  'viewBox', 'xmlns', 'width', 'height',
  'fill', 'fill-rule', 'fill-opacity',
  'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity',
  'd', 'points', 'transform', 'clip-path', 'clip-rule', 'opacity',
  'cx', 'cy', 'r', 'rx', 'ry',
  'x', 'y', 'x1', 'y1', 'x2', 'y2',
];

let hooksInstalled = false;
const ensureHooksInstalled = () => {
  if (hooksInstalled) return;
  hooksInstalled = true;

  DOMPurify.addHook('afterSanitizeAttributes', (node: Element) => {
    if (!(node instanceof HTMLAnchorElement)) return;

    const target = node.getAttribute('target');
    if (target === '_blank') {
      const relTokens = (node.getAttribute('rel') ?? '')
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean);

      if (!relTokens.includes('noopener')) relTokens.push('noopener');
      if (!relTokens.includes('noreferrer')) relTokens.push('noreferrer');
      node.setAttribute('rel', relTokens.join(' '));
    }
  });
};

export const sanitizeRichTextHtml = (value: string | null | undefined): string => {
  const raw = value ?? '';
  if (!raw) return '';

  if (typeof window === 'undefined') {
    return raw;
  }

  ensureHooksInstalled();

  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
    ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
};

export const sanitizeDocumentHtml = (value: string | null | undefined): string => {
  const raw = value ?? '';
  if (!raw) return '';

  if (typeof window === 'undefined') {
    return raw;
  }

  ensureHooksInstalled();

  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: DOCUMENT_ALLOWED_TAGS,
    ALLOWED_ATTR: DOCUMENT_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'math', 'form', 'input', 'textarea', 'button'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
};

export const safeExternalHref = (value: string | null | undefined): string | undefined => {
  const raw = (value ?? '').trim();
  if (!raw) return undefined;

  if (raw.startsWith('//')) return raw;

  const match = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!match) return raw;

  const scheme = match[1].toLowerCase();
  if (scheme === 'http' || scheme === 'https' || scheme === 'mailto') return raw;
  return undefined;
};
