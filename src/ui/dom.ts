export function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function requireElement<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Required UI element is missing: ${selector}`);
  return node;
}

export function button(label: string, className: string, onClick: () => void): HTMLButtonElement {
  const node = element('button', className, label);
  node.type = 'button';
  node.addEventListener('click', onClick);
  return node;
}

export function externalLink(label: string, url: string): HTMLAnchorElement {
  const node = element('a', 'external-link', label);
  node.href = url;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  node.append(element('span', 'sr-only', '（新しいタブ）'));
  return node;
}
