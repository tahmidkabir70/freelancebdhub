/**
 * FREELANCE BD HUB — ARTICLE EDITOR CORE ENGINE
 * Bengali + English content authoring with Translation Helper.
 *
 * Workflow:
 *   1. Write Bengali article in Bengali tab
 *   2. Go to Translation Helper tab
 *   3. Auto-fill Bengali content into helper fields
 *   4. Copy Full Prompt → paste into ChatGPT/Gemini
 *   5. Copy JSON response → paste back → Parse & Auto-Fill
 *   6. Save article
 *
 * The JSON parser is robust and handles common AI output mistakes
 * (unescaped quotes inside HTML, markdown fences, partial JSON).
 */

import {
  auth,
  db,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp
} from '/assets/js/firebase-init.js';
import { getCategories } from '/assets/js/articles.js';
import { slugify, calculateReadingTime, showToast, escapeHtml } from '/assets/js/utils.js';
import { uploadImageSmart } from '/assets/js/imgbb.js';
import { renderArticle } from '/article-renderer/renderer.js';

const SITE_BASE_URL = window.location.origin;

let currentArticleId = null;
let liveRenderer = null;
let liveRendererEn = null;
let autoSaveTimer = null;
let isDirty = false;
let isArticleLoaded = false;
let originalPublishedAt = null;
let seoTitleManuallyEdited = false;
let seoDescManuallyEdited = false;
let currentTopTab = 'bn';
let currentCodeTabBn = 'html';
let currentCodeTabEn = 'html-en';

export async function initArticleEditor() {
  const urlParams = new URLSearchParams(window.location.search);
  currentArticleId = urlParams.get('id');

  await loadCategoryOptions();
  setupTopLanguageTabs();
  setupFormListeners();
  setupCodeTabs();
  setupPreview();
  setupEnglishPane();
  setupTranslationHelper();

  if (currentArticleId) {
    await loadExistingArticle(currentArticleId);
  } else {
    isArticleLoaded = true;
    autoFillAuthor();
  }

  setupAutoFill();
  startAutoSave();

  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

/* ════════════════════════════════════════════════════════════════
   Top-level pane switching
   ════════════════════════════════════════════════════════════════ */

function setupTopLanguageTabs() {
  const tabs = document.querySelectorAll('.editor-top-tab');
  const paneBn = document.getElementById('lang-pane-bn');
  const paneEn = document.getElementById('lang-pane-en');
  const paneTr = document.getElementById('lang-pane-translate');

  tabs.forEach((tab) => {
    tab.onclick = () => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.style.color = 'var(--text-muted)';
        t.style.background = 'transparent';
      });
      tab.classList.add('active');
      tab.style.color = 'var(--primary)';
      tab.style.background = 'var(--primary-light)';

      currentTopTab = tab.getAttribute('data-langtab');

      paneBn.style.display = 'none';
      paneEn.style.display = 'none';
      paneTr.style.display = 'none';

      if (currentTopTab === 'en') {
        paneEn.style.display = '';
        updateEnPreview();
      } else if (currentTopTab === 'translate') {
        paneTr.style.display = '';
      } else {
        paneBn.style.display = '';
        updatePreview();
      }
    };
  });
}

/* ════════════════════════════════════════════════════════════════
   Category dropdown
   ════════════════════════════════════════════════════════════════ */

async function loadCategoryOptions() {
  const selectEl = document.getElementById('editor-category');
  if (!selectEl) return;

  const categories = await getCategories();
  selectEl.innerHTML = `
    <option value="">ক্যাটাগরি নির্বাচন করুন (Select Category)...</option>
    ${categories.map((c) => `
      <option value="${c.id}" data-name="${escapeHtml(c.name)}" data-name-en="${escapeHtml(c.nameEn || '')}" data-slug="${c.slug}">
        ${c.icon || '📁'} ${escapeHtml(c.name)}
      </option>
    `).join('')}
  `;
}

/* ════════════════════════════════════════════════════════════════
   Auto-fill helpers
   ════════════════════════════════════════════════════════════════ */

