/**
 * FREELANCE BD HUB — ADMIN ADS MANAGEMENT CONTROLLER
 * Manages 3 Ad Networks (MagicAds, A-ADS, Adsterra), 9 placement slots & priority fallbacks
 */

import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc
} from '/assets/js/firebase-init.js';
import { fetchAdsConfig } from '/assets/js/ads.js';
import { showToast, escapeHtml } from '/assets/js/utils.js';

const SLOTS_LIST = [
  { id: 'home_top', name: 'Home — Top Banner', desc: 'হোমপেইজের হিরো সেকশনের ঠিক নিচে' },
  { id: 'home_middle', name: 'Home — Middle Banner', desc: 'ক্যাটাগরি এবং সর্বশেষ আর্টিকেলের মাঝে' },
  { id: 'home_bottom', name: 'Home — Bottom Banner', desc: 'হোমপেইজের ফুটারের ঠিক উপরে' },
  { id: 'article_top', name: 'Article — Top Slot', desc: 'আর্টিকেল টাইটেল এবং মূল কনটেন্টের মাঝে' },
  { id: 'article_middle', name: 'Article — Middle Content', desc: 'আর্টিকেলের বডি প্যারাগ্রাফের ঠিক মাঝে' },
  { id: 'article_bottom', name: 'Article — Bottom Slot', desc: 'কমেন্ট সেকশন ও সম্পর্কিত আর্টিকেলের মাঝে' },
  { id: 'sidebar', name: 'Sidebar / Category Banner', desc: 'ক্যাটাগরি পেইজ ও সাইডবার সেকশনে' },
  { id: 'between_related', name: 'Between Related Articles', desc: 'সম্পর্কিত আর্টিকেলের কার্ডগুলোর মাঝে' },
  { id: 'sticky_mobile', name: 'Sticky Mobile Footer Banner', desc: 'মোবাইল স্ক্রিনের একদম নিচে ফিক্সড ব্যানার' }
];

let state = {
  networks: {
    magicads: { enabled: true, name: 'MagicAds', code: '' },
    'a-ads': { enabled: true, name: 'A-ADS (Anonymous Ads)', code: '' },
    adsterra: { enabled: true, name: 'Adsterra', code: '' }
  },
  placements: {},
  fallbackOrder: ['magicads', 'a-ads', 'adsterra']
};

export async function initAdminAds() {
  try {
    await loadAdsData();
  } catch (err) {
    console.warn('[Admin Ads] Could not load remote ad config, using defaults:', err);
  }

  renderNetworksSection();
  renderPlacementsSection();
  renderFallbackOrder();

  const saveBtn = document.getElementById('btn-save-ads');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      await saveAllAdsConfig();
    };
  }
}

async function loadAdsData() {
  const config = await fetchAdsConfig();

  // Populate networks
  ['magicads', 'a-ads', 'adsterra'].forEach((netId) => {
    if (config.networks[netId]) {
      state.networks[netId] = { ...state.networks[netId], ...config.networks[netId] };
    }
  });

  // Populate placements
  SLOTS_LIST.forEach((s) => {
    state.placements[s.id] = config.placements[s.id] || {
      enabled: true,
      network: 'magicads',
      unitCode: ''
    };
  });
}

