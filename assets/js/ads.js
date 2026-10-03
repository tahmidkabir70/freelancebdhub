/**
 * FREELANCE BD HUB — MULTI-NETWORK ADS ENGINE
 * Supports MagicAds + A-ADS + Adsterra simultaneously across 9 flexible slots
 * Auto-fallback by priority + auto-collapsing container if empty/disabled
 */

import { db, collection, getDocs, doc, getDoc } from './firebase-init.js';

let cachedPlacements = null;
let cachedNetworks = null;
let cachedUnits = null;

const ADS_LOCAL_CACHE_KEY = 'fbh_ads_config_cache_v1';

function readLocalAdsCache() {
  try {
    const raw = localStorage.getItem(ADS_LOCAL_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      placements: parsed.placements || {},
      networks: parsed.networks || {},
      units: parsed.units || {}
    };
  } catch (err) {
    return null;
  }
}

function writeLocalAdsCache(config) {
  try {
    localStorage.setItem(ADS_LOCAL_CACHE_KEY, JSON.stringify({ ...config, savedAt: Date.now() }));
  } catch (err) {
    // Storage may be unavailable (private mode, quota) — safe to ignore.
  }
}

export async function fetchAdsConfig() {
  if (cachedPlacements && cachedNetworks && cachedUnits) {
    return { placements: cachedPlacements, networks: cachedNetworks, units: cachedUnits };
  }
  
  try {
    const [placSnap, netSnap, unitSnap] = await Promise.all([
      getDocs(collection(db, 'adPlacements')),
      getDocs(collection(db, 'adNetworks')),
      getDocs(collection(db, 'adUnits'))
    ]);
    
    cachedPlacements = {};
    placSnap.docs.forEach((d) => {
      cachedPlacements[d.id] = { id: d.id, ...d.data() };
    });
    
    cachedNetworks = {};
    netSnap.docs.forEach((d) => {
      cachedNetworks[d.id] = { id: d.id, ...d.data() };
    });
    
    cachedUnits = {};
    unitSnap.docs.forEach((d) => {
      cachedUnits[d.id] = { id: d.id, ...d.data() };
    });
    
    const result = { placements: cachedPlacements, networks: cachedNetworks, units: cachedUnits };
    // Keep a local fallback in sync so ads still render if Firestore reads
    // ever fail (offline, permission hiccup, etc.).
    writeLocalAdsCache(result);
    return result;
  } catch (err) {
    console.warn('[Ads Engine] Failed to fetch ad configuration from Firestore, trying local cache:', err);
    const localCache = readLocalAdsCache();
    if (localCache) {
      cachedPlacements = localCache.placements;
      cachedNetworks = localCache.networks;
      cachedUnits = localCache.units;
      return localCache;
    }
    return { placements: {}, networks: {}, units: {} };
  }
}

/**
 * Render a designated ad slot.
 * Issue #9 fix: honor placement.unitCode (custom code) and placement.network
 * BEFORE falling back to the hardcoded priority order.
 */
export async function renderAdSlot(slotId, containerEl) {
  if (!containerEl) return;
  
  const { placements, networks, units } = await fetchAdsConfig();
  const placement = placements[slotId];
  
  // If placement does not exist or is disabled → hide the slot
  if (!placement || placement.enabled === false) {
    collapseSlot(containerEl);
    return;
  }
  
  let adCode = '';
  
  // ── Step 1: custom per-slot code (highest priority) ─────────────────
  if (placement.unitCode && placement.unitCode.trim().length > 0) {
    adCode = placement.unitCode.trim();
  }
  
  // ── Step 2: the network selected for this specific slot ─────────────
  if (!adCode) {
    const chosenNetworkId = placement.network;
    const chosenNet = chosenNetworkId ? networks[chosenNetworkId] : null;
    
    if (chosenNet && chosenNet.enabled !== false) {
      // 2a: a specific unit assigned to this placement
      if (placement.unitId && units[placement.unitId] && units[placement.unitId].code) {
        adCode = units[placement.unitId].code;
      }
      
      // 2b: any enabled unit under the chosen network
      if (!adCode) {
        const matchingUnit = Object.values(units).find(
          (u) => u.network === chosenNetworkId && u.code && u.code.trim().length > 0
        );
        if (matchingUnit) adCode = matchingUnit.code;
      }
      
      // 2c: network-level default code
      if (!adCode && chosenNet.code && chosenNet.code.trim().length > 0) {
        adCode = chosenNet.code;
      }
    }
  }
  
  // ── Step 3: fallback through priority order ─────────────────────────
  if (!adCode) {
    const priorityOrder = (Array.isArray(placement.priority) && placement.priority.length > 0) ?
      placement.priority :
      ['magicads', 'a-ads', 'adsterra'];
    
    for (const netId of priorityOrder) {
      const netConfig = networks[netId];
      if (!netConfig || netConfig.enabled === false) continue;
      
      const unit = Object.values(units).find(
        (u) => u.network === netId && u.code && u.code.trim().length > 0
      );
      if (unit) {
        adCode = unit.code;
        break;
      }
      if (netConfig.code && netConfig.code.trim().length > 0) {
        adCode = netConfig.code;
        break;
      }
    }
  }
  
  // Nothing to render → collapse the slot cleanly
  if (!adCode) {
    collapseSlot(containerEl);
    return;
  }
  
  // ── Render the ad code inside an isolated iframe ────────────────────
  containerEl.classList.remove('collapsed');
  containerEl.style.display = '';
  
  const adBody = containerEl.querySelector('.fbh-ad-body') || containerEl;
  adBody.innerHTML = '';
  
  const iframe = document.createElement('iframe');
  iframe.className = 'fbh-ad-frame';
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.scrolling = 'no';
  iframe.loading = 'lazy';
  
  adBody.appendChild(iframe);
  
  try {
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
        </style>
      </head>
      <body>
        ${adCode}
      </body>
      </html>
    `);
    iframeDoc.close();
    
    // Auto-resize iframe to fit ad content
    iframe.onload = () => {
      try {
        const h = iframe.contentWindow.document.body.scrollHeight;
        if (h > 0) iframe.style.height = `${h}px`;
      } catch (e) {
        iframe.style.height = '120px';
      }
    };
  } catch (err) {
    console.warn('[Ads Engine] Failed to inject ad frame:', err);
    collapseSlot(containerEl);
  }
}

function collapseSlot(containerEl) {
  containerEl.classList.add('collapsed');
  containerEl.style.display = 'none';
}

/**
 * Scan document and render all marked ad slots
 */
export async function initAllAds() {
  const adContainers = document.querySelectorAll('[data-fbh-ad-slot]');
  if (adContainers.length === 0) return;
  
  for (const container of adContainers) {
    const slotId = container.getAttribute('data-fbh-ad-slot');
    if (slotId) {
      renderAdSlot(slotId, container);
    }
  }
}