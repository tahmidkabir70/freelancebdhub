/**
 * FREELANCE BD HUB — CLOUDFLARE WORKER IMGBB PROXY
 * Securely forwards image uploads to ImgBB API without exposing the secret API Key.
 *
 * Environment Variables Required in Cloudflare Worker Dashboard:
 * - IMGBB_API_KEY: Your secret ImgBB API Key
 * - ALLOWED_ORIGIN: REQUIRED. One or more allowed origins, comma-separated
 *   e.g. https://myproject.pages.dev,https://freelancebdhub.com
 */

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);
    const reqOrigin = request.headers.get("Origin") || "";
    
    // Fail closed: never fall back to "*"
    if (allowed.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Worker misconfigured: ALLOWED_ORIGIN is not set." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!allowed.includes(reqOrigin)) {
      return new Response(JSON.stringify({ success: false, error: "Origin not allowed." }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": reqOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed. Use POST." }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    if (!env.IMGBB_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: "Worker error: IMGBB_API_KEY is not configured in Cloudflare environment secrets." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    try {
      const incomingFormData = await request.formData();
      const imageFile = incomingFormData.get("image");
      
      if (!imageFile) {
        return new Response(JSON.stringify({ success: false, error: "No image file provided in form-data field 'image'." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Check max size 32 MB
      if (typeof imageFile === "object" && imageFile.size > 32 * 1024 * 1024) {
        return new Response(JSON.stringify({ success: false, error: "File exceeds ImgBB 32MB limit." }), {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      const imgbbForm = new FormData();
      imgbbForm.append("image", imageFile);
      
      const expiration = incomingFormData.get("expiration");
      let apiUrl = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(env.IMGBB_API_KEY)}`;
      if (expiration) {
        apiUrl += `&expiration=${encodeURIComponent(expiration)}`;
      }
      
      const imgbbResponse = await fetch(apiUrl, {
        method: "POST",
        body: imgbbForm
      });
      
      const responseData = await imgbbResponse.json();
      
      return new Response(JSON.stringify(responseData), {
        status: imgbbResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message || "Failed to proxy upload to ImgBB." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};