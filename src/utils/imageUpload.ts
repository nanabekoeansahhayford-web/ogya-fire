/**
 * Client-side image compression and Cloudinary unsigned upload utilities.
 * Compresses images to max 1MB before uploading to Cloudinary.
 */

export const MAX_UPLOAD_IMAGE_BYTES = 980 * 1024; // Strictly under 1MB

export const CLOUDINARY_CLOUD_NAME = 'pzfmaamb';
export const CLOUDINARY_UPLOAD_PRESET = 'ogya_unsigned';
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    const timer = window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Timed out reading image "${file.name}". Please try another photo.`));
    }, 15000);

    img.onload = () => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          `Unable to read image "${file.name}". Please choose a valid JPG, PNG, or WebP file.`
        )
      );
    };
    img.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Image compression failed while encoding canvas output.'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function compressImageToMax1MB(
  file: File,
  maxBytes: number = MAX_UPLOAD_IMAGE_BYTES
): Promise<File> {
  const isImageMime = file.type.startsWith('image/');
  const hasImageExt = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(file.name);
  if (!isImageMime && !hasImageExt) {
    throw new Error(`Unsupported file "${file.name}". Please select an image (JPG, PNG, or WebP).`);
  }

  const img = await loadImageFromFile(file);
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  if (!origWidth || !origHeight) {
    throw new Error(`Invalid image dimensions for "${file.name}".`);
  }

  // If already <= 300KB and <= 1600px in JPEG/WebP/PNG, keep original for crispness.
  if (
    file.size <= 300 * 1024 &&
    origWidth <= 1600 &&
    origHeight <= 1600 &&
    (file.type === 'image/jpeg' || file.type === 'image/webp' || file.type === 'image/png')
  ) {
    return file;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser canvas context is unavailable for image compression.');
  }

  const dimensionCaps = [1920, 1600, 1280, 1024, 800, 640];
  const qualitySteps = [0.86, 0.76, 0.66, 0.56, 0.45, 0.35, 0.25];
  const outputMime = 'image/jpeg';

  let bestBlob: Blob | null = null;

  for (const maxDim of dimensionCaps) {
    const scale = Math.min(1, maxDim / Math.max(origWidth, origHeight));
    const targetWidth = Math.max(1, Math.round(origWidth * scale));
    const targetHeight = Math.max(1, Math.round(origHeight * scale));

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    for (const quality of qualitySteps) {
      const blob = await canvasToBlob(canvas, outputMime, quality);
      bestBlob = blob;
      if (blob.size <= maxBytes) {
        const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
        return new File([blob], `${baseName}.jpg`, {
          type: outputMime,
          lastModified: Date.now(),
        });
      }
    }
  }

  if (bestBlob && bestBlob.size <= 1024 * 1024) {
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([bestBlob], `${baseName}.jpg`, {
      type: outputMime,
      lastModified: Date.now(),
    });
  }

  throw new Error(`Could not compress "${file.name}" below 1MB. Please choose a smaller photo.`);
}

/**
 * Compress an image to max 1MB and upload to Cloudinary unsigned preset
 * with real byte-level upload progress (XMLHttpRequest + FormData).
 */
export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  onProgress?.(3);
  const compressedFile = await compressImageToMax1MB(file);
  onProgress?.(8);

  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);
    xhr.timeout = 45000;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        // Scale 0..100% network transfer across 10..95% so UI moves smoothly and never stalls at 0%
        const pct = Math.min(95, Math.max(10, Math.round((event.loaded / event.total) * 85 + 10)));
        onProgress?.(pct);
      } else {
        onProgress?.(50);
      }
    };

    xhr.upload.onload = () => {
      onProgress?.(96);
    };

    xhr.onload = () => {
      let parsed: any = null;
      try {
        parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        parsed = null;
      }

      if (xhr.status >= 200 && xhr.status < 300 && parsed?.secure_url) {
        onProgress?.(100);
        resolve({
          secureUrl: String(parsed.secure_url),
          publicId: parsed.public_id ? String(parsed.public_id) : undefined,
          width: typeof parsed.width === 'number' ? parsed.width : undefined,
          height: typeof parsed.height === 'number' ? parsed.height : undefined,
          bytes: typeof parsed.bytes === 'number' ? parsed.bytes : compressedFile.size,
        });
        return;
      }

      const exactMessage =
        parsed?.error?.message ||
        parsed?.message ||
        `Cloudinary upload failed (HTTP ${xhr.status || 0}).`;
      console.log('Cloudinary upload error:', {
        status: xhr.status,
        error: parsed?.error || parsed || xhr.responseText,
      });
      reject(new Error(exactMessage));
    };

    xhr.onerror = () => {
      const networkErr = new Error(
        'Network error while uploading image to Cloudinary. Please check your internet connection.'
      );
      console.log('Cloudinary upload network error:', networkErr);
      reject(networkErr);
    };

    xhr.ontimeout = () => {
      const timeoutErr = new Error(
        'Cloudinary upload timed out after 45 seconds. Please check your connection and try again.'
      );
      console.log('Cloudinary upload timeout error:', timeoutErr);
      reject(timeoutErr);
    };

    xhr.onabort = () => {
      const abortErr = new Error('Image upload was aborted.');
      console.log('Cloudinary upload aborted:', abortErr);
      reject(abortErr);
    };

    xhr.send(formData);
  });
}