function autoFillAuthor() {
  const authorInput = document.getElementById('editor-author');
  if (!authorInput || authorInput.value.trim()) return;
  const user = auth.currentUser;
  if (!user) return;
  if (user.displayName && user.displayName.trim()) {
    authorInput.value = user.displayName.trim();
    return;
  }
  const prefix = (user.email || '').split('@')[0];
  if (prefix) authorInput.value = prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function setupAutoFill() {
  const titleInput = document.getElementById('editor-title');
  const slugInput = document.getElementById('editor-slug');
  const shortDescInput = document.getElementById('editor-short-desc');
  const seoTitleInput = document.getElementById('editor-seo-title');
  const seoDescInput = document.getElementById('editor-seo-desc');
  const canonicalInput = document.getElementById('editor-canonical');

  if (!titleInput || !slugInput) return;

  const updateCanonical = () => {
    if (!canonicalInput) return;
    const slug = slugInput.value.trim();
    const prefix = `${SITE_BASE_URL}/article.html?slug=`;
    const currentValue = canonicalInput.value.trim();
    if (!currentValue || currentValue.startsWith(prefix)) {
      canonicalInput.value = slug ? `${prefix}${encodeURIComponent(slug)}` : '';
    }
  };

  slugInput.addEventListener('input', updateCanonical);
  updateCanonical();

  if (seoTitleInput) {
    seoTitleInput.addEventListener('input', () => {
      seoTitleManuallyEdited = seoTitleInput.value.trim().length > 0;
    });
    titleInput.addEventListener('input', () => {
      if (!seoTitleManuallyEdited) seoTitleInput.value = titleInput.value.trim();
    });
  }

  if (seoDescInput && shortDescInput) {
    seoDescInput.addEventListener('input', () => {
      seoDescManuallyEdited = seoDescInput.value.trim().length > 0;
    });
    shortDescInput.addEventListener('input', () => {
      if (!seoDescManuallyEdited) seoDescInput.value = shortDescInput.value.trim();
    });
  }
}

/* ════════════════════════════════════════════════════════════════
   Form listeners
   ════════════════════════════════════════════════════════════════ */

function setupFormListeners() {
  const titleInput = document.getElementById('editor-title');
  const slugInput = document.getElementById('editor-slug');
  const regenSlugBtn = document.getElementById('regen-slug-btn');
  const descInput = document.getElementById('editor-short-desc');
  const descCounter = document.getElementById('desc-char-counter');
  const htmlInput = document.getElementById('code-html');

  titleInput.addEventListener('input', () => {
    isDirty = true;
    if (!currentArticleId && (!slugInput.dataset.manual || slugInput.dataset.manual === 'false')) {
      slugInput.value = slugify(titleInput.value);
    }
  });

  slugInput.addEventListener('input', () => {
    slugInput.dataset.manual = 'true';
    isDirty = true;
  });

  if (regenSlugBtn) {
    regenSlugBtn.onclick = () => {
      slugInput.value = slugify(titleInput.value);
      slugInput.dataset.manual = 'false';
      showToast('স্লাগ পুনঃতৈরি করা হয়েছে।', 'info');
    };
  }

  if (descInput && descCounter) {
    descInput.addEventListener('input', () => {
      isDirty = true;
      const count = descInput.value.length;
      descCounter.textContent = `${count} / 160`;
      descCounter.style.color = count > 160 ? '#ef4444' : 'var(--text-muted)';
    });
  }

  if (htmlInput) {
    htmlInput.addEventListener('input', () => {
      isDirty = true;
      updateReadingMeta();
    });
  }

  setupImageUploader();

  document.getElementById('btn-save-draft').onclick = () => saveArticle('draft');
  document.getElementById('btn-publish').onclick = () => saveArticle('published');

  document.getElementById('btn-preview-external').onclick = () => {
    const slug = slugInput.value.trim();
    if (!slug) {
      showToast('প্রিভিউ করার আগে স্লাগ দিন।', 'error');
      slugInput.focus();
      return;
    }
    window.open(`/article.html?slug=${encodeURIComponent(slug)}&preview=true`, '_blank');
  };

  const insertImgBtn = document.getElementById('btn-insert-image');
  if (insertImgBtn) {
    insertImgBtn.onclick = async () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = async () => {
        const file = fileInput.files[0];
        if (!file) return;
        showToast('ছবি আপলোড হচ্ছে...', 'info');
        try {
          const res = await uploadImageSmart(file, { purpose: 'body' });
          const imgTag = `\n<img src="${res.url}" alt="${escapeHtml(file.name)}" loading="lazy" />\n`;
          insertAtCursor(document.getElementById('code-html'), imgTag);
          showToast('ছবি সফলভাবে আর্টিকেলে ইনসার্ট করা হয়েছে!', 'success');
          updatePreview();
        } catch (e) {
          showToast('ছবি আপলোড করা যায়নি: ' + e.message, 'error');
        }
      };
      fileInput.click();
    };
  }
}

