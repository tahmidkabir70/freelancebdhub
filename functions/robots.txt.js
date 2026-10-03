/**
 * Dynamic robots.txt — uses whatever domain the site is served from
 * (works on *.pages.dev and on a custom domain, no manual edit needed).
 */
export async function onRequest(context) {
  const origin = new URL(context.request.url).origin;
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /admin-assets/',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    ''
  ].join('\n');
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}