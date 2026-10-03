/**
 * FREELANCE BD HUB — ADMIN SITE SETTINGS & SAMPLE DATA SEEDER
 * Manages site metadata, comments/newsletter toggles, sample data seeding,
 * and Critical #4 contact messages + newsletter subscriber lists.
 */

import {
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  limit
} from '/assets/js/firebase-init.js';
import { INITIAL_CATEGORIES, SAMPLE_ARTICLES } from '/assets/js/articles.js';
import { showToast, escapeHtml } from '/assets/js/utils.js';

export async function initAdminSettings() {
  await loadSiteSettings();
  await loadContactMessages();
  await loadNewsletterSubscribers();
  
  const form = document.getElementById('settings-form');
  const seedBtn = document.getElementById('btn-seed-samples');
  const deleteSamplesBtn = document.getElementById('btn-delete-samples');
  
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      await saveSiteSettings();
    };
  }
  
  // Seed Sample Data (Section 16)
  if (seedBtn) {
    seedBtn.onclick = async () => {
      if (!confirm('আপনি কি ৯টি ক্যাটাগরি এবং ৩টি নমুনা আর্টিকেল ডেটাবেসে সিড করতে চান?')) return;
      await seedSampleData();
    };
  }
  
  // Delete Sample Data (Section 16)
  if (deleteSamplesBtn) {
    deleteSamplesBtn.onclick = async () => {
      if (!confirm('আপনি কি নিশ্চিত যে সকল নমুনা কনটেন্ট মুছে ফেলতে চান?')) return;
      await deleteSampleData();
    };
  }
}

async function loadSiteSettings() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'fbh_site'));
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById('setting-site-name').value = data.siteName || 'Freelance BD Hub';
      document.getElementById('setting-logo-url').value = data.logoUrl || '/assets/images/logo.svg';
      document.getElementById('setting-description').value = data.description || 'Learn. Build. Freelance.';
      document.getElementById('setting-footer-text').value = data.footerText || '© 2026 Freelance BD Hub. সর্বস্বত্ব সংরক্ষিত।';
      
      if (data.social) {
        document.getElementById('social-facebook').value = data.social.facebook || '';
        document.getElementById('social-whatsapp').value = data.social.whatsapp || '';
        document.getElementById('social-github').value = data.social.github || '';
      }
      
      document.getElementById('toggle-comments').checked = data.commentsEnabled !== false;
      document.getElementById('toggle-newsletter').checked = data.newsletterEnabled !== false;
    }
  } catch (e) {
    console.warn('[Admin Settings] Load fallback:', e);
  }
}

async function saveSiteSettings() {
  const siteName = document.getElementById('setting-site-name').value.trim();
  const logoUrl = document.getElementById('setting-logo-url').value.trim();
  const description = document.getElementById('setting-description').value.trim();
  const footerText = document.getElementById('setting-footer-text').value.trim();
  
  const social = {
    facebook: document.getElementById('social-facebook').value.trim(),
    whatsapp: document.getElementById('social-whatsapp').value.trim(),
    github: document.getElementById('social-github').value.trim()
  };
  
  const commentsEnabled = document.getElementById('toggle-comments').checked;
  const newsletterEnabled = document.getElementById('toggle-newsletter').checked;
  
  try {
    await setDoc(doc(db, 'settings', 'fbh_site'), {
      siteName,
      logoUrl,
      description,
      footerText,
      social,
      commentsEnabled,
      newsletterEnabled,
      updatedAt: new Date()
    }, { merge: true });
    
    showToast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', 'success');
  } catch (err) {
    showToast('সেটিংস সংরক্ষণ ব্যর্থ: ' + err.message, 'error');
  }
}

/** Critical #4: load contact messages for admin view */
async function loadContactMessages() {
  const tbody = document.getElementById('contact-messages-tbody');
  if (!tbody) return;
  
  try {
    const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-muted);">এখনো কোনো বার্তা নেই।</td></tr>';
      return;
    }
    
    tbody.innerHTML = snap.docs.map((d) => {
      const m = d.data();
      const dateStr = m.createdAt?.toDate ?
        m.createdAt.toDate().toLocaleString('bn-BD') :
        (m.createdAt || '—');
      return `
        <tr>
          <td>${escapeHtml(m.name || '—')}</td>
          <td><a href="mailto:${escapeHtml(m.email || '')}">${escapeHtml(m.email || '—')}</a></td>
          <td>${escapeHtml(m.subject || '—')}</td>
          <td style="max-width:280px; white-space:pre-wrap; word-break:break-word;">${escapeHtml(m.message || '—')}</td>
          <td style="white-space:nowrap; font-size:0.85rem;">${dateStr}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.warn('[Admin] Contact messages load failed:', err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:#ef4444;">লোড করা যায়নি।</td></tr>';
  }
}

/** Critical #4: load newsletter subscribers for admin view */
async function loadNewsletterSubscribers() {
  const tbody = document.getElementById('newsletter-tbody');
  if (!tbody) return;
  
  try {
    const q = query(collection(db, 'newsletter'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:1.5rem; color:var(--text-muted);">এখনো কোনো সাবস্ক্রাইবার নেই।</td></tr>';
      return;
    }
    
    tbody.innerHTML = snap.docs.map((d) => {
      const s = d.data();
      const dateStr = s.createdAt?.toDate ?
        s.createdAt.toDate().toLocaleString('bn-BD') :
        (s.createdAt || '—');
      return `
        <tr>
          <td>${escapeHtml(s.email || '—')}</td>
          <td style="white-space:nowrap; font-size:0.85rem;">${dateStr}</td>
          <td>${escapeHtml(s.source || 'website')}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.warn('[Admin] Newsletter load failed:', err);
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:1.5rem; color:#ef4444;">লোড করা যায়নি।</td></tr>';
  }
}

export async function seedSampleData() {
  showToast('নমুনা ডেটা সিডিং শুরু হয়েছে...', 'info');
  
  try {
    // 1. Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), {
        ...cat,
        articleCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
    }
    
    // 2. Seed Articles (marked isSample: true)
    for (const art of SAMPLE_ARTICLES) {
      await setDoc(doc(db, 'articles', art.id), {
        ...art,
        isSample: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
    }
    
    // Invalidate categories cache
    sessionStorage.removeItem('fbh_categories');
    
    showToast('৯টি ক্যাটাগরি ও ৩টি নমুনা আর্টিকেল সফলভাবে সিড করা হয়েছে!', 'success');
  } catch (err) {
    console.error('[Seed Error]:', err);
    showToast('সিডিং ব্যর্থ হয়েছে: ' + err.message, 'error');
  }
}

export async function deleteSampleData() {
  showToast('নমুনা কনটেন্ট মোছা হচ্ছে...', 'info');
  
  try {
    // Delete sample articles
    for (const art of SAMPLE_ARTICLES) {
      await deleteDoc(doc(db, 'articles', art.id)).catch(() => {});
    }
    
    sessionStorage.removeItem('fbh_categories');
    showToast('সকল নমুনা কনটেন্ট সফলভাবে মুছে ফেলা হয়েছে।', 'success');
  } catch (err) {
    showToast('মুছে ফেলা ব্যর্থ: ' + err.message, 'error');
  }
}