function insertAtCursor(textarea, textToInsert) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  textarea.value = val.substring(0, start) + textToInsert + val.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
  textarea.focus();
}

/* ════════════════════════════════════════════════════════════════
   Featured image uploader
   ════════════════════════════════════════════════════════════════ */

function setupImageUploader() {
  const uploadBtn = document.getElementById('upload-featured-btn');
  const fileInput = document.getElementById('featured-file-input');
  const previewImg = document.getElementById('featured-preview-img');
  const imgUrlInput = document.getElementById('editor-featured-image-url');

  if (uploadBtn && fileInput) {
    uploadBtn.onclick = () => fileInput.click();
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (!file) return;
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'আপলোড হচ্ছে...';
      try {
        const result = await uploadImageSmart(file, { purpose: 'featured' });
        imgUrlInput.value = result.url;
        if (previewImg) {
          previewImg.src = result.url;
          previewImg.style.display = 'block';
        }
        showToast('ফিচার্ড ইমেজ আপলোড সম্পন্ন!', 'success');
      } catch (err) {
        showToast(err.message || 'আপলোড ব্যর্থ হয়েছে।', 'error');
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'ছবি আপলোড করুন (Upload)';
      }
    };
  }

  if (imgUrlInput && previewImg) {
    imgUrlInput.addEventListener('input', () => {
      if (imgUrlInput.value.trim()) {
        previewImg.src = imgUrlInput.value.trim();
        previewImg.style.display = 'block';
      } else {
        previewImg.style.display = 'none';
      }
    });
  }
}

/* ════════════════════════════════════════════════════════════════
   Bengali code tabs
   ════════════════════════════════════════════════════════════════ */

function setupCodeTabs() {
  const tabs = document.querySelectorAll('.editor-tab-btn:not(.editor-tab-btn-en)');
  const panes = {
    html: document.getElementById('pane-html'),
    css: document.getElementById('pane-css'),
    javascript: document.getElementById('pane-javascript'),
    preview: document.getElementById('pane-preview')
  };

  tabs.forEach((tab) => {
    tab.onclick = () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentCodeTabBn = tab.getAttribute('data-tab');

      Object.keys(panes).forEach((k) => {
        if (panes[k]) panes[k].style.display = k === currentCodeTabBn ? 'block' : 'none';
      });

      if (currentCodeTabBn === 'preview') updatePreview();
    };
  });

  ['code-html', 'code-css', 'code-javascript'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); insertAtCursor(el, '  '); }
    });

    el.addEventListener('input', () => {
      isDirty = true;
      debouncePreview();
    });
  });
}

let previewDebounceTimer = null;
function debouncePreview() {
  clearTimeout(previewDebounceTimer);
  previewDebounceTimer = setTimeout(() => updatePreview(), 500);
}

function setupPreview() {
  const previewBox = document.getElementById('editor-preview-container');
  if (!previewBox) return;

  liveRenderer = renderArticle(previewBox, {
    html: document.getElementById('code-html')?.value || '',
    css: document.getElementById('code-css')?.value || '',
    javascript: document.getElementById('code-javascript')?.value || ''
  });
}

function updatePreview() {
  if (!liveRenderer) return;
  liveRenderer.update({
    html: document.getElementById('code-html')?.value || '',
    css: document.getElementById('code-css')?.value || '',
    javascript: document.getElementById('code-javascript')?.value || ''
  });
}

