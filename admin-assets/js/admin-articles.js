/**
 * FREELANCE BD HUB — ADMIN ARTICLES LISTING & MANAGEMENT
 * Handles tabs filtering, searching, desktop table + mobile cards, publish/archive/delete
 */

import {
  db,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from '/assets/js/firebase-init.js';
import { SAMPLE_ARTICLES } from '/assets/js/articles.js';
import { formatDate, escapeHtml, showToast } from '/assets/js/utils.js';

let articlesPool = [];
let currentFilter = 'all';
let searchQuery = '';

export async function initAdminArticles() {
  await loadArticles();
  
  document.querySelectorAll('.articles-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.articles-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-status') || 'all';
      renderArticles();
    };
  });
  
  const searchInput = document.getElementById('articles-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderArticles();
    };
  }
}

export async function loadArticles() {
  const container = document.getElementById('articles-list-container');
  if (container) {
    container.innerHTML = '<div class="skeleton" style="height:300px; border-radius:12px;"></div>';
  }
  
  try {
    const q = query(collection(db, 'articles'), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    articlesPool = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[Admin Articles] Firestore fetch failed, loading samples fallback:', err);
    articlesPool = [...SAMPLE_ARTICLES];
  }
  
  renderArticles();
}

function renderArticles() {
  const container = document.getElementById('articles-list-container');
  if (!container) return;
  
  let filtered = articlesPool;
  
  if (currentFilter !== 'all') {
    filtered = filtered.filter((a) => a.status === currentFilter);
  }
  
  if (searchQuery) {
    filtered = filtered.filter((a) => {
      const t = (a.title || '').toLowerCase();
      const c = (a.categoryName || '').toLowerCase();
      return t.includes(searchQuery) || c.includes(searchQuery);
    });
  }
  
  const countBadge = document.getElementById('articles-count-badge');
  if (countBadge) {
    countBadge.textContent = `${filtered.length}টি আর্টিকেল`;
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3 class="empty-title">কোনো আর্টিকেল পাওয়া যায়নি</h3>
        <p>এই ফিল্টারে কোনো আর্টিকেল নেই। নতুন আর্টিকেল তৈরি করতে পারেন।</p>
        <div style="margin-top:1.5rem;">
          <a href="/admin/article-editor.html" class="btn btn-primary">+ নতুন আর্টিকেল লিখুন</a>
        </div>
      </div>
    `;
    return;
  }
  
  const statusColors = {
    published: 'badge-emerald',
    draft: 'badge-amber',
    scheduled: 'badge-primary',
    archived: 'badge-secondary'
  };
  
  container.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width:40px;">
              <input type="checkbox" id="select-all-articles" />
            </th>
            <th>শিরোনাম ও ক্যাটাগরি</th>
            <th>স্ট্যাটাস</th>
            <th>লেখক</th>
            <th>তারিখ</th>
            <th>ভিউ</th>
            <th style="text-align:right;">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((art) => `
            <tr data-article-id="${art.id}">
              <td>
                <input type="checkbox" class="article-select-cb" value="${art.id}" />
              </td>
              <td>
                <div style="font-weight:700; color:var(--text-primary); margin-bottom:0.25rem;">
                  <a href="/admin/article-editor.html?id=${encodeURIComponent(art.id)}">${escapeHtml(art.title)}</a>
                </div>
                <div style="font-size:0.8rem; color:var(--text-muted); display:flex; gap:0.5rem; align-items:center;">
                  <span>📁 ${escapeHtml(art.categoryName || 'General')}</span>
                  <span>•</span>
                  <span>/${art.slug}</span>
                </div>
              </td>
              <td>
                <span class="badge ${statusColors[art.status] || 'badge-primary'}">${art.status || 'draft'}</span>
              </td>
              <td>
                <span style="font-size:0.88rem;">${escapeHtml(art.authorName || 'Admin')}</span>
              </td>
              <td>
                <span style="font-size:0.85rem; color:var(--text-muted);">${formatDate(art.publishedAt || art.createdAt)}</span>
              </td>
              <td>
                <span style="font-weight:600;">${art.views || 0}</span>
              </td>
              <td style="text-align:right;">
                <div style="display:inline-flex; align-items:center; gap:0.35rem;">
                  <a href="/admin/article-editor.html?id=${encodeURIComponent(art.id)}" class="btn btn-secondary btn-sm" title="Edit Article">
                    ✏️ এডিট
                  </a>
                  <a href="/article.html?slug=${encodeURIComponent(art.slug)}" class="btn btn-secondary btn-sm" target="_blank" title="Live Preview">
                    👁️ প্রিভিউ
                  </a>
                  ${art.status === 'published' ? `
                    <button class="btn btn-secondary btn-sm unpublish-btn" data-id="${art.id}" title="Unpublish">
                      ⏸️ ড্রাফট
                    </button>
                  ` : `
                    <button class="btn btn-primary btn-sm publish-btn" data-id="${art.id}" title="Publish">
                      🚀 প্রকাশ
                    </button>
                  `}
                  <button class="btn btn-secondary btn-sm delete-btn" data-id="${art.id}" title="Delete" style="color:#ef4444;">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  bindArticleActions();
}

function bindArticleActions() {
  document.querySelectorAll('.publish-btn').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      await updateArticleStatus(id, 'published');
    };
  });
  
  document.querySelectorAll('.unpublish-btn').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      await updateArticleStatus(id, 'draft');
    };
  });
  
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('আপনি কি নিশ্চিত যে আপনি এই আর্টিকেলটি স্থায়ীভাবে মুছে ফেলতে চান? (Delete permanently?)')) {
        await deleteArticle(id);
      }
    };
  });
}

async function updateArticleStatus(id, status) {
  try {
    const art = articlesPool.find((a) => a.id === id);
    if (art) art.status = status;
    
    // Always persist to Firestore (including "sample-*" ids that were
    // seeded as real documents) so a publish/unpublish click isn't lost
    // on refresh.
    const ref = doc(db, 'articles', id);
    await updateDoc(ref, {
      status,
      publishedAt: status === 'published' ? new Date() : (art ? art.publishedAt : null),
      updatedAt: new Date()
    });
    
    showToast(`স্ট্যাটাস পরিবর্তন করে '${status}' করা হয়েছে।`, 'success');
    renderArticles();
  } catch (err) {
    showToast('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।', 'error');
  }
}

async function deleteArticle(id) {
  try {
    articlesPool = articlesPool.filter((a) => a.id !== id);
    
    await deleteDoc(doc(db, 'articles', id));
    
    showToast('আর্টিকেল সফলভাবে মুছে ফেলা হয়েছে।', 'success');
    renderArticles();
  } catch (err) {
    showToast('আর্টিকেল মুছে ফেলা যায়নি।', 'error');
  }
}