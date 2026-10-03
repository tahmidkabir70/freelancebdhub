/**
 * FREELANCE BD HUB — ARTICLES & CATEGORIES DATA LAYER
 * Firestore integration with automatic fallback sample dataset
 */

import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from './firebase-init.js';
import { calculateReadingTime } from './utils.js';

/* Initial 9 categories defined in Section 16 */
export const INITIAL_CATEGORIES = [
  { id: 'freelancing', name: 'ফ্রিল্যান্সিং গাইড', nameEn: 'Freelancing Guides', slug: 'freelancing', description: 'Upwork, Fiverr ও আন্তর্জাতিক মার্কেটপ্লেসে সফলতার গাইডলাইন।', descriptionEn: 'Upwork, Fiverr and global marketplace blueprints.', icon: '💼', order: 1 },
  { id: 'web-dev', name: 'ওয়েব ডেভেলপমেন্ট', nameEn: 'Web Development', slug: 'web-dev', description: 'HTML, CSS, JavaScript, React ও আধুনিক ফুল-স্ট্যাক কোডিং।', descriptionEn: 'HTML, CSS, JavaScript, React and modern web engineering.', icon: '💻', order: 2 },
  { id: 'ai-tools', name: 'এআই ও অটোমেশন', nameEn: 'AI & Automation', slug: 'ai-tools', description: 'ChatGPT, Midjourney ও এআই প্রযুক্তির সাহায্যে উৎপাদনশীলতা বৃদ্ধি।', descriptionEn: 'Maximizing productivity with AI tools and automation.', icon: '🤖', order: 3 },
  { id: 'remote-jobs', name: 'রিমোট জব ও ক্যারিয়ার', nameEn: 'Remote Careers', slug: 'remote-jobs', description: 'ইউএস ও ইউরোপীয় কোম্পানিতে রিমোট ফুল-টাইম কাজের প্রস্তুতি।', descriptionEn: 'Landing international remote engineering jobs.', icon: '🌍', order: 4 },
  { id: 'payment-methods', name: 'পেমেন্ট ও ব্যাংকিং', nameEn: 'Payment & Banking', slug: 'payment-methods', description: 'Payoneer, ব্যাংকিং এবং রেমিট্যান্স উত্তোলনের নির্ভুল উপায়।', descriptionEn: 'Smooth withdrawal and remittance for freelancers.', icon: '💳', order: 5 },
  { id: 'ui-ux', name: 'ইউআই/ইউএক্স ডিজাইন', nameEn: 'UI/UX Design', slug: 'ui-ux', description: 'Figma, প্রোটোটাইপিং এবং ইউজার এক্সপেরিয়েন্স ডিজাইন টিপস।', descriptionEn: 'Interface prototyping and design thinking.', icon: '🎨', order: 6 },
  { id: 'seo-content', name: 'এসইও ও কনটেন্ট', nameEn: 'SEO & Content', slug: 'seo-content', description: 'অর্গানিক ট্র্যাফিক বৃদ্ধি, কি-ওয়ার্ড রিসার্চ এবং টেকনিক্যাল এসইও।', descriptionEn: 'Organic growth and technical search engine optimization.', icon: '📈', order: 7 },
  { id: 'graphic-design', name: 'গ্রাফিক ডিজাইন', nameEn: 'Graphic Design', slug: 'graphic-design', description: 'Photoshop, Illustrator ও ব্র্যান্ডিং ভিজ্যুয়াল আর্ট।', descriptionEn: 'Visual branding and digital art mastery.', icon: '🖌️', order: 8 },
  { id: 'cybersecurity', name: 'সাইবার নিরাপত্তা', nameEn: 'Cybersecurity', slug: 'cybersecurity', description: 'একাউন্ট হ্যাকিং প্রতিরোধ এবং অনলাইন সিকিউরিটি সচেতনতা।', descriptionEn: 'Account protection and defensive security.', icon: '🛡️', order: 9 }
];

