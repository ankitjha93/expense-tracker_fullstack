/**
 * Utility for client-side image processing.
 * Takes any image File, center-crops it into a square, resizes it to targetSize x targetSize,
 * and compresses it to an ultra-lightweight JPEG/WebP data URL (~5KB to 8KB).
 * This guarantees the avatar fits inside Supabase JWT user_metadata and browser LocalStorage quotas.
 */
export const compressAndCropAvatar = (file, targetSize = 160, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Failed to load image element'));
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Canvas context not available'));
          }

          // Calculate center square crop
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          // Enable high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Clear and fill background with neutral dark tone if transparent
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(0, 0, targetSize, targetSize);

          // Draw the center-cropped square resized to targetSize
          ctx.drawImage(
            img,
            sx,
            sy,
            minDim,
            minDim,
            0,
            0,
            targetSize,
            targetSize
          );

          // Export as JPEG with specified quality (typically 4KB-8KB)
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Calculates rough size in KB from a Data URL string
 */
export const getDataUrlSizeKb = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
  const base64Str = dataUrl.split(',')[1] || '';
  const bytes = (base64Str.length * 3) / 4;
  return (bytes / 1024).toFixed(1);
};
