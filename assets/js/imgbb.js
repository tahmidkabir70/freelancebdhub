/**
 * FREELANCE BD HUB — IMGBB UPLOAD UTILITIES
 * Client-side canvas compression + Cloudflare Worker proxy upload
 */

import { imgbbConfig, imgbbProcessing } from './imgbb-config.js';

export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function validate(file) {
  if (!file) {
    return { valid: false, error: 'কোনো ফাইল নির্বাচন করা হয়নি (No file selected).' };
  }
  const ext = file.name.split('.').pop().toLowerCase();
  if (!imgbbConfig.allowedFormats.includes(ext)) {
    return {
      valid: false,
      error: `অননুমোদিত ফরম্যাট। শুধুমাত্র ${imgbbConfig.allowedFormats.join(', ')} অনুমোদিত।`
    };
  }
  const maxBytes = imgbbConfig.maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `ফাইলের আকার ${imgbbConfig.maxSizeMB}MB এর বেশি হতে পারবে না। বর্তমান আকার: ${formatBytes(file.size)}`
    };
  }
  return { valid: true };
}

export async function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    // Skip GIFs to preserve animation
    if (file.type === 'image/gif') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas compression failed'));
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export async function uploadToImgBB(file, onProgress = null) {
  const validation = validate(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // If worker proxy URL is still placeholder, support transparent base64 preview
  if (!imgbbConfig.proxyUrl || imgbbConfig.proxyUrl.includes('PASTE_YOUR_WORKER_URL')) {
    console.warn('[ImgBB] Worker proxy not configured. Using local data storage preview.');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        resolve({
          id: 'local_' + Date.now(),
          url: dataUrl,
          displayUrl: dataUrl,
          thumbUrl: dataUrl,
          mediumUrl: dataUrl,
          deleteUrl: '',
          title: file.name,
          size: file.size,
          width: 800,
          height: 600,
          isLocalPreview: true
        });
      };
      reader.readAsDataURL(file);
    });
  }

  const formData = new FormData();
  formData.append('image', file);
  if (imgbbConfig.expiration) {
    formData.append('expiration', String(imgbbConfig.expiration));
  }

  const response = await fetch(imgbbConfig.proxyUrl, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload proxy failed (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  if (!json.success && !json.data) {
    throw new Error(json.error || 'ImgBB upload returned unsuccessful response');
  }

  const data = json.data || json;
  return {
    id: data.id || 'img_' + Date.now(),
    url: data.url || data.display_url,
    displayUrl: data.display_url || data.url,
    thumbUrl: data.thumb ? data.thumb.url : (data.thumb_url || data.url),
    mediumUrl: data.medium ? data.medium.url : (data.medium_url || data.url),
    deleteUrl: data.delete_url || '',
    title: data.title || file.name,
    size: data.size || file.size,
    width: data.width,
    height: data.height
  };
}

export async function uploadImageSmart(file, options = {}) {
  const { purpose = 'featured', onProgress = null } = options;
  let targetWidth = imgbbProcessing.featuredWidth;

  if (purpose === 'body') targetWidth = imgbbProcessing.bodyWidth;
  if (purpose === 'category') targetWidth = imgbbProcessing.categoryWidth;

  const compressed = await compressImage(file, targetWidth, imgbbProcessing.quality);
  return uploadToImgBB(compressed, onProgress);
}