/* Initial 3 bilingual sample articles defined in Section 16 */
export const SAMPLE_ARTICLES = [
  {
    id: 'sample-freelance-roadmap',
    title: '২০২৬ সালে বাংলাদেশ থেকে ফ্রিল্যান্সিং শুরুর পূর্ণাঙ্গ গাইডলাইন',
    titleEn: 'Complete Roadmap to Freelancing from Bangladesh in 2026',
    slug: 'freelancing-complete-roadmap-bangladesh',
    categoryId: 'freelancing',
    categoryName: 'ফ্রিল্যান্সিং গাইড',
    categorySlug: 'freelancing',
    tags: ['freelancing', 'career', 'upwork', 'fiverr', 'bangladesh'],
    featuredImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'নতুনদের জন্য আন্তর্জাতিক মার্কেটপ্লেসে একাউন্ট তৈরি, সঠিক স্কিল নির্বাচন এবং সফল প্রোফাইল গড়ে তোলার বাস্তবসম্মত কৌশল।',
    shortDescriptionEn: 'A practical, step-by-step roadmap for beginners to select profitable skills, create winning profiles on Upwork and Fiverr, and earn globally.',
    html: `
      <h2>ভূমিকা: ফ্রিল্যান্সিং কেন এবং কীভাবে শুরু করবেন?</h2>
      <p>বর্তমান ডিজিটাল অর্থনীতিতে ফ্রিল্যান্সিং শুধু একটি খণ্ডকালীন কাজ নয়, বরং একটি উচ্চ সম্ভাবনাময় স্বাধীন পেশা। বাংলাদেশ থেকে লক্ষাধিক তরুণ-তরুণী এখন বিশ্ববাজারে তাদের দক্ষতার প্রমাণ রাখছেন।</p>
      
      <h2>ধাপ ১: সঠিক স্কিল বা দক্ষতা নির্বাচন</h2>
      <p>ফ্রিল্যান্সিংয়ের মূল ভিত্তি হলো কোনো একটি নির্দিষ্ট কাজে পারদর্শিতা। শুরুতে যেকোনো একটি ক্ষেত্রে ৬-১২ মাস গভীর মনোযোগ দেওয়া জরুরি:</p>
      <ul>
        <li><strong>ওয়েব ডেভেলপমেন্ট:</strong> Frontend (HTML/CSS/JS/React) বা Full-stack।</li>
        <li><strong>ইউআই/ইউএক্স ডিজাইন:</strong> Figma ও আধুনিক ইন্টারফেস ডিজাইন।</li>
        <li><strong>ডিজিটাল মার্কেটিং ও এসইও:</strong> কন্টেন্ট ও সার্চ অপটিমাইজেশন।</li>
      </ul>

      <h2>ধাপ ২: প্রফেশনাল পোর্টফোলিও ও প্রোফাইল তৈরি</h2>
      <p>ক্লায়েন্টরা আপনার সার্টিফিকেটের চেয়ে বেশি গুরুত্ব দেয় আপনার পূর্ববর্তী প্রজেক্টের লাইভ ডেমো বা পোর্টফোলিওতে। ৩-৫টি বাস্তব প্রজেক্ট তৈরি করে GitHub বা লাইভ সার্ভারে হোস্ট করুন।</p>
      
      <blockquote>
        "সততা, সঠিক সময়ে কমিউনিকেশন এবং কাজের গুণগত মান বজায় রাখলে একজন আন্তর্জাতিক ক্লায়েন্ট আপনার দীর্ঘমেয়াদী পার্টনারে পরিণত হতে পারে।"
      </blockquote>

      <h2>ধাপ ৩: পেমেন্ট ও রেমিট্যান্স গ্রহণ</h2>
      <p>বাংলাদেশ ব্যাংকের অনুমোদিত চ্যানেলে বৈধ পথে রেমিট্যান্স আনলে আপনি সরকারের বিশেষ আর্থিক প্রণোদনাও লাভ করতে পারবেন। Payoneer বা সরাসরি ব্যাংক ট্রান্সফার ব্যবহার করুন।</p>
    `,
    css: `
      h2 { color: #4f46e5; }
      blockquote { border-color: #4f46e5; font-size: 1.1rem; }
    `,
    javascript: `
      console.log('Sample Article 1 Mounted in Sandbox');
    `,
    authorName: 'Irin Kabir',
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 2),
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    views: 342,
    readingTime: 4,
    wordCount: 380,
    isSample: true
  },
  {
    id: 'sample-react-modern-guide',
    title: 'Modern Frontend Development: React, Vite & Tailwind CSS',
    titleEn: 'Modern Frontend Development: React, Vite & Tailwind CSS',
    slug: 'modern-frontend-development-react-vite-tailwind',
    categoryId: 'web-dev',
    categoryName: 'ওয়েব ডেভেলপমেন্ট',
    categorySlug: 'web-dev',
    tags: ['react', 'vite', 'javascript', 'frontend', 'tailwind'],
    featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'দ্রুতগতির ওয়েব অ্যাপ্লিকেশন আর্কিটেকচার, স্টেট ম্যানেজমেন্ট এবং আধুনিক কম্পোনেন্ট ডিজাইন প্যাটার্ন নিয়ে বাস্তবসম্মত বিশ্লেষণ।',
    shortDescriptionEn: 'A practical deep dive into blazing fast web application architectures, state management, and modern component design patterns.',
    html: `
      <h2>The Shift in Modern Web Architecture</h2>
      <p>Web development has evolved drastically over the last few years. Traditional heavyweight bundlers have been replaced by lightning-fast tooling like Vite, powered by native ES modules and esbuild.</p>

      <h2>Key Advantages of Using Vite in 2026</h2>
      <ul>
        <li><strong>Instant Server Start:</strong> Modules are parsed on demand.</li>
        <li><strong>Hot Module Replacement (HMR):</strong> Changes reflect in milliseconds.</li>
        <li><strong>Optimized Production Builds:</strong> Powered by Rollup with robust tree-shaking.</li>
      </ul>

      <h2>Component Isolation and Sandboxing</h2>
      <p>When running user-authored code or third-party articles, iframe sandboxing ensures client security while allowing clean stylistic freedom.</p>
      
      <pre><code>// Safe script execution pattern
window.addEventListener('message', (event) => {
  if (event.data?.type === 'fbh:render') {
    document.getElementById('content').innerHTML = event.data.html;
  }
});</code></pre>
    `,
    css: `
      pre { background: #0b1120; border: 1px solid #1e293b; }
      h2 { color: #8b5cf6; }
    `,
    javascript: `
      console.log('Sample Article 2 Mounted in Sandbox');
    `,
    authorName: 'Irin Kabir',
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 5),
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 5),
    views: 520,
    readingTime: 3,
    wordCount: 260,
    isSample: true
  },
  {
    id: 'sample-remote-work-mindset',
    title: 'গ্লোবাল রিমোট জব পেতে কার্যকর কমিউনিকেশন এবং টাইম ম্যানেজমেন্ট',
    titleEn: 'Effective Communication & Time Management to Win Global Remote Jobs',
    slug: 'global-remote-work-communication-time-management',
    categoryId: 'remote-jobs',
    categoryName: 'রিমোট জব ও ক্যারিয়ার',
    categorySlug: 'remote-jobs',
    tags: ['remote-jobs', 'productivity', 'communication', 'english'],
    featuredImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'আন্তর্জাতিক ক্লায়েন্টদের সাথে Asynchronous কমিউনিকেশন, স্ল্যাক শিষ্টাচার এবং বিভিন্ন টাইমজোনে কাজ করার গোপন সূত্র।',
    shortDescriptionEn: 'Secret frameworks for asynchronous client communication, Slack etiquette, and collaborating seamlessly across global time zones.',
    html: `
      <h2>অ্যাসিঙ্ক্রোনাস কমিউনিকেশনের গুরুত্ব</h2>
      <p>রিমোট জবের সবচেয়ে বড় সুবিধা হলো কাজের সময়ের স্বাধীনতা। তবে এটি সফল করতে হলে প্রতিটি মেসেজ বা ইমেইল স্পষ্ট, স্বয়ংসম্পূর্ণ এবং তথ্যে সমৃদ্ধ হওয়া বাঞ্ছনীয়।</p>
      
      <h2>সফল রিমোট কর্মীদের ৫টি দৈনন্দিন অভ্যাস</h2>
      <ol>
        <li>দৈনিক কাজের তালিকা (Todo list) তৈরি রাখা।</li>
        <li>কাজের অগ্রগতি নিয়মিত ম্যানেজার বা টিম লিডকে আপডেট করা।</li>
        <li>টাইম-ট্র্যাকার ব্যবহারের সময় স্বচ্ছতা বজায় রাখা।</li>
        <li>ইংরেজিতে নিয়মিত কথোপকথন ও পেশাদার লেখার অনুশীলন।</li>
        <li>শারীরিক সুস্থতা ও কাজের বিরতি নিশ্চিত করা।</li>
      </ol>
    `,
    css: `
      h2 { color: #ec4899; }
    `,
    javascript: ``,
    authorName: 'Freelance BD Hub',
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 7),
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000 * 7),
    views: 290,
    readingTime: 3,
    wordCount: 220,
    isSample: true
  }
];

