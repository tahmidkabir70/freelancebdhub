/**
 * FREELANCE BD HUB — ADMIN COMMENTS MODERATION CONTROLLER
 * Tabs: Pending / Approved / Rejected / Spam, individual & bulk approval/deletion
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
import { formatDate, escapeHtml, showToast } from '/assets/js/utils.js';

let commentsList = [];
let currentFilter = 'pending';

export async function initAdminComments() {
  await loadComments();

  // Tab Filtering
  document.querySelectorAll('.comments-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.comments-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-status') || 'pending';
      renderComments();
    };
  });

  // Bulk actions
  const approveAllBtn = document.getElementById('btn-approve-all');
  if (approveAllBtn) {
    approveAllBtn.onclick = async () => {
      const pending = commentsList.filter((c) => c.status === 'pending');
      for (const c of pending) {
        await updateCommentStatus(c.id, 'approved', false);
      }
      showToast('সকল পেন্ডিং মন্তব্য অনুমোদন করা হয়েছে!', 'success');
      renderComments();
    };
  }
}

async function loadComments() {
  const container = document.getElementById('comments-tbody');
  if (container) {
    container.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">মন্তব্য লোড হচ্ছে...</td></tr>';
  }

  try {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      commentsList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } else {
      commentsList = [];
    }
  } catch (err) {
    console.warn('[Admin Comments] Firestore fetch fallback:', err);
    commentsList = [];
  }

  renderComments();
}

function renderComments() {
  const tbody = document.getElementById('comments-tbody');
  const countBadge = document.getElementById('comments-count-badge');
  if (!tbody) return;

  const filtered = commentsList.filter((c) => (c.status || 'pending') === currentFilter);

  if (countBadge) {
    countBadge.textContent = `${filtered.length}টি মন্তব্য (${currentFilter})`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:3rem; color:var(--text-muted);">
          কোনো ${currentFilter} মন্তব্য নেই।
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((c) => `
    <tr>
      <td style="width:160px;">
        <div style="font-weight:700; color:var(--text-primary);">👤 ${escapeHtml(c.name)}</div>
        <div style="font-size:0.78rem; color:var(--text-muted);">${formatDate(c.createdAt)}</div>
      </td>
      <td>
        <div style="font-size:0.92rem; color:var(--text-secondary); line-height:1.5;">${escapeHtml(c.comment)}</div>
        <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.35rem;">
          আর্টিকেল: <strong>${escapeHtml(c.articleTitle || c.articleSlug || 'General')}</strong>
        </div>
      </td>
      <td style="width:110px;">
        <span class="badge ${c.status === 'approved' ? 'badge-emerald' : c.status === 'pending' ? 'badge-amber' : 'badge-secondary'}">
          ${c.status || 'pending'}
        </span>
      </td>
      <td style="text-align:right; width:180px;">
        <div style="display:inline-flex; gap:0.35rem;">
          ${c.status !== 'approved' ? `
            <button class="btn btn-secondary btn-sm approve-c-btn" data-id="${c.id}" style="color:#10b981;">✓ অনুমোদন</button>
          ` : `
            <button class="btn btn-secondary btn-sm reject-c-btn" data-id="${c.id}" style="color:#f59e0b;">পেন্ডিং</button>
          `}
          <button class="btn btn-secondary btn-sm delete-c-btn" data-id="${c.id}" style="color:#ef4444;">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Bind actions
  document.querySelectorAll('.approve-c-btn').forEach((btn) => {
    btn.onclick = () => updateCommentStatus(btn.getAttribute('data-id'), 'approved');
  });

  document.querySelectorAll('.reject-c-btn').forEach((btn) => {
    btn.onclick = () => updateCommentStatus(btn.getAttribute('data-id'), 'pending');
  });

  document.querySelectorAll('.delete-c-btn').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('এই মন্তব্যটি মুছে ফেলতে চান?')) {
        try {
          if (!id.startsWith('local_')) {
            await deleteDoc(doc(db, 'comments', id));
          }
          commentsList = commentsList.filter((c) => c.id !== id);
          showToast('মন্তব্য মুছে ফেলা হয়েছে।', 'success');
          renderComments();
        } catch (e) {
          showToast('মুছে ফেলা ব্যর্থ হয়েছে।', 'error');
        }
      }
    };
  });
}

async function updateCommentStatus(id, status, notify = true) {
  try {
    const comment = commentsList.find((c) => c.id === id);
    if (comment) comment.status = status;

    if (!id.startsWith('local_')) {
      await updateDoc(doc(db, 'comments', id), { status, updatedAt: new Date() });
    }

    if (notify) {
      showToast(`মন্তব্য ${status === 'approved' ? 'অনুমোদিত' : 'আপডেট'} হয়েছে!`, 'success');
      renderComments();
    }
  } catch (err) {
    showToast('স্ট্যাটাস আপডেট ব্যর্থ: ' + err.message, 'error');
  }
}
