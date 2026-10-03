/**
 * FREELANCE BD HUB — SEARCH ENGINE
 * Debounced search across title, description, tags, categoryName with ad injections.
 * All user-visible strings are localized via i18n.
 */

import { db, collection, getDocs, query, where, limit } from './firebase-init.js';
import { SAMPLE_ARTICLES } from './articles.js';
import { debounce, escapeHtml, formatDate } from './utils.js';
import { getCurrentLang, t } from './i18n.js';

function getDisplayTitle(art) {
  return (getCurrentLang() === 'en' && art.titleEn) ? art.titleEn : art.title;
}

function getDisplayDesc(art) {
  return (getCurrentLang() === 'en' && art.shortDescriptionEn) ? art.shortDescriptionEn : (art.shortDescription || '');
}

let cachedSearchPool = null;

export async function fetchSearchPool() {
  if (cachedSearchPool) return cachedSearchPool;
  
  try {
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      limit(50)
    );
    const snap = await getDocs(q);
    cachedSearchPool = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return cachedSearchPool;
  } catch (err) {
    console.warn('[Search] Failed to fetch articles pool from Firestore, using samples:', err);
  }
  
  cachedSearchPool = [...SAMPLE_ARTICLES];
  return cachedSearchPool;
}

export function filterArticles(articles, searchTerm = '', tag = '') {
  const term = searchTerm.toLowerCase().trim();
  const targetTag = tag.toLowerCase().trim();
  
  return articles.filter((a) => {
    if (targetTag) {
      const hasTag = a.tags && a.tags.some((t2) => t2.toLowerCase() === targetTag);
      if (!hasTag) return false;
    }
    
    if (!term) return true;
    
    const inTitle = a.title && a.title.toLowerCase().includes(term);
    const inTitleEn = a.titleEn && a.titleEn.toLowerCase().includes(term);
    const inDesc = a.shortDescription && a.shortDescription.toLowerCase().includes(term);
    const inDescEn = a.shortDescriptionEn && a.shortDescriptionEn.toLowerCase().includes(term);
    const inCategory = a.categoryName && a.categoryName.toLowerCase().includes(term);
    const inTags = a.tags && a.tags.some((t2) => t2.toLowerCase().includes(term));
    
    return inTitle || inTitleEn || inDesc || inDescEn || inCategory || inTags;
  });
}

/**
 * Render search results with an ad slot injected every 4 items.
 * All user-facing strings localized via `t()`.
 */
export function renderSearchResults(articles, containerEl) {
  if (!containerEl) return;
  
  if (articles.length === 0) {
    containerEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">${escapeHtml(t('search_no_results_title'))}</h3>
        <p>${escapeHtml(t('search_no_results_desc'))}</p>
      </div>
    `;
    return;
  }
  
  const adLabel = escapeHtml(t('ad_label'));
  const generalCategory = escapeHtml(t('card_category_general'));
  
  let html = '<div class="articles-grid">';
  
  articles.forEach((art, index) => {
    const chipLabel = art.categoryName || generalCategory;
    html += `
      <article class="article-card">
        <a href="/article.html?slug=${encodeURIComponent(art.slug)}" class="card-media">
          <img src="${art.featuredImage || '/assets/images/logo.svg'}" alt="${escapeHtml(getDisplayTitle(art))}" class="card-img" loading="lazy" />
          <span class="card-category-chip">${escapeHtml(chipLabel)}</span>
        </a>
        <div class="card-body">
          <h3 class="card-title">
            <a href="/article.html?slug=${encodeURIComponent(art.slug)}">${escapeHtml(getDisplayTitle(art))}</a>
          </h3>
          <p class="card-desc">${escapeHtml(getDisplayDesc(art))}</p>
          <div class="card-footer">
            <div class="card-author">
              <span class="author-avatar">${art.authorName ? art.authorName[0].toUpperCase() : 'F'}</span>
              <span>${escapeHtml(art.authorName || 'FBH Editorial')}</span>
            </div>
            <div class="card-meta-right">
              <span>📅 ${formatDate(art.publishedAt)}</span>
              <span>👁️ ${art.views || 0}</span>
            </div>
          </div>
        </div>
      </article>
    `;
    
    if ((index + 1) % 4 === 0 && index + 1 < articles.length) {
      html += `
        </div>
        <div class="fbh-ad-container" data-fbh-ad-slot="home_middle" style="grid-column: 1 / -1; margin: 2rem 0;">
          <span class="fbh-ad-label">${adLabel}</span>
          <div class="fbh-ad-body"></div>
        </div>
        <div class="articles-grid">
      `;
    }
  });
  
  html += '</div>';
  containerEl.innerHTML = html;
}