/**
 * Fetch all categories with sessionStorage cache
 */
export async function getCategories() {
  const cached = sessionStorage.getItem('fbh_categories');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }

  try {
    const snap = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    sessionStorage.setItem('fbh_categories', JSON.stringify(list));
    return list;
  } catch (err) {
    console.warn('[Categories] Firestore query failed, using default sample categories:', err);
    return INITIAL_CATEGORIES;
  }
}

/**
 * Fetch published articles
 */
export async function getPublishedArticles(options = {}) {
  const { limitCount = 10, categorySlug = null, tag = null } = options;

  try {
    let q = query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    );

    if (categorySlug) {
      q = query(
        collection(db, 'articles'),
        where('status', '==', 'published'),
        where('categorySlug', '==', categorySlug),
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );
    }

    const snap = await getDocs(q);
    let articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (tag) {
      articles = articles.filter((a) => a.tags && a.tags.includes(tag));
    }
    return articles;
  } catch (err) {
    console.warn('[Articles] Firestore query failed, using bundled samples:', err);
  }

  let list = [...SAMPLE_ARTICLES];
  if (categorySlug) {
    list = list.filter((a) => a.categorySlug === categorySlug);
  }
  if (tag) {
    list = list.filter((a) => a.tags && a.tags.includes(tag));
  }
  return list.slice(0, limitCount);
}