function renderNetworksSection() {
  const container = document.getElementById('networks-container');
  if (!container) return;

  const networks = [
    { id: 'magicads', name: 'MagicAds', info: 'CPA/CPM crypto & web ad network' },
    { id: 'a-ads', name: 'A-ADS (Anonymous Ads)', info: 'Privacy-focused banner network' },
    { id: 'adsterra', name: 'Adsterra', info: 'High-performing global ad network' }
  ];

  container.innerHTML = networks.map((net) => {
    const data = state.networks[net.id] || { enabled: true, code: '' };
    return `
      <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:1.5rem; margin-bottom:1.25rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
          <div>
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-primary);">${net.name}</h3>
            <span style="font-size:0.8rem; color:var(--text-muted);">${net.info}</span>
          </div>
          <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; font-weight:600; font-size:0.9rem;">
            <span>স্ট্যাটাস:</span>
            <input type="checkbox" class="net-enable-toggle" data-net="${net.id}" ${data.enabled ? 'checked' : ''} style="width:20px;height:20px;" />
            <span style="color:${data.enabled ? '#10b981' : '#ef4444'}">${data.enabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Off)'}</span>
          </label>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-size:0.85rem;">ডিফল্ট অ্যাড ইউনিট স্ক্রিপ্ট / কোড (Ad Script or HTML Embed):</label>
          <textarea class="form-textarea net-code-input" data-net="${net.id}" rows="3" placeholder="<script ...> অথবা <iframe> কোড এখানে পেস্ট করুন..." style="font-family:var(--font-mono); font-size:0.85rem;">${escapeHtml(data.code || '')}</textarea>
        </div>
      </div>
    `;
  }).join('');

  // Bind change listeners
  document.querySelectorAll('.net-enable-toggle').forEach((cb) => {
    cb.onchange = (e) => {
      const netId = cb.getAttribute('data-net');
      state.networks[netId].enabled = e.target.checked;
      renderNetworksSection();
    };
  });

  document.querySelectorAll('.net-code-input').forEach((ta) => {
    ta.oninput = (e) => {
      const netId = ta.getAttribute('data-net');
      state.networks[netId].code = e.target.value;
    };
  });
}

function renderPlacementsSection() {
  const container = document.getElementById('placements-container');
  if (!container) return;

  container.innerHTML = SLOTS_LIST.map((slot) => {
    const data = state.placements[slot.id] || { enabled: true, network: 'magicads', unitCode: '' };
    return `
      <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:1.25rem; margin-bottom:1rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:0.75rem;">
          <div>
            <div style="font-weight:700; font-size:1.05rem; color:var(--text-primary);">${slot.name}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">${slot.desc} (Slot ID: <code>${slot.id}</code>)</div>
          </div>
          <div style="display:flex; align-items:center; gap:1rem;">
            <select class="form-select slot-network-select" data-slot="${slot.id}" style="width:160px; padding:0.4rem 0.6rem; font-size:0.85rem;">
              <option value="magicads" ${data.network === 'magicads' ? 'selected' : ''}>MagicAds</option>
              <option value="a-ads" ${data.network === 'a-ads' ? 'selected' : ''}>A-ADS</option>
              <option value="adsterra" ${data.network === 'adsterra' ? 'selected' : ''}>Adsterra</option>
            </select>
            <label style="display:flex; align-items:center; gap:0.4rem; cursor:pointer; font-size:0.85rem; font-weight:600;">
              <input type="checkbox" class="slot-enable-toggle" data-slot="${slot.id}" ${data.enabled ? 'checked' : ''} />
              <span>অন/অফ</span>
            </label>
          </div>
        </div>

        <div class="form-group" style="margin-top:0.5rem;">
          <input type="text" class="form-input slot-custom-code" data-slot="${slot.id}" placeholder="কাস্টম কোড (ঐচ্ছিক - খালি রাখলে ডিফল্ট নেটওয়ার্ক কোড ব্যবহৃত হবে)..." value="${escapeHtml(data.unitCode || '')}" style="font-size:0.85rem; font-family:var(--font-mono);" />
        </div>
      </div>
    `;
  }).join('');

  // Listeners
  document.querySelectorAll('.slot-enable-toggle').forEach((cb) => {
    cb.onchange = (e) => {
      const slotId = cb.getAttribute('data-slot');
      state.placements[slotId].enabled = e.target.checked;
    };
  });

  document.querySelectorAll('.slot-network-select').forEach((sel) => {
    sel.onchange = (e) => {
      const slotId = sel.getAttribute('data-slot');
      state.placements[slotId].network = e.target.value;
    };
  });

  document.querySelectorAll('.slot-custom-code').forEach((inp) => {
    inp.oninput = (e) => {
      const slotId = inp.getAttribute('data-slot');
      state.placements[slotId].unitCode = e.target.value;
    };
  });
}

