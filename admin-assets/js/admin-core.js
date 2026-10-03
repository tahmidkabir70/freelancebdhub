/**
 * FREELANCE BD HUB — ADMIN CORE LAYOUT CONTROLLER
 * Theme, i18n, logout, active tab highlight, mobile sidebar toggle.
 * Auto-injects the mobile hamburger button on any admin page that lacks one.
 */

import { auth, signOut } from '/assets/js/firebase-init.js';
import { initTheme, showToast } from '/assets/js/utils.js';
import { initI18n } from '/assets/js/i18n.js';

export function setupAdminLayout(activeTabId = '') {
  initTheme();
  initI18n();
  
  // Auto-inject hamburger toggle on pages that don't already have one.
  ensureSidebarToggle();
  
  // Inject responsive topbar CSS once per page.
  injectTopbarResponsiveCSS();
  
  // Highlight active link in sidebar and bottom navigation
  document.querySelectorAll('.admin-nav-item a, .admin-bottom-tab').forEach((el) => {
    const tab = el.getAttribute('data-tab');
    if (tab === activeTabId) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  
  // Logout button binding
  document.querySelectorAll('.admin-logout-btn').forEach((btn) => {
    btn.onclick = async () => {
      if (confirm('আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান? (Are you sure you want to sign out?)')) {
        try {
          await signOut(auth);
          window.location.href = '/admin/index.html';
        } catch (e) {
          showToast('লগআউট ব্যর্থ হয়েছে।', 'error');
        }
      }
    };
  });
  
  // Mobile sidebar open/close
  initMobileSidebar();
}

/**
 * Ensure a hamburger toggle button exists in the admin topbar.
 * Idempotent — does nothing if the page already defines one.
 */
function ensureSidebarToggle() {
  if (document.getElementById('admin-sidebar-toggle')) return;
  
  const topbar = document.querySelector('.admin-topbar');
  if (!topbar) return;
  
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'admin-sidebar-toggle';
  btn.className = 'admin-sidebar-toggle';
  btn.setAttribute('aria-label', 'মেনু খুলুন');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>`;
  
  const firstChild = topbar.firstElementChild;
  
  if (firstChild && firstChild.tagName === 'DIV') {
    firstChild.insertBefore(btn, firstChild.firstChild);
    if (!firstChild.style.display) {
      firstChild.style.display = 'flex';
      firstChild.style.alignItems = 'center';
      firstChild.style.gap = '0.5rem';
    }
  } else {
    topbar.insertBefore(btn, topbar.firstChild);
    btn.style.marginRight = '0.5rem';
  }
}

/**
 * Inject a tiny CSS block (once) that keeps the admin topbar tidy on small
 * screens so the hamburger, live-site link and theme toggle don't crowd.
 */
function injectTopbarResponsiveCSS() {
  if (document.getElementById('fbh-admin-topbar-css')) return;
  
  const style = document.createElement('style');
  style.id = 'fbh-admin-topbar-css';
  style.textContent = `
    @media (max-width: 640px) {
      /* Hide the account badge (avatar + email) — frees horizontal space */
      .admin-topbar .admin-user-badge { display: none !important; }

      /* Compact the "View live site" link into just an icon */
      .admin-topbar a[href="/"][target="_blank"] {
        font-size: 0 !important;
        padding: 0.45rem 0.6rem !important;
        line-height: 1;
      }
      .admin-topbar a[href="/"][target="_blank"]::before {
        content: '🌐';
        font-size: 1.05rem;
        margin-right: 0.15rem;
      }
      .admin-topbar a[href="/"][target="_blank"]::after {
        content: '↗';
        font-size: 0.9rem;
      }

      /* Make sure the topbar never overflows horizontally */
      .admin-topbar { overflow-x: hidden; }
      .admin-topbar > div { min-width: 0; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Wire up hamburger + overlay for off-canvas sidebar on ≤1024px.
 */
function initMobileSidebar() {
  const sidebar = document.getElementById('admin-sidebar') || document.querySelector('.admin-sidebar');
  if (!sidebar) return;
  
  if (!sidebar.id) sidebar.id = 'admin-sidebar';
  
  let ov = document.getElementById('admin-sidebar-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'admin-sidebar-overlay';
    ov.id = 'admin-sidebar-overlay';
    ov.setAttribute('aria-hidden', 'true');
    const layout = document.querySelector('.admin-layout');
    if (layout) layout.prepend(ov);
  }
  
  const toggleBtn = document.getElementById('admin-sidebar-toggle');
  
  function openSidebar() {
    sidebar.classList.add('open');
    ov.classList.add('open');
    ov.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  
  function closeSidebar() {
    sidebar.classList.remove('open');
    ov.classList.remove('open');
    ov.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    });
  }
  
  ov.addEventListener('click', closeSidebar);
  
  sidebar.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 1024) closeSidebar();
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
  });
}