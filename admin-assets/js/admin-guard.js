/**
 * FREELANCE BD HUB — ADMIN AUTHENTICATION GUARD
 * Enforces authenticated admin access on all admin panel pages.
 */

import { auth, onAuthStateChanged, db, doc, getDoc, setDoc } from '/assets/js/firebase-init.js';
import { PRIMARY_ADMIN_EMAIL } from '/assets/js/firebase-config.js';

export function requireAdmin() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = `/admin/index.html?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      try {
        const adminRef = doc(db, 'admins', user.uid);
        const adminDoc = await getDoc(adminRef);

        if (adminDoc.exists() && adminDoc.data().active !== false) {
          resolve({ user, admin: adminDoc.data() });
          return;
        }

        // Auto-bootstrap primary owner if logging in as irinkabir79@gmail.com
        if (user.email && user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
          console.log('[Admin Guard] Auto-bootstrapping primary owner admin doc for:', user.email);
          const ownerData = {
            email: user.email,
            role: 'owner',
            active: true,
            createdAt: new Date().toISOString()
          };
          try {
            await setDoc(adminRef, ownerData);
            resolve({ user, admin: ownerData });
            return;
          } catch (writeErr) {
            console.warn('[Admin Guard] Could not write admin doc directly (rules check), permitting owner session:', writeErr);
            resolve({ user, admin: ownerData });
            return;
          }
        }

        // Unauthorized user
        alert('অ্যাক্সেস অনুমোদিত নয়। আপনার অ্যাকাউন্টটি অ্যাডমিন হিসেবে তালিকাভুক্ত নয়। (Access denied: Not an approved admin)');
        window.location.href = '/admin/index.html';
      } catch (err) {
        console.warn('[Admin Guard] Error reading admin doc, allowing primary email fallback:', err);
        if (user.email && user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
          resolve({ user, admin: { email: user.email, role: 'owner', active: true } });
        } else {
          window.location.href = '/admin/index.html';
        }
      }
    });
  });
}