function renderFallbackOrder() {
  const container = document.getElementById('fallback-order-container');
  if (!container) return;

  container.innerHTML = `
    <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:1.25rem;">
      <h4 style="font-weight:700; margin-bottom:0.75rem; color:var(--text-primary);">অ্যাড ফলব্যাক অগ্রাধিকার (Fallback Hierarchy)</h4>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
        যদি নির্ধারিত প্রাথমিক নেটওয়ার্ক নিষ্ক্রিয় থাকে বা বিজ্ঞাপন খালি থাকে, তবে স্বয়ংক্রিয়ভাবে নিচের ক্রমানুসারে পরবর্তী নেটওয়ার্ক চেষ্টা করা হবে:
      </p>
      <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
        <span class="badge badge-primary">১ম: MagicAds</span>
        <span>➔</span>
        <span class="badge badge-emerald">২য়: A-ADS</span>
        <span>➔</span>
        <span class="badge badge-amber">৩য়: Adsterra</span>
        <span>➔</span>
        <span style="font-size:0.8rem; color:var(--text-muted);">(সব ব্যর্থ হলে বক্সটি অটোকলাপ্স হবে)</span>
      </div>
    </div>
  `;
}

const ADS_LOCAL_CACHE_KEY = 'fbh_ads_config_cache_v1';

// Always keep a local mirror of the last-known-good config so the public
// site (and this admin screen) keeps working even if the Firestore write
// below fails for some reason (offline, rules misconfigured, etc.).
function saveAdsConfigToLocalCache() {
  try {
    const placements = {};
    Object.entries(state.placements).forEach(([slotId, slotData]) => {
      placements[slotId] = {
        id: slotId,
        enabled: slotData.enabled !== false,
        network: slotData.network || 'magicads',
        unitId: `unit_${slotData.network}`,
        unitCode: slotData.unitCode || '',
        priority: ['magicads', 'a-ads', 'adsterra']
      };
    });

    const networks = {};
    const units = {};
    Object.entries(state.networks).forEach(([netId, netData]) => {
      networks[netId] = {
        id: netId,
        enabled: netData.enabled !== false,
        name: netData.name,
        code: netData.code || ''
      };
      if (netData.code) {
        units[`unit_${netId}`] = {
          id: `unit_${netId}`,
          network: netId,
          name: `${netData.name} Main Unit`,
          code: netData.code
        };
      }
    });

    localStorage.setItem(ADS_LOCAL_CACHE_KEY, JSON.stringify({ placements, networks, units, savedAt: Date.now() }));
  } catch (err) {
    console.warn('[Ads Local Cache] Could not write local fallback cache:', err);
  }
}

async function saveAllAdsConfig() {
  const btn = document.getElementById('btn-save-ads');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'সংরক্ষণ হচ্ছে...';
  }

  // Write the local fallback first so an ad code is never lost even if the
  // Firestore write below throws (e.g. "Missing or insufficient permissions").
  saveAdsConfigToLocalCache();

  try {
    // 1. Save Networks
    for (const [netId, netData] of Object.entries(state.networks)) {
      await setDoc(doc(db, 'adNetworks', netId), {
        enabled: netData.enabled !== false,
        name: netData.name,
        code: netData.code || '',
        updatedAt: new Date()
      }, { merge: true });

      // Save a corresponding adUnit
      if (netData.code) {
        await setDoc(doc(db, 'adUnits', `unit_${netId}`), {
          network: netId,
          name: `${netData.name} Main Unit`,
          code: netData.code,
          createdAt: new Date()
        }, { merge: true });
      }
    }

    // 2. Save Placements
    for (const [slotId, slotData] of Object.entries(state.placements)) {
      await setDoc(doc(db, 'adPlacements', slotId), {
        enabled: slotData.enabled !== false,
        network: slotData.network || 'magicads',
        unitId: `unit_${slotData.network}`,
        unitCode: slotData.unitCode || '',
        priority: ['magicads', 'a-ads', 'adsterra'],
        updatedAt: new Date()
      }, { merge: true });
    }

    showToast('বিজ্ঞাপন কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
  } catch (err) {
    console.error('[Ads Save Error]:', err);
    showToast('ডেটাবেজে সেভ ব্যর্থ হয়েছে, লোকাল ক্যাশে সংরক্ষিত আছে (এই ব্রাউজারে চলবে): ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'পরিবর্তন সংরক্ষণ করুন (Save Changes)';
    }
  }
}
