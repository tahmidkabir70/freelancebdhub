/**
 * FREELANCE BD HUB — UTILITY FUNCTIONS
 * Date formatters, reading time, slug generation, toast, and theme logic
 */

export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0980-\u09FF-]+/g, '') // Keep Bengali and alphanumeric characters
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function countWords(content) {
  if (!content) return 0;
  // Strip HTML tags if any
  const clean = content.replace(/<[^>]*>?/gm, ' ');
  const matches = clean.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

export function calculateReadingTime(content, wordsPerMinute = 200) {
  const words = countWords(content);
  const minutes = Math.ceil(words / wordsPerMinute);
  return {
    words,
    minutes: Math.max(1, minutes),
    textEn: `${Math.max(1, minutes)} min read`,
    textBn: `${toBengaliDigits(Math.max(1, minutes))} মিনিট পড়ার সময়`
  };
}

export function toBengaliDigits(num) {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bn[+w]);
}

export function formatDate(dateInput) {
  if (!dateInput) return '';
  let d;
  if (typeof dateInput.toDate === 'function') {
    d = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateEn(dateInput) {
  if (!dateInput) return '';
  let d = typeof dateInput.toDate === 'function' ? dateInput.toDate() : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('fbh-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'fbh-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `fbh-toast ${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-weight:700; font-size:1.1rem; line-height:1;">${iconMap[type] || '•'}</span>
    <span style="flex:1;">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* --- Theme Management --- */
export function initTheme() {
  const savedTheme = localStorage.getItem('fbh_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(activeTheme);

  // Setup click listener for any theme-toggle-btn on the page
  document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
    btn.onclick = () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('fbh_theme', next);
    };
  });
}

export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  updateThemeIcons(theme);
}

function updateThemeIcons(theme) {
  document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
    btn.innerHTML =
      theme === 'dark'
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

/* --- View Count Deduplication --- */
export function hasViewedArticle(articleId) {
  try {
    const viewed = JSON.parse(sessionStorage.getItem('fbh_viewed_articles') || '[]');
    return viewed.includes(articleId);
  } catch (e) {
    return false;
  }
}

export function markArticleViewed(articleId) {
  try {
    const viewed = JSON.parse(sessionStorage.getItem('fbh_viewed_articles') || '[]');
    if (!viewed.includes(articleId)) {
      viewed.push(articleId);
      sessionStorage.setItem('fbh_viewed_articles', JSON.stringify(viewed));
    }
  } catch (e) {
    // SessionStorage may be restricted in sandboxes
  }
}

/* --- Debounce Utility --- */
export function debounce(func, wait = 400) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
