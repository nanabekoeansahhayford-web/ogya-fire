/**
 * Client-side image compression utility before uploading to Firebase Storage.
 * Guarantees output image is <= 1MB (<= 980KB target) and reasonable resolution.
 */

export const MAX_UPLOAD_IMAGE_BYTES = 980 * 1024; // Strictly under 1MB (1,000,000 & 1,048,576 bytes)

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to read image "${file.name}". Please choose a valid JPG, PNG, or WebP file.`));
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

  // If already well under 1MB and within 1920px, still normalize oversized images;
  // if <= 300KB and <= 1600px in JPEG/WebP/PNG, return directly to preserve crispness.
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

  throw new Error(
    `Could not compress "${file.name}" below 1MB. Please choose a smaller photo.`
  );
}