function updateReadingMeta() {
  const html = document.getElementById('code-html')?.value || '';
  const meta = calculateReadingTime(html);
  const wordBadge = document.getElementById('word-count-badge');
  const readBadge = document.getElementById('reading-time-badge');
  if (wordBadge) wordBadge.textContent = `${meta.words} শব্দ`;
  if (readBadge) readBadge.textContent = meta.textEn;
}

/* ════════════════════════════════════════════════════════════════
   English pane
   ════════════════════════════════════════════════════════════════ */

function setupEnglishPane() {
  const tabs = document.querySelectorAll('.editor-tab-btn-en');
  const panes = {
    'html-en': document.getElementById('pane-html-en'),
    'css-en': document.getElementById('pane-css-en'),
    'javascript-en': document.getElementById('pane-javascript-en'),
    'preview-en': document.getElementById('pane-preview-en')
  };

  tabs.forEach((tab) => {
    tab.onclick = () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentCodeTabEn = tab.getAttribute('data-tab');

      Object.keys(panes).forEach((k) => {
        if (panes[k]) panes[k].style.display = k === currentCodeTabEn ? 'block' : 'none';
      });

      if (currentCodeTabEn === 'preview-en') updateEnPreview();
    };
  });

  ['code-html-en', 'code-css-en', 'code-javascript-en'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); insertAtCursor(el, '  '); }
    });
    el.addEventListener('input', () => {
      isDirty = true;
      debounceEnPreview();
    });
  });
}

let previewDebounceTimerEn = null;
function debounceEnPreview() {
  clearTimeout(previewDebounceTimerEn);
  previewDebounceTimerEn = setTimeout(() => updateEnPreview(), 500);
}

function setupEnPreview() {
  const box = document.getElementById('editor-preview-container-en');
  if (!box) return;
  liveRendererEn = renderArticle(box, {
    html: document.getElementById('code-html-en')?.value || '',
    css: document.getElementById('code-css-en')?.value || '',
    javascript: document.getElementById('code-javascript-en')?.value || ''
  });
}

function updateEnPreview() {
  const box = document.getElementById('editor-preview-container-en');
  if (!box) return;
  if (!liveRendererEn) setupEnPreview();
  if (!liveRendererEn) return;
  liveRendererEn.update({
    html: document.getElementById('code-html-en')?.value || '',
    css: document.getElementById('code-css-en')?.value || '',
    javascript: document.getElementById('code-javascript-en')?.value || ''
  });
}

/* ════════════════════════════════════════════════════════════════
   Translation Helper
   ════════════════════════════════════════════════════════════════ */

function setupTranslationHelper() {
  const autoFillBtn = document.getElementById('btn-autofill-from-bn');
  const copyBtn = document.getElementById('btn-copy-prompt');
  const previewBtn = document.getElementById('btn-preview-prompt');
  const parseBtn = document.getElementById('btn-parse-json');
  const clearBtn = document.getElementById('btn-clear-json');

  if (autoFillBtn) autoFillBtn.onclick = autoFillTranslationFieldsFromBengali;
  if (copyBtn) copyBtn.onclick = copyTranslationPrompt;
  if (previewBtn) previewBtn.onclick = previewTranslationPrompt;
  if (parseBtn) parseBtn.onclick = parseJsonResponseIntoEnglishFields;
  if (clearBtn) clearBtn.onclick = () => {
    document.getElementById('json-response-input').value = '';
    showToast('Cleared.', 'info');
  };
}

function autoFillTranslationFieldsFromBengali() {
  const catSelect = document.getElementById('editor-category');
  const catOpt = catSelect ? catSelect.selectedOptions[0] : null;
  const categoryName = catOpt ? (catOpt.dataset.name || '') : '';

  document.getElementById('tb-title').value = document.getElementById('editor-title').value || '';
  document.getElementById('tb-short-desc').value = document.getElementById('editor-short-desc').value || '';
  document.getElementById('tb-html').value = document.getElementById('code-html').value || '';
  document.getElementById('tb-seo-title').value = document.getElementById('editor-seo-title').value || '';
  document.getElementById('tb-seo-desc').value = document.getElementById('editor-seo-desc').value || '';
  document.getElementById('tb-category').value = categoryName;

  showToast('Bengali content fields auto-filled ✅', 'success');
}

