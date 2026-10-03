/**
 * FREELANCE BD HUB — ARTICLE RENDERER
 *
 * Two rendering modes:
 *
 * 1. renderArticle()       — Sandboxed iframe (for interactive articles with JS)
 * 2. renderArticleDirect() — Direct DOM render with DOMPurify sanitization
 *                            (for text-only articles — SEO friendly)
 *
 * The caller (article.html) picks which to use based on whether the article
 * has custom JavaScript.
 */

/* ════════════════════════════════════════════════════════════════
   MODE 1 — Sandboxed iframe (interactive articles)
   ════════════════════════════════════════════════════════════════ */

export function renderArticle(containerEl, articleCode = {}, options = {}) {
  if (!containerEl) return null;
  
  containerEl.innerHTML = '';
  
  const iframe = document.createElement('iframe');
  iframe.className = 'article-sandbox-frame';
  iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-forms');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('title', 'Article Content');
  iframe.src = options.sandboxPath || '/article-renderer/sandbox.html';
  
  containerEl.appendChild(iframe);
  
  const getTheme = () => document.documentElement.getAttribute('data-theme') || 'light';
  
  const sendPayload = () => {
    if (!iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      {
        type: 'fbh:render',
        html: articleCode.html || '',
        css: articleCode.css || '',
        javascript: articleCode.javascript || '',
        theme: getTheme()
      },
      '*'
    );
  };
  
  iframe.onload = () => {
    sendPayload();
  };
  
  const messageHandler = (event) => {
    if (!event.data || event.data.type !== 'fbh:resize') return;
    if (iframe.contentWindow === event.source && event.data.height > 0) {
      iframe.style.height = `${event.data.height + 20}px`;
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  const themeObserver = new MutationObserver(() => {
    sendPayload();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  
  return {
    update(newCode) {
      articleCode = { ...articleCode, ...newCode };
      sendPayload();
    },
    destroy() {
      window.removeEventListener('message', messageHandler);
      themeObserver.disconnect();
      iframe.remove();
    }
  };
}

/* ════════════════════════════════════════════════════════════════
   MODE 2 — Direct DOM render (text-only articles — SEO friendly)
   ════════════════════════════════════════════════════════════════ */

/**
 * Fallback sanitizer — used only if DOMPurify isn't available.
 * DOMPurify is loaded via CDN in article.html. This is a minimal
 * last-resort filter that removes dangerous tags and attributes.
 */
function fallbackSanitize(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  const BLOCKED_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'link'];
  BLOCKED_TAGS.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  });
  
  const DANGEROUS_ATTR_PATTERNS = [
    /^on[a-z]+$/i,
    /^javascript:/i,
    /^data:.*script/i
  ];
  
  doc.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.toLowerCase();
      
      if (DANGEROUS_ATTR_PATTERNS.some((re) => re.test(name))) {
        el.removeAttribute(attr.name);
        return;
      }
      
      if ((name === 'href' || name === 'src' || name === 'action') &&
        (value.startsWith('javascript:') || value.startsWith('data:text/html'))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return doc.body.innerHTML;
}

/**
 * Scope author CSS to the .article-body wrapper.
 * Prevents author styles from leaking into site chrome.
 */
function scopeCss(css, scopeSelector) {
  if (!css) return '';
  
  return css.replace(/(^|\})\s*([^{}@][^{}]*?)\s*\{/g, (match, prefix, selectors) => {
    const scopedSelectors = selectors
      .split(',')
      .map((s) => {
        const trimmed = s.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('@')) return trimmed;
        if (trimmed.startsWith(scopeSelector)) return trimmed;
        return `${scopeSelector} ${trimmed}`;
      })
      .filter(Boolean)
      .join(', ');
    
    return `${prefix}\n${scopedSelectors} {`;
  });
}


/* ── Auto contrast fix (light/dark safe) ─────────────────────────────
 * Author HTML/CSS often hardcodes text colors or card backgrounds that
 * only look right in one theme. For every text element we compare the
 * text color with the real background behind it and, if contrast is
 * too low, switch the text to a readable light/dark color.
 */
function fbhParseColor(str) {
  const m = (str || '').match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 && !isNaN(p[3]) ? p[3] : 1 };
}
function fbhLum(c) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
function fbhContrast(a, b) {
  const l1 = fbhLum(a), l2 = fbhLum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function fbhBgBehind(el) {
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; // gradient/image: unknown
    const c = fbhParseColor(cs.backgroundColor);
    if (c && c.a > 0.6) return c;
  }
  return fbhParseColor(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
}
function fixArticleContrast(root) {
  if (!root) return;
  root.querySelectorAll('[data-fbh-cfix]').forEach((el) => {
    el.style.removeProperty('color');
    el.removeAttribute('data-fbh-cfix');
  });
  const LIGHT = { r: 241, g: 245, b: 249, a: 1 };
  const DARK = { r: 15, g: 23, b: 42, a: 1 };
  root.querySelectorAll('*').forEach((el) => {
    if (['STYLE', 'SCRIPT', 'IMG', 'VIDEO', 'AUDIO', 'IFRAME', 'SOURCE', 'PICTURE'].includes(el.tagName)) return;
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) return;
    const fg = fbhParseColor(getComputedStyle(el).color);
    const bg = fbhBgBehind(el);
    if (!fg || !bg) return;
    if (fbhContrast(fg, bg) >= 4) return;
    const pick = fbhContrast(LIGHT, bg) >= fbhContrast(DARK, bg) ? LIGHT : DARK;
    el.style.setProperty('color', `rgb(${pick.r}, ${pick.g}, ${pick.b})`, 'important');
    el.setAttribute('data-fbh-cfix', '1');
  });
}

