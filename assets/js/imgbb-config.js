/**
 * FREELANCE BD HUB — IMGBB SECURITY CONFIGURATION
 * Uploads are proxied through Cloudflare Worker to protect the API Secret
 */

export const imgbbConfig = {
  // Critical #5: API key is in Cloudflare Worker secret, NOT here
  proxyUrl: "https://imgbb-proxy.irinkabir79.workers.dev",
  maxSizeMB: 5,
  allowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
  expiration: null
};

export const imgbbProcessing = {
  featuredWidth: 1200,
  bodyWidth: 800,
  categoryWidth: 600,
  quality: 0.82
};