/**
 * Fetch single article by slug.
 * Issue #11 fix: added optional `includeDrafts` flag for admin preview.
 * When true, Firestore rules still enforce that only admins can read drafts.
 */
export async function getArticleBySlug(slug, options = {}) {
  const { includeDrafts = false } = options;

  if (!slug) return null;

  try {
    let q;
    if (includeDrafts) {
      // No status filter — rules will reject this query for non-admins,
      // and only admins can actually read draft documents.
      q = query(
        collection(db, 'articles'),
        where('slug', '==', slug),
        limit(1)
      );
    } else {
      q = query(
        collection(db, 'articles'),
        where('slug', '==', slug),
        where('status', '==', 'published'),
        limit(1)
      );
    }

    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0];
      return { id: docData.id, ...docData.data() };
    }
    return null;
  } catch (err) {
    console.warn('[Articles] Firestore single article fetch failed, checking samples:', err);
  }

  // Sample fallback (published only)
  return SAMPLE_ARTICLES.find((a) => a.slug === slug) || null;
}

/**
 * Fetch related articles by category
 */
export async function getRelatedArticles(categoryId, currentSlug, limitCount = 3) {
  try {
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      where('categoryId', '==', categoryId),
      limit(limitCount + 1)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((a) => a.slug !== currentSlug)
      .slice(0, limitCount);
  } catch (e) {
    console.warn('[Articles] Related articles query failed, using samples:', e);
  }

  return SAMPLE_ARTICLES.filter((a) => a.slug !== currentSlug).slice(0, limitCount);
}

/**
 * Increment view count on article
 */
export async function incrementArticleViews(articleId) {
  if (!articleId || articleId.startsWith('sample-')) return;
  try {
    const ref = doc(db, 'articles', articleId);
    await updateDoc(ref, {
      views: increment(1)
    });
  } catch (e) {
    console.warn('[Articles] View increment warning:', e);
  }
}

/**
 * Submit comment (creates document with status = 'pending')
 * Issue #10 fix: no longer returns fake success on Firestore failure.
 */
export async function submitComment(commentData) {
  const { articleId, articleSlug, articleTitle, name, comment } = commentData;

  if (!name || name.trim().length === 0 || !comment || comment.trim().length === 0) {
    throw new Error('নাম এবং মন্তব্য আবশ্যক। (Name and comment are required)');
  }

  const payload = {
    articleId,
    articleSlug,
    articleTitle: articleTitle || '',
    name: name.trim().slice(0, 80),
    comment: comment.trim().slice(0, 2000),
    status: 'pending',
    createdAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'comments'), payload);
  return { success: true, id: ref.id };
}

/**
 * Get approved comments for an article
 */
export async function getApprovedComments(articleId) {
  try {
    const q = query(
      collection(db, 'comments'),
      where('articleId', '==', articleId),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('[Comments] Fetch approved comments fallback:', err);
  }
  return [];
}