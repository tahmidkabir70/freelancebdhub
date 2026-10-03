/**
 * FREELANCE BD HUB — ADMIN LOGIN CONTROLLER
 * Handles Firebase Auth authentication with bilingual error explanations
 */

import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  getDoc
} from '/assets/js/firebase-init.js';
import { PRIMARY_ADMIN_EMAIL } from '/assets/js/firebase-config.js';
import { showToast } from '/assets/js/utils.js';

export function initAdminLogin() {
  const form = document.getElementById('admin-login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const togglePassBtn = document.getElementById('toggle-password-btn');
  const errorAlert = document.getElementById('login-error-alert');
  const submitBtn = document.getElementById('login-submit-btn');

  // Check if already signed in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || '/admin/dashboard.html';
      window.location.href = redirectUrl;
    }
  });

  // Pre-fill primary admin email as convenience
  if (emailInput && !emailInput.value) {
    emailInput.value = PRIMARY_ADMIN_EMAIL;
  }

  // Toggle password visibility
  if (togglePassBtn && passwordInput) {
    togglePassBtn.onclick = () => {
      const isPass = passwordInput.type === 'password';
      passwordInput.type = isPass ? 'text' : 'password';
      togglePassBtn.textContent = isPass ? '🙈' : '👁️';
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showError('ইমেইল ও পাসওয়ার্ড প্রদান করুন (Please enter email and password).');
        return;
      }

      hideError();
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'লগইন হচ্ছে... (Signing in...)';

      try {
        let userCred;
        try {
          userCred = await signInWithEmailAndPassword(auth, email, password);
        } catch (signInErr) {
          // If primary admin and user not found, help user bootstrap seamlessly
          if (
            email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() &&
            (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')
          ) {
            try {
              console.log('[Login] Attempting primary admin bootstrap registration...');
              userCred = await createUserWithEmailAndPassword(auth, email, password);
              // Write owner doc
              try {
                await setDoc(doc(db, 'admins', userCred.user.uid), {
                  email: userCred.user.email,
                  role: 'owner',
                  active: true,
                  createdAt: new Date().toISOString()
                });
              } catch (docErr) {}
            } catch (createErr) {
              throw signInErr;
            }
          } else {
            throw signInErr;
          }
        }

        showToast('সফলভাবে লগইন হয়েছে! রিডাইরেক্ট করা হচ্ছে...', 'success');
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get('redirect') || '/admin/dashboard.html';
          window.location.href = redirectUrl;
        }, 500);
      } catch (err) {
        console.error('[Admin Login Error]:', err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'লগইন করুন (Sign In)';

        let msg = 'লগইন সম্পন্ন করা যায়নি। অনুগ্রহ করে আপনার তথ্য পরীক্ষা করুন।';
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          msg = 'ভুল পাসওয়ার্ড বা তথ্য দেওয়া হয়েছে (Invalid password or credentials).';
        } else if (err.code === 'auth/user-not-found') {
          msg = 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি (No user found with this email).';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সাময়িকভাবে স্থগিত। কিছুক্ষণ পর পুনরায় চেষ্টা করুন।';
        } else if (err.message) {
          msg = err.message;
        }

        showError(msg);
      }
    };
  }

  function showError(msg) {
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
    }
  }

  function hideError() {
    if (errorAlert) {
      errorAlert.style.display = 'none';
    }
  }
}