function gatherTranslationFields() {
  return {
    title: (document.getElementById('tb-title').value || '').trim(),
    shortDescription: (document.getElementById('tb-short-desc').value || '').trim(),
    html: document.getElementById('tb-html').value || '',
    seoTitle: (document.getElementById('tb-seo-title').value || '').trim(),
    seoDescription: (document.getElementById('tb-seo-desc').value || '').trim(),
    categoryName: (document.getElementById('tb-category').value || '').trim()
  };
}

function buildTranslationPrompt(data) {
  return `You are a professional Bengali-to-English translator for an online freelancing and technology publication called "Freelance BD Hub".

Translate the Bengali article below into high-quality, natural, professional English.

═══════════════════════════════════════════════════
RULES — READ CAREFULLY
═══════════════════════════════════════════════════

1. Translate MEANING, not words. Do NOT do literal word-by-word translation. Write like a native English writer.

2. Preserve the HTML STRUCTURE exactly. Do NOT change:
   - HTML tags (h2, p, ul, li, table, tr, td, a, img, blockquote, etc.)
   - CSS class names, IDs, style attributes
   - URLs (image src, link href, iframe src)
   - data-* attributes
   - <pre>, <code> blocks
   - emojis
   - the overall document structure
   Only translate the human-readable TEXT between tags.

3. Preserve the author's tone: friendly, practical, beginner-friendly, informative.

4. Do NOT invent facts. Do NOT add information. Do NOT remove information.

5. CRITICAL for JSON output: When returning the JSON, escape every double quote inside string values as \\" so the output is valid JSON that passes JSON.parse(). Double-check that "htmlEn" contains escaped quotes.

═══════════════════════════════════════════════════
INPUT — BENGALI CONTENT
═══════════════════════════════════════════════════

[BENGALI TITLE]
${data.title}

[BENGALI SHORT DESCRIPTION]
${data.shortDescription || '(none)'}

[BENGALI ARTICLE HTML]
${data.html}

[BENGALI SEO TITLE]
${data.seoTitle || data.title}

[BENGALI SEO DESCRIPTION]
${data.seoDescription || data.shortDescription || '(none)'}

[BENGALI CATEGORY NAME]
${data.categoryName || '(none)'}

═══════════════════════════════════════════════════
OUTPUT — RETURN EXACTLY THIS JSON
═══════════════════════════════════════════════════

Return a single JSON object with exactly these keys:

{
  "titleEn": "English title here",
  "shortDescriptionEn": "English short description here",
  "htmlEn": "<English article HTML here, with all tags and classes preserved>",
  "seoTitleEn": "English SEO title here",
  "seoDescriptionEn": "English SEO description here",
  "categoryNameEn": "English category name here"
}

Output the JSON only. Nothing else.`;
}

async function copyTranslationPrompt() {
  const data = gatherTranslationFields();
  if (!data.title) return showToast('Bengali Title খালি — আগে পূরণ করুন।', 'error');
  if (!data.html.trim()) return showToast('Bengali Article HTML খালি — আগে পূরণ করুন।', 'error');

  const prompt = buildTranslationPrompt(data);
  const ok = await copyToClipboard(prompt);
  if (ok) showToast('✅ Full prompt copied! এখন ChatGPT/Gemini-তে paste করুন।', 'success');
}

function previewTranslationPrompt() {
  const data = gatherTranslationFields();
  const prompt = buildTranslationPrompt(data);
  const previewWrap = document.getElementById('prompt-preview-wrap');
  const preview = document.getElementById('prompt-preview');
  preview.value = prompt;
  previewWrap.style.display = 'block';
  showToast('Prompt preview দেখা যাচ্ছে নিচে।', 'info');
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch (e) {
    showToast('Copy failed. Please copy manually.', 'error');
    return false;
  }
}

/* ════════════════════════════════════════════════════════════════
   Parse ChatGPT JSON Response → English fields
   ════════════════════════════════════════════════════════════════ */

