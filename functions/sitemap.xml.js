// Cloudflare Pages Function — auto-generates /sitemap.xml on demand.
// Works on any domain (*.pages.dev or a custom domain): it uses the domain it is served from.

const FIREBASE_PROJECT_ID = 'irins-world';
const FIREBASE_API_KEY = 'AIzaSyDVRMR31TRpHP1JRNo8PK-TfQU5Fth2M1I';

// Pages without a meaningful "last modified" date (no lastmod is better than a fake one)
const STATIC_PAGES = [
  { loc: '/', useNewest: true },
  { loc: '/category.html', useNewest: true },
  { loc: '/search.html', useNewest: true },
  { loc: '/about.html' },
  { loc: '/contact.html' },
  { loc: '/privacy.html' },
  { loc: '/terms.html' }
];

export async function onRequest(context) {
  const origin = new URL(context.request.url).origin;
  
  const [articles, categories] = await Promise.all([
    fetchPublishedArticles(origin).catch((err) => { console.error('[Sitemap] articles failed:', err); return null; }),
    fetchCategories(origin).catch((err) => { console.error('[Sitemap] categories failed:', err); return []; })
  ]);
  
  // If Firestore failed, do NOT serve a misleading "only 7 pages" sitemap with a long cache
  const failed = articles === null;
  const list = articles || [];
  
  const dates = list.map((a) => a.lastmod).filter(Boolean).sort();
  const newest = dates.length ? dates[dates.length - 1] : null;
  
  const staticUrls = STATIC_PAGES.map((p) =>
    urlBlock(origin + p.loc, p.useNewest ? newest : null)
  );
  
  const categoryUrls = categories
    .filter((c) => c.slug)
    .map((c) => urlBlock(`${origin}/category.html?slug=${encodeURIComponent(c.slug)}`, newest));
  
  const articleUrls = list.map((a) =>
    urlBlock(`${origin}/article.html?slug=${encodeURIComponent(a.slug)}`, a.lastmod)
  );
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...categoryUrls, ...articleUrls].join('\n')}
</urlset>
`;
  
  return new Response(xml, {
    status: failed ? 503 : 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': failed ? 'no-store' : 'public, max-age=3600'
    }
  });
}

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function urlBlock(loc, lastmod) {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
}

function toDateString(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

async function runQuery(structuredQuery, origin) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // The Firebase API key is restricted to our site (HTTP referrers); server-side calls must send it too
      'Referer': origin + '/'
    },
    body: JSON.stringify({ structuredQuery })
  });
  if (!res.ok) throw new Error(`Firestore query failed: ${res.status}`);
  const rows = await res.json();
  return rows.filter((r) => r.document && r.document.fields).map((r) => r.document.fields);
}

async function fetchPublishedArticles(origin) {
  const fields = await runQuery({
    from: [{ collectionId: 'articles' }],
    where: {
      fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } }
    },
    orderBy: [{ field: { fieldPath: 'publishedAt' }, direction: 'DESCENDING' }],
    limit: 500
  }, origin);
  
  return fields
    .map((f) => ({
      slug: f.slug?.stringValue || '',
      lastmod: toDateString(f.updatedAt?.timestampValue) || toDateString(f.publishedAt?.timestampValue)
    }))
    .filter((a) => a.slug);
}

async function fetchCategories(origin) {
  const fields = await runQuery({ from: [{ collectionId: 'categories' }], limit: 200 }, origin);
  return fields.map((f) => ({ slug: f.slug?.stringValue || '' }));
}