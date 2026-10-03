/**
 * FREELANCE BD HUB — DYNAMIC SEO ENGINE
 * Injects OpenGraph, Twitter Cards, Canonical links, and JSON-LD structured data.
 */

export function applyPageSEO(meta = {}) {
  const {
    title = 'Freelance BD Hub — Learn. Build. Freelance.',
      description = 'বাংলাদেশের ফ্রিল্যান্সার এবং ডেভেলপারদের জন্য নির্ভরযোগ্য রিসোর্স, টিউটোরিয়াল ও ক্যারিয়ার গাইড।',
      url = window.location.href,
      image = window.location.origin + '/assets/images/logo.svg',
      type = 'website',
      articleData = null,
      breadcrumbs = null
  } = meta;
  
  // Set document title
  const siteSuffix = 'Freelance BD Hub';
  const fullTitle = title.includes(siteSuffix) ? title : `${title} | ${siteSuffix}`;
  document.title = fullTitle;
  
  // Helper to set or create meta tag
  const setMeta = (attr, key, content) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content || '');
  };
  
  // Standard Meta
  setMeta('name', 'description', description);
  
  // Open Graph
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:site_name', 'Freelance BD Hub');
  
  // Twitter Cards
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);
  
  // Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  // Canonical: strip tracking params but KEEP ?slug= (article/category pages are slug-based)
  let canonUrl;
  try {
    const cu = new URL(url, window.location.origin);
    canonUrl = cu.origin + cu.pathname;
    const slugParam = cu.searchParams.get('slug');
    if (slugParam) canonUrl += '?slug=' + encodeURIComponent(slugParam);
  } catch (e) {
    canonUrl = String(url).split('?')[0];
  }
  canonicalEl.setAttribute('href', canonUrl);
  
  // Inject Structured JSON-LD Data
  injectJsonLd(type, { title: fullTitle, description, url, image, articleData, breadcrumbs });
}

function injectJsonLd(type, options) {
  // Remove prior dynamic JSON-LD scripts
  document.querySelectorAll('script[data-fbh-jsonld]').forEach((s) => s.remove());
  
  const schemas = [];
  
  // Organization + Website schema for all pages
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Freelance BD Hub',
    'alternateName': 'FBH',
    'url': window.location.origin + '/',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': window.location.origin + '/search.html?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  });
  
  // Breadcrumbs schema
  if (options.breadcrumbs && Array.isArray(options.breadcrumbs)) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': options.breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': b.name,
        'item': b.url
      }))
    });
  }
  
  // Article schema for single article view
  if (options.articleData) {
    const art = options.articleData;
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': art.title || options.title,
      'description': art.shortDescription || options.description,
      'image': art.featuredImage || options.image,
      'datePublished': art.publishedAt ? new Date(art.publishedAt.seconds ? art.publishedAt.seconds * 1000 : art.publishedAt).toISOString() : new Date().toISOString(),
      'dateModified': art.updatedAt ? new Date(art.updatedAt.seconds ? art.updatedAt.seconds * 1000 : art.updatedAt).toISOString() : new Date().toISOString(),
      'author': {
        '@type': 'Person',
        'name': art.authorName || 'Freelance BD Hub Editorial'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Freelance BD Hub',
        'logo': {
          '@type': 'ImageObject',
          'url': window.location.origin + '/assets/images/logo.svg'
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': options.url
      }
    });
  }
  
  schemas.forEach((schema) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-fbh-jsonld', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}