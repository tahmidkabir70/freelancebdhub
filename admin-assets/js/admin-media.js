/**
 * FREELANCE BD HUB — ADMIN MEDIA LIBRARY CONTROLLER
 * Purpose-based smart image compression, Cloudflare proxy uploads, media grid
 */

import {
  db,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from '/assets/js/firebase-init.js';
import { uploadImageSmart, formatBytes } from '/assets/js/imgbb.js';
import { showToast, escapeHtml } from '/assets/js/utils.js';

let mediaItems = [];

export async function initAdminMedia() {
  await loadMedia();

  const fileInput = document.getElementById('media-file-input');
  const uploadBtn = document.getElementById('btn-upload-media');
  const purposeSelect = document.getElementById('media-purpose-select');

  if (uploadBtn && fileInput) {
    uploadBtn.onclick = () => fileInput.click();

    fileInput.onchange = async () => {
      const files = Array.from(fileInput.files);
      if (files.length === 0) return;

      const purpose = purposeSelect ? purposeSelect.value : 'featured';

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'আপলোড হচ্ছে...';

      for (const file of files) {
        try {
          showToast(`${file.name} প্রসেস ও আপলোড হচ্ছে...`, 'info');
          const uploaded = await uploadImageSmart(file, { purpose });

          const mediaDoc = {
            type: 'image',
            source: 'imgbb',
            purpose,
            url: uploaded.url,
            displayUrl: uploaded.displayUrl,
            thumbUrl: uploaded.thumbUrl,
            mediumUrl: uploaded.mediumUrl,
            imgbbId: uploaded.id,
            width: uploaded.width || null,
            height: uploaded.height || null,
            size: uploaded.size,
            fileName: file.name,
            uploadedAt: new Date()
          };

          try {
            const ref = await addDoc(collection(db, 'media'), mediaDoc);
            mediaItems.unshift({ id: ref.id, ...mediaDoc });
          } catch (dbErr) {
            mediaItems.unshift({ id: 'local_' + Date.now(), ...mediaDoc });
          }

          showToast(`${file.name} সফলভাবে আপলোড হয়েছে!`, 'success');
        } catch (err) {
          showToast(`আপলোড ব্যর্থ: ${err.message}`, 'error');
        }
      }

      uploadBtn.disabled = false;
      uploadBtn.textContent = 'ছবি আপলোড করুন (Upload)';
      fileInput.value = '';
      renderMediaGrid();
    };
  }
}

async function loadMedia() {
  const grid = document.getElementById('media-grid');
  if (grid) {
    grid.innerHTML = '<div class="skeleton" style="height:240px; border-radius:12px;"></div>';
  }

  try {
    const q = query(collection(db, 'media'), orderBy('uploadedAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      mediaItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('[Admin Media] Firestore fetch fallback:', err);
  }

  renderMediaGrid();
}

function renderMediaGrid() {
  const grid = document.getElementById('media-grid');
  const countBadge = document.getElementById('media-count-badge');
  if (!grid) return;

  if (countBadge) {
    countBadge.textContent = `${mediaItems.length}টি ফাইল`;
  }

  if (mediaItems.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🖼️</div>
        <h3 class="empty-title">মিডিয়া লাইব্রেরিতে কোনো ছবি নেই</h3>
        <p>উপরে "ছবি আপলোড করুন" বাটনে ক্লিক করে ছবি যুক্ত করুন।</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = mediaItems.map((item) => `
    <div class="article-card" style="position:relative;">
      <div class="card-media" style="aspect-ratio: 4 / 3;">
        <img src="${item.displayUrl || item.url}" alt="${escapeHtml(item.fileName)}" class="card-img" loading="lazy" />
        <span class="card-category-chip" style="font-size:0.7rem;">${escapeHtml(item.purpose || 'Image')}</span>
      </div>
      <div class="card-body" style="padding:0.85rem;">
        <div style="font-weight:600; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(item.fileName)}">
          ${escapeHtml(item.fileName)}
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">
          ${item.size ? formatBytes(item.size) : ''}
        </div>
        <div style="display:flex; gap:0.4rem; margin-top:0.75rem;">
          <button class="btn btn-secondary btn-sm copy-url-btn" data-url="${item.url}" style="flex:1; justify-content:center;">
            📋 লিংক কপি
          </button>
          <button class="btn btn-secondary btn-sm delete-media-btn" data-id="${item.id}" style="color:#ef4444;">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Bind copy URL
  document.querySelectorAll('.copy-url-btn').forEach((btn) => {
    btn.onclick = () => {
      const url = btn.getAttribute('data-url');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        showToast('ইমেজ ইউআরএল কপি করা হয়েছে!', 'success');
      } else {
        prompt('Copy URL:', url);
      }
    };
  });

  // Bind delete
  document.querySelectorAll('.delete-media-btn').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('আপনি কি নিশ্চিত যে এই ছবিটি মুছে ফেলতে চান?')) {
        try {
          if (!id.startsWith('local_')) {
            await deleteDoc(doc(db, 'media', id));
          }
          mediaItems = mediaItems.filter((m) => m.id !== id);
          showToast('ছবি মুছে ফেলা হয়েছে।', 'success');
          renderMediaGrid();
        } catch (e) {
          showToast('ছবি মুছে ফেলা যায়নি।', 'error');
        }
      }
    };
  });
}