async function parseJsonResponseIntoEnglishFields() {
  const raw = document.getElementById('json-response-input').value.trim();
  if (!raw) return showToast('আগে ChatGPT-র JSON response paste করুন।', 'error');

  const parsed = robustParseTranslationJson(raw);

  if (!parsed || typeof parsed !== 'object') {
    return showToast('JSON parse করা যায়নি। ChatGPT-র response আরেকবার check করুন।', 'error');
  }

  let filled = 0;
  const setIfPresent = (id, value) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      const el = document.getElementById(id);
      if (el) {
        el.value = value;
        filled++;
      }
    }
  };

  setIfPresent('editor-title-en', parsed.titleEn);
  setIfPresent('editor-short-desc-en', parsed.shortDescriptionEn);
  setIfPresent('code-html-en', parsed.htmlEn);
  setIfPresent('editor-seo-title-en', parsed.seoTitleEn);
  setIfPresent('editor-seo-desc-en', parsed.seoDescriptionEn);
  setIfPresent('editor-category-name-en', parsed.categoryNameEn);

  const cssEn = document.getElementById('code-css-en');
  const jsEn = document.getElementById('code-javascript-en');
  if (cssEn && !cssEn.value.trim()) cssEn.value = document.getElementById('code-css').value;
  if (jsEn && !jsEn.value.trim()) jsEn.value = document.getElementById('code-javascript').value;

  isDirty = true;
  updateEnPreview();

  if (filled === 0) {
    return showToast('⚠️ কোনো field extract করা যায়নি। Raw text check করুন।', 'error');
  }

  showToast(`✅ ${filled}টি English field পূরণ হয়েছে!`, 'success');

  const enTab = document.querySelector('.editor-top-tab[data-langtab="en"]');
  if (enTab) enTab.click();
}

/**
 * Robust parser for ChatGPT/Gemini JSON responses.
 *
 * Attempts, in order:
 *   1. Direct JSON.parse
 *   2. Strip markdown fences → JSON.parse
 *   3. Extract first {...} block → JSON.parse
 *   4. Manual field-by-field extraction (tolerates unescaped quotes
 *      inside htmlEn — a very common AI mistake)
 */
function robustParseTranslationJson(raw) {
  // 1. Direct
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === 'object') return p;
  } catch (e) {}

  // 2. Strip markdown fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    const p = JSON.parse(cleaned);
    if (p && typeof p === 'object') return p;
  } catch (e) {}

  // 3. Extract {...}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const p = JSON.parse(match[0]);
      if (p && typeof p === 'object') return p;
    } catch (e) {}
  }

  // 4. Manual extraction
  return manualExtractFields(cleaned || raw);
}

/**
 * Field-by-field manual extractor — works even for invalid JSON.
 *
 * Strategy:
 *   - Locate every "key": in the raw text (in the order they appear).
 *   - For each key, its value spans from right after the opening quote
 *     to just before the next "key": appears.
 *   - Trailing JSON syntax (", or "}) is stripped.
 *   - Common JSON escapes are unescaped.
 */
function manualExtractFields(text) {
  const KEYS = [
    'titleEn',
    'shortDescriptionEn',
    'htmlEn',
    'seoTitleEn',
    'seoDescriptionEn',
    'categoryNameEn'
  ];

  // Find positions of `"key":`
  const positions = [];
  for (const key of KEYS) {
    const re = new RegExp(`"${key}"\\s*:\\s*`, 'i');
    const m = re.exec(text);
    if (m) {
      positions.push({
        key,
        keyEnd: m.index + m[0].length
      });
    }
  }

  if (positions.length === 0) return null;

  positions.sort((a, b) => a.keyEnd - b.keyEnd);

  const result = {};

  for (let i = 0; i < positions.length; i++) {
    const { key, keyEnd } = positions[i];
    const nextKeyEnd = (i + 1 < positions.length) ? positions[i + 1].keyEnd : -1;

    // Slice of the raw text containing this value + possibly the next key's prefix
    let slice;
    if (nextKeyEnd !== -1) {
      // Find the start of the next key (its `"key":` begins BEFORE nextKeyEnd)
      const nextKeyStart = text.lastIndexOf('"', nextKeyEnd - 1);
      const nextKeyStart2 = text.lastIndexOf('"', nextKeyStart - 1);
      slice = text.slice(keyEnd, nextKeyStart2 !== -1 ? nextKeyStart2 : nextKeyEnd);
    } else {
      slice = text.slice(keyEnd);
    }

    // Strip leading whitespace and the opening quote if present
    slice = slice.replace(/^\s*/, '');
    if (slice[0] === '"') slice = slice.slice(1);

    // Strip trailing: `",` or `"}` or `"\n,` etc.
    slice = slice.replace(/",?\s*\}\s*$/, '').replace(/",?\s*$/, '').replace(/"?\s*$/, '');

    // Unescape JSON escapes
    let value = slice
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\\\/g, '\\');

    value = value.trim();

    if (value.length > 0) result[key] = value;
  }

  if (result.titleEn || result.htmlEn) return result;
  return null;
}

