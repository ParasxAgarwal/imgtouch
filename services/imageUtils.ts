/**
 * Helper utilities for handling, parsing, and optimizing image payloads for AI services.
 */

export interface ParsedImage {
  mimeType: string;
  data: string;
}

/**
 * Safely parses a base64 Data URI into mimeType and raw base64 string.
 */
export const parseDataUri = (dataUri: string): ParsedImage => {
  if (!dataUri || typeof dataUri !== 'string') {
    throw new Error("Invalid image input: Expected a valid base64 image string.");
  }

  const matches = dataUri.match(/^data:(image\/[a-zA-Z+-]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2]
    };
  }

  // Fallback for raw base64 strings without data prefix
  if (/^[A-Za-z0-9+/=]+$/.test(dataUri.slice(0, 100))) {
    return {
      mimeType: 'image/png',
      data: dataUri
    };
  }

  throw new Error("Invalid image format: Please provide a valid JPEG, PNG, or WEBP image.");
};

/**
 * Converts an image URL (or blob URL) to a base64 Data URI.
 */
export const urlToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Failed to get 2D context for image conversion."));
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (err) {
        reject(new Error("Failed to export canvas to Data URL due to CORS constraints."));
      }
    };
    img.onerror = () => reject(new Error("Failed to load image from URL for processing."));
    img.src = url;
  });
};

/**
 * Downscales oversized images to prevent API payload timeouts.
 */
export const optimizeImagePayload = (dataUri: string, maxDimension = 1536): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxDimension && height <= maxDimension) {
        resolve(dataUri);
        return;
      }

      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUri);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(dataUri);
    img.src = dataUri;
  });
};
