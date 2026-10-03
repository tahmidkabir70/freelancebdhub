/**
 * FREELANCE BD HUB — ADMIN USERS & ROLE MANAGEMENT
 * Enables Owner (irinkabir79@gmail.com) to grant and manage admin permissions
 */

import {
  db,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from '/assets/js/firebase-init.js';
import { showToast, escapeHtml, formatDate } from '/assets/js/utils.js';

export async function initAdminUsers() {
  await loadAdminsList();

  const form = document.getElementById('add-admin-form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const uid = document.getElementById('new-admin-uid').value.trim();
      const email = document.getElementById('new-admin-email').value.trim();
      const role = document.getElementById('new-admin-role').value;

      if (!uid || !email) {
        showToast('UID এবং ইমেইল আবশ্যক।', 'error');
        return;
      }

      try {
        await setDoc(doc(db, 'admins', uid), {
          email,
          role,
          active: true,
          createdAt: new Date().toISOString()
        });

        showToast('নতুন অ্যাডমিন সফলভাবে যুক্ত হয়েছে!', 'success');
        form.reset();
        await loadAdminsList();
      } catch (err) {
        showToast('অ্যাডমিন তৈরি ব্যর্থ: ' + err.message, 'error');
      }
    };
  }
}

async function loadAdminsList() {
  const container = document.getElementById('admins-tbody');
  if (!container) return;

  try {
    const snap = await getDocs(collection(db, 'admins'));
    if (!snap.empty) {
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      container.innerHTML = list.map((a) => `
        <tr>
          <td><code>${a.uid}</code></td>
          <td style="font-weight:600;">${escapeHtml(a.email)}</td>
          <td><span class="badge ${a.role === 'owner' ? 'badge-primary' : 'badge-emerald'}">${a.role || 'editor'}</span></td>
          <td><span style="color:#10b981; font-weight:700;">সক্রিয় (Active)</span></td>
          <td style="text-align:right;">
            ${a.role !== 'owner' ? `
              <button class="btn btn-secondary btn-sm delete-admin-btn" data-uid="${a.uid}" style="color:#ef4444;">বাতিল</button>
            ` : '<span style="font-size:0.8rem; color:var(--text-muted);">মালিক (Primary)</span>'}
          </td>
        </tr>
      `).join('');

      document.querySelectorAll('.delete-admin-btn').forEach((btn) => {
        btn.onclick = async () => {
          const uid = btn.getAttribute('data-uid');
          if (confirm('এই ব্যবহারকারীর অ্যাডমিন অধিকার বাতিল করতে চান?')) {
            await deleteDoc(doc(db, 'admins', uid));
            showToast('অ্যাডমিন অ্যাক্সেস বাতিল করা হয়েছে।', 'success');
            await loadAdminsList();
          }
        };
      });
    }
  } catch (e) {
    console.warn('[Admin Users] Fallback:', e);
  }
}