/**
 * Direct render — sanitized HTML injected straight into the main DOM.
 * Returns { update(newCode), destroy() } for API parity with renderArticle().
 */
export function renderArticleDirect(containerEl, articleCode = {}) {
  if (!containerEl) return null;
  
  let currentCode = { ...articleCode };
  
  function doRender() {
    containerEl.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'article-body';
    
    const rawHtml = currentCode.html || '';
    let safeHtml;
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      safeHtml = window.DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'hr',
          'ul', 'ol', 'li',
          'a', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup',
          'blockquote', 'pre', 'code', 'kbd', 'samp',
          'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
          'img', 'figure', 'figcaption', 'picture', 'source',
          'div', 'span', 'section', 'article', 'header', 'footer', 'aside', 'main', 'nav',
          'details', 'summary',
          'iframe',
          'video', 'audio'
        ],
        ALLOWED_ATTR: [
          'class', 'id', 'style', 'title', 'alt', 'src', 'href', 'loading',
          'width', 'height', 'target', 'rel',
          'colspan', 'rowspan', 'scope',
          'controls', 'autoplay', 'loop', 'muted', 'playsinline',
          'allowfullscreen', 'frameborder', 'allow'
        ],
        ALLOW_DATA_ATTR: true,
        ALLOW_ARIA_ATTR: true,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        ADD_ATTR: ['target', 'loading'],
        FORBID_TAGS: ['script', 'meta', 'link', 'base', 'form', 'input', 'button', 'object', 'embed'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
      });
    } else {
      console.warn('[renderArticleDirect] DOMPurify not loaded — using fallback sanitizer.');
      safeHtml = fallbackSanitize(rawHtml);
    }
    
    wrapper.innerHTML = safeHtml;
    
    // Assign IDs to headings for TOC anchor support
    const headings = wrapper.querySelectorAll('h2, h3');
    headings.forEach((h, i) => {
      if (!h.id) h.id = `article-heading-${i}`;
    });
    
    // Inject scoped author CSS
    if (currentCode.css && currentCode.css.trim().length > 0) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-fbh-article-css', 'true');
      styleEl.textContent = scopeCss(currentCode.css, '.article-body');
      wrapper.appendChild(styleEl);
    }
    
    containerEl.appendChild(wrapper);
    requestAnimationFrame(() => fixArticleContrast(wrapper));
  }
  
  doRender();

  // Re-check contrast whenever the site theme is switched
  const themeObserver = new MutationObserver(() => {
    requestAnimationFrame(() => fixArticleContrast(containerEl.querySelector('.article-body')));
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  
  return {
    update(newCode) {
      currentCode = { ...currentCode, ...newCode };
      doRender();
    },
    destroy() {
      themeObserver.disconnect();
      containerEl.innerHTML = '';
    }
  };
}