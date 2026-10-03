/**
 * FREELANCE BD HUB — GLOBAL APP CONTROLLER
 * Header, mobile drawer, search overlay, theme, newsletter, and ads bootstrap
 */

import { initTheme, showToast } from './utils.js';
import { initI18n } from './i18n.js';
import { initAllAds } from './ads.js';
import { auth, onAuthStateChanged, db, collection, addDoc, serverTimestamp } from './firebase-init.js';

export function initApp() {
  // 1. Initialize Theme (Light/Dark)
  initTheme();
  
  // 2. Initialize Language Switcher (Bangla / English)
  initI18n();
  
  // 3. Initialize Navigation & Drawers
  initNavigation();
  
  // 4. Initialize Search Modal Overlay
  initSearchOverlay();
  
  // 5. Initialize Newsletter Forms
  initNewsletter();
  
  // 6. Initialize Ads across the page
  initAllAds();
  
  // 7. Check Auth State for Admin Badge in header
  checkAuthState();
}

function initNavigation() {
  const mobileToggle = document.querySelector('.mobile-menu-btn');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close-btn');
  
  const openDrawer = () => {
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  
  const closeDrawer = () => {
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };
  
  if (mobileToggle) mobileToggle.onclick = openDrawer;
  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (overlay) overlay.onclick = closeDrawer;
  
  // Active link highlighter
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link, .drawer-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (href !== '/' && currentPath.endsWith(href)))) {
      link.classList.add('active');
    }
  });
}

function initSearchOverlay() {
  const searchToggle = document.querySelector('.search-toggle-btn');
  const modal = document.querySelector('.search-modal');
  const closeBtn = document.querySelector('.search-modal-close');
  const searchInput = document.querySelector('.search-modal-input');
  
  const openSearch = () => {
    if (modal) modal.classList.add('open');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
    document.body.style.overflow = 'hidden';
  };
  
  const closeSearch = () => {
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  };
  
  if (searchToggle) searchToggle.onclick = openSearch;
  if (closeBtn) closeBtn.onclick = closeSearch;
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeSearch();
    };
  }
  
  // Handle enter key in search modal input -> redirect to search.html?q=...
  if (searchInput) {
    searchInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const val = searchInput.value.trim();
        if (val) {
          window.location.href = `/search.html?q=${encodeURIComponent(val)}`;
        }
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    };
  }
}

function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach((form) => {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      const email = input ? input.value.trim() : '';
      
      if (!email || !email.includes('@')) {
        showToast('সঠিক ইমেইল ঠিকানা প্রদান করুন (Enter a valid email).', 'error');
        return;
      }
      
      try {
        const btn = form.querySelector('button');
        if (btn) btn.disabled = true;
        
        // Critical #4: write to dedicated newsletter collection (not settings)
        await addDoc(collection(db, 'newsletter'), {
          email: email.slice(0, 200).toLowerCase(),
          createdAt: serverTimestamp(),
          source: 'website'
        });
        
        showToast('ধন্যবাদ! নিউজলেটারে সফলভাবে সাবস্ক্রাইব করা হয়েছে।', 'success');
        if (input) input.value = '';
      } catch (err) {
        console.error('[Newsletter] Submit failed:', err);
        showToast('নিউজলেটার সাইন-আপ সম্পন্ন করা যায়নি।', 'error');
      } finally {
        const btn = form.querySelector('button');
        if (btn) btn.disabled = false;
      }
    };
  });
}

function checkAuthState() {
  try {
    onAuthStateChanged(auth, async (user) => {
      const adminLinks = document.querySelectorAll('.admin-nav-item');
      if (user) {
        adminLinks.forEach((el) => {
          el.style.display = 'inline-flex';
        });
      } else {
        adminLinks.forEach((el) => {
          el.style.display = 'none';
        });
      }
    });
  } catch (e) {}
}

// Auto-run if script is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}