/* ════════════════════════════════════════════════════════════════
   Load existing article
   ════════════════════════════════════════════════════════════════ */

async function loadExistingArticle(id) {
  try {
    const ref = doc(db, 'articles', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      showToast('আর্টিকেলটি খুঁজে পাওয়া যায়নি।', 'error');
      isArticleLoaded = false;
      return;
    }

    const art = { id: snap.id, ...snap.data() };
    originalPublishedAt = art.publishedAt || null;

    document.getElementById('editor-title').value = art.title || '';
    document.getElementById('editor-slug').value = art.slug || '';
    document.getElementById('editor-category').value = art.categoryId || '';
    document.getElementById('editor-tags').value = (art.tags || []).join(', ');
    document.getElementById('editor-featured-image-url').value = art.featuredImage || '';

    const previewImg = document.getElementById('featured-preview-img');
    if (previewImg && art.featuredImage) {
      previewImg.src = art.featuredImage;
      previewImg.style.display = 'block';
    }

    document.getElementById('editor-short-desc').value = art.shortDescription || '';
    document.getElementById('editor-author').value = art.authorName || '';
    document.getElementById('editor-status').value = art.status || 'draft';

    const seoTitleInput = document.getElementById('editor-seo-title');
    const seoDescInput = document.getElementById('editor-seo-desc');
    seoTitleInput.value = art.seoTitle || '';
    seoDescInput.value = art.seoDescription || '';
    document.getElementById('editor-canonical').value = art.canonicalUrl || '';

    seoTitleManuallyEdited = !!(art.seoTitle && art.seoTitle.trim());
    seoDescManuallyEdited = !!(art.seoDescription && art.seoDescription.trim());

    document.getElementById('code-html').value = art.html || '';
    document.getElementById('code-css').value = art.css || '';
    document.getElementById('code-javascript').value = art.javascript || '';

    document.getElementById('editor-title-en').value = art.titleEn || '';
    document.getElementById('editor-short-desc-en').value = art.shortDescriptionEn || '';
    document.getElementById('editor-seo-title-en').value = art.seoTitleEn || '';
    document.getElementById('editor-seo-desc-en').value = art.seoDescriptionEn || '';
    document.getElementById('editor-category-name-en').value = art.categoryNameEn || '';
    document.getElementById('code-html-en').value = art.htmlEn || '';
    document.getElementById('code-css-en').value = art.cssEn || '';
    document.getElementById('code-javascript-en').value = art.javascriptEn || '';

    updateReadingMeta();
    updatePreview();
    isDirty = false;
    isArticleLoaded = true;
  } catch (err) {
    console.warn('[Editor] Failed to load article:', err);
    isArticleLoaded = false;
  }
}

/* ════════════════════════════════════════════════════════════════
   Save article
   ════════════════════════════════════════════════════════════════ */

async function saveArticle(forcedStatus = null) {
  const title = document.getElementById('editor-title').value.trim();
  const slug = document.getElementById('editor-slug').value.trim();
  const categorySelect = document.getElementById('editor-category');
  const categoryId = categorySelect.value;
  const categoryOption = categorySelect.selectedOptions[0];
  const categoryName = categoryOption ? categoryOption.dataset.name : '';
  const categorySlug = categoryOption ? categoryOption.dataset.slug : '';

  const tagsRaw = document.getElementById('editor-tags').value;
  const tags = tagsRaw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

  const featuredImage = document.getElementById('editor-featured-image-url').value.trim();
  const shortDescription = document.getElementById('editor-short-desc').value.trim();
  const authorName = document.getElementById('editor-author').value.trim() || 'Admin';
  const status = forcedStatus || document.getElementById('editor-status').value || 'draft';
  const seoTitle = document.getElementById('editor-seo-title').value.trim();
  const seoDescription = document.getElementById('editor-seo-desc').value.trim();
  const canonicalUrl = document.getElementById('editor-canonical').value.trim();

  const html = document.getElementById('code-html').value;
  const css = document.getElementById('code-css').value;
  const javascript = document.getElementById('code-javascript').value;

  const titleEn = document.getElementById('editor-title-en').value.trim();
  const shortDescriptionEn = document.getElementById('editor-short-desc-en').value.trim();
  const seoTitleEn = document.getElementById('editor-seo-title-en').value.trim();
  const seoDescriptionEn = document.getElementById('editor-seo-desc-en').value.trim();
  const categoryNameEn = document.getElementById('editor-category-name-en').value.trim();
  const htmlEn = document.getElementById('code-html-en').value;
  const cssEn = document.getElementById('code-css-en').value;
  const javascriptEn = document.getElementById('code-javascript-en').value;

  if (!title) {
    showToast('আর্টিকেলের শিরোনাম দিন (Title is required)', 'error');
    document.getElementById('editor-title').focus();
    return;
  }
  if (!slug) {
    showToast('ইউআরএল স্লাগ দিন (URL slug is required)', 'error');
    document.getElementById('editor-slug').focus();
    return;
  }
  if (!categoryId) {
    showToast('একটি ক্যাটাগরি নির্বাচন করুন (Category is required)', 'error');
    document.getElementById('editor-category').focus();
    return;
  }

  const { words, minutes } = calculateReadingTime(html);

  const payload = {
    title,
    slug,
    categoryId,
    categoryName,
    categorySlug,
    tags,
    featuredImage,
    shortDescription,
    authorName,
    status,
    seoTitle,
    seoDescription,
    canonicalUrl,
    html,
    css,
    javascript,
    readingTime: minutes,
    wordCount: words,
    updatedAt: new Date()
  };

  if (titleEn) payload.titleEn = titleEn;
  if (shortDescriptionEn) payload.shortDescriptionEn = shortDescriptionEn;
  if (seoTitleEn) payload.seoTitleEn = seoTitleEn;
  if (seoDescriptionEn) payload.seoDescriptionEn = seoDescriptionEn;
  if (categoryNameEn) payload.categoryNameEn = categoryNameEn;
  if (htmlEn) payload.htmlEn = htmlEn;
  if (cssEn) payload.cssEn = cssEn;
  if (javascriptEn) payload.javascriptEn = javascriptEn;

  if (status === 'published' && !originalPublishedAt) {
    payload.publishedAt = new Date();
  }

  try {
    if (currentArticleId && !currentArticleId.startsWith('sample-')) {
      const ref = doc(db, 'articles', currentArticleId);
      await updateDoc(ref, payload);
    } else {
      payload.createdAt = new Date();
      payload.views = 0;
      const ref = await addDoc(collection(db, 'articles'), payload);
      currentArticleId = ref.id;
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('id', currentArticleId);
      window.history.replaceState({}, '', newUrl);
    }

    if (status === 'published' && !originalPublishedAt && payload.publishedAt) {
      originalPublishedAt = payload.publishedAt;
    }

    isDirty = false;
    showToast(`আর্টিকেল সফলভাবে ${status === 'published' ? 'প্রকাশিত' : 'সংরক্ষিত'} হয়েছে!`, 'success');
  } catch (err) {
    console.error('[Editor Save Error]:', err);
    showToast('সংরক্ষণ ব্যর্থ হয়েছে: ' + err.message, 'error');
  }
}

/* ════════════════════════════════════════════════════════════════
   Auto-save (20 s)
   ════════════════════════════════════════════════════════════════ */

function startAutoSave() {
  autoSaveTimer = setInterval(() => {
    if (isDirty && document.getElementById('editor-title')?.value.trim()) {
      if (currentArticleId && !isArticleLoaded) {
        console.warn('[Auto-Save] Skipped — existing article not loaded yet.');
        return;
      }
      const forcedStatus = currentArticleId ? null : 'draft';
      saveArticle(forcedStatus);
    }
  }, 20000);
}