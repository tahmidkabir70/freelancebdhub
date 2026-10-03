/**
 * FREELANCE BD HUB — ADMIN CATEGORIES CONTROLLER
 * CRUD operations for categories with modal dialogs
 */

import {
  db,
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from '/assets/js/firebase-init.js';
import { INITIAL_CATEGORIES } from '/assets/js/articles.js';
import { slugify, escapeHtml, showToast } from '/assets/js/utils.js';

let categoriesList = [];

export async function initAdminCategories() {
  await loadCategories();
  
  // New category modal trigger
  const addBtn = document.getElementById('btn-add-category');
  const modal = document.getElementById('category-modal');
  const closeBtn = document.getElementById('category-modal-close');
  const form = document.getElementById('category-form');
  
  if (addBtn && modal) {
    addBtn.onclick = () => {
      openCategoryModal();
    };
  }
  
  if (closeBtn && modal) {
    closeBtn.onclick = () => {
      modal.classList.remove('open');
    };
  }
  
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      await saveCategory();
    };
  }
  
  // Name to slug auto-fill
  const nameInput = document.getElementById('cat-name');
  const slugInput = document.getElementById('cat-slug');
  if (nameInput && slugInput) {
    nameInput.addEventListener('input', () => {
      if (!slugInput.dataset.manual) {
        slugInput.value = slugify(nameInput.value);
      }
    });
    slugInput.addEventListener('input', () => {
      slugInput.dataset.manual = 'true';
    });
  }
}

async function loadCategories() {
  const container = document.getElementById('categories-tbody');
  if (container) {
    container.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">ক্যাটাগরি লোড হচ্ছে...</td></tr>';
  }
  
  try {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    categoriesList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[Admin Categories] Firestore fetch failed, using default categories:', err);
    categoriesList = [...INITIAL_CATEGORIES];
  }
  
  renderCategoriesTable();
}

function renderCategoriesTable() {
  const tbody = document.getElementById('categories-tbody');
  if (!tbody) return;
  
  if (categoriesList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">কোনো ক্যাটাগরি নেই।</td></tr>';
    return;
  }
  
  tbody.innerHTML = categoriesList.map((cat, idx) => `
    <tr>
      <td style="font-weight:700; width:40px;">${cat.order || idx + 1}</td>
      <td>
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span style="font-size:1.4rem;">${cat.icon || '📁'}</span>
          <div>
            <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(cat.name)}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(cat.description || '')}</div>
          </div>
        </div>
      </td>
      <td><code>/${cat.slug}</code></td>
      <td><span class="badge badge-primary">${cat.articleCount || 0} টি আর্টিকেল</span></td>
      <td style="text-align:right;">
        <button class="btn btn-secondary btn-sm edit-cat-btn" data-id="${cat.id}">✏️ এডিট</button>
        <button class="btn btn-secondary btn-sm delete-cat-btn" data-id="${cat.id}" style="color:#ef4444;">🗑️</button>
      </td>
    </tr>
  `).join('');
  
  // Bind actions
  document.querySelectorAll('.edit-cat-btn').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const cat = categoriesList.find((c) => c.id === id);
      if (cat) openCategoryModal(cat);
    };
  });
  
  document.querySelectorAll('.delete-cat-btn').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('আপনি কি নিশ্চিত যে এই ক্যাটাগরিটি মুছে ফেলতে চান?')) {
        await deleteCategory(id);
      }
    };
  });
}

function openCategoryModal(cat = null) {
  const modal = document.getElementById('category-modal');
  const title = document.getElementById('category-modal-title');
  const idInput = document.getElementById('cat-id');
  const nameInput = document.getElementById('cat-name');
  const slugInput = document.getElementById('cat-slug');
  const iconInput = document.getElementById('cat-icon');
  const descInput = document.getElementById('cat-desc');
  const orderInput = document.getElementById('cat-order');
  
  if (cat) {
    title.textContent = 'ক্যাটাগরি সম্পাদনা করুন (Edit Category)';
    idInput.value = cat.id;
    nameInput.value = cat.name || '';
    slugInput.value = cat.slug || '';
    iconInput.value = cat.icon || '📁';
    descInput.value = cat.description || '';
    orderInput.value = cat.order || 1;
    slugInput.dataset.manual = 'true';
  } else {
    title.textContent = 'নতুন ক্যাটাগরি তৈরি করুন (New Category)';
    idInput.value = '';
    nameInput.value = '';
    slugInput.value = '';
    iconInput.value = '📁';
    descInput.value = '';
    orderInput.value = categoriesList.length + 1;
    delete slugInput.dataset.manual;
  }
  
  modal.classList.add('open');
}

async function saveCategory() {
  const id = document.getElementById('cat-id').value.trim();
  const name = document.getElementById('cat-name').value.trim();
  const slug = document.getElementById('cat-slug').value.trim() || slugify(name);
  const icon = document.getElementById('cat-icon').value.trim() || '📁';
  const description = document.getElementById('cat-desc').value.trim();
  const order = parseInt(document.getElementById('cat-order').value) || 1;
  
  if (!name || !slug) {
    showToast('নাম এবং স্লাগ আবশ্যক।', 'error');
    return;
  }
  
  const payload = {
    name,
    slug,
    icon,
    description,
    order,
    updatedAt: new Date()
  };
  
  try {
    if (id) {
      await updateDoc(doc(db, 'categories', id), payload);
      const idx = categoriesList.findIndex((c) => c.id === id);
      if (idx !== -1) categoriesList[idx] = { ...categoriesList[idx], ...payload };
    } else {
      payload.createdAt = new Date();
      payload.articleCount = 0;
      const ref = await addDoc(collection(db, 'categories'), payload);
      categoriesList.push({ id: ref.id, ...payload });
    }
    
    // Invalidate cache
    sessionStorage.removeItem('fbh_categories');
    
    document.getElementById('category-modal').classList.remove('open');
    showToast('ক্যাটাগরি সংরক্ষিত হয়েছে!', 'success');
    renderCategoriesTable();
  } catch (err) {
    showToast('ক্যাটাগরি সংরক্ষণ ব্যর্থ হয়েছে: ' + err.message, 'error');
  }
}

async function deleteCategory(id) {
  try {
    await deleteDoc(doc(db, 'categories', id));
    categoriesList = categoriesList.filter((c) => c.id !== id);
    sessionStorage.removeItem('fbh_categories');
    showToast('ক্যাটাগরি মুছে ফেলা হয়েছে।', 'success');
    renderCategoriesTable();
  } catch (err) {
    showToast('মুছে ফেলা ব্যর্থ হয়েছে: ' + err.message, 'error');
  }
}