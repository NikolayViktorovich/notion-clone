const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'];
const ALLOWED_ATTRS = ['class', 'id', 'style'];

export function sanitizeContent(content: string): string {
  if (!content || typeof content !== 'string') return '';
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  const sanitize = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) return node.cloneNode(true);
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    
    const el = node as Element;
    const tagName = el.tagName.toLowerCase();
    
    if (!ALLOWED_TAGS.includes(tagName)) return document.createTextNode(el.textContent || '');
    
    const newEl = document.createElement(tagName);
    Array.from(el.attributes).forEach(attr => {
      if (ALLOWED_ATTRS.includes(attr.name.toLowerCase()) && !attr.value.match(/javascript:|data:|vbscript:/i)) {
        newEl.setAttribute(attr.name, attr.value);
      }
    });
    
    Array.from(el.childNodes).forEach(child => {
      const sanitized = sanitize(child);
      if (sanitized) newEl.appendChild(sanitized);
    });
    
    return newEl;
  };
  
  const sanitized = sanitize(doc.body);
  return sanitized ? sanitized.textContent || '' : '';
}

export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
