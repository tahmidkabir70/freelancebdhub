// Cloudflare Pages Function — serves /article.html?slug=... with REAL SEO + share-preview tags.
// Facebook / WhatsApp / Telegram / Google (first pass) read the title, description and image
// straight from the HTML, without running JavaScript. The page itself still works exactly as before.

const FIREBASE_PROJECT_ID = 'irins-world';
const FIREBASE_API_KEY = 'AIzaSyDVRMR31TRpHP1JRNo8PK-TfQU5Fth2M1I';
const SITE_NAME = 'Freelance BD Hub';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  const page = await getStaticPage(env, url);
  if (!slug || !page.ok) return page;

  let art = null;
  try {
    art = await fetchArticle(slug, url.origin);
  } catch (err) {
    console.error('[ArticleSEO] Firestore failed:', err);
  }
  if (!art) return page; // unknown slug / error → normal page, JS handles the rest

  const origin = url.origin;
  const title = art.seoTitle || art.title || SITE_NAME;
  const fullTitle = `${title} | ${SITE_NAME}`;
  const description = clip(art.seoDescription || art.shortDescription || plainText(art.html), 160);
  const image = /^https?:\/\//i.test(art.featuredImage || '') ? art.featuredImage : `${origin}/assets/images/logo.svg`;
  const canonical = `${origin}/article.html?slug=${encodeURIComponent(art.slug)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: [image],
    mainEntityOfPage: canonical,
    url: canonical,
    ...(art.publishedAt ? { datePublished: art.publishedAt } : {}),
    ...(art.updatedAt || art.publishedAt ? { dateModified: art.updatedAt || art.publishedAt } : {}),
    author: { '@type': 'Person', name: art.authorName || SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${origin}/assets/images/logo.svg` } }
  };

  const tags = [
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}">`,
    `<meta property="og:title" content="${esc(fullTitle)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(fullTitle)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    // data-fbh-jsonld → seo.js replaces this with its own copy in the browser (no duplicates)
    `<script type="application/ld+json" data-fbh-jsonld>${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
  ].join('\n');

  const remove = { element(el) { el.remove(); } };
  const rewritten = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(fullTitle); } })
    .on('meta[name="description"]', remove)
    .on('meta[property^="og:"]', remove)
    .on('meta[name^="twitter:"]', remove)
    .on('link[rel="canonical"]', remove)
    .on('head', { element(el) { el.append(tags, { html: true }); } })
    .transform(page);

  const headers = new Headers(rewritten.headers);
  headers.delete('content-length');
  headers.delete('etag');
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'public, max-age=300');
  return new Response(rewritten.body, { status: 200, headers });
}

// Load the normal static article.html (follow one "pretty URL" redirect if Pages adds it)
async function getStaticPage(env, url) {
  let res = await env.ASSETS.fetch(new Request(new URL('/article.html', url.origin)));
  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get('Location');
    if (loc) res = await env.ASSETS.fetch(new Request(new URL(loc, url.origin)));
  }
  return res;
}

async function fetchArticle(slug, origin) {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Referer': origin + '/' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'articles' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'slug' }, op: 'EQUAL', value: { stringValue: slug } } },
              { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } }
            ]
          }
        },
        limit: 1
      }
    })
  });
  if (!res.ok) throw new Error(`Firestore query failed: ${res.status}`);
  const rows = await res.json();
  const row = rows.find((r) => r.document && r.document.fields);
  if (!row) return null;
  const f = row.document.fields;
  const str = (k) => f[k]?.stringValue || '';
  return {
    slug: str('slug') || slug,
    title: str('title'),
    seoTitle: str('seoTitle'),
    seoDescription: str('seoDescription'),
    shortDescription: str('shortDescription'),
    featuredImage: str('featuredImage'),
    authorName: str('authorName'),
    html: str('html'),
    publishedAt: f.publishedAt?.timestampValue || '',
    updatedAt: f.updatedAt?.timestampValue || ''
  };
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function plainText(html) {
  return String(html || '').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
function clip(s, n) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}