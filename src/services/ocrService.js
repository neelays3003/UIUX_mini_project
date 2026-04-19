/* ─── OCR Service — Tesseract.js with Image Preprocessing ─── */

/**
 * Preprocess an image for better OCR accuracy.
 * Converts to grayscale and increases contrast using canvas.
 * @param {File} file — Image file from input / drop
 * @returns {Promise<Blob>} — Processed image as Blob
 */
export async function preprocessImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Draw original
        ctx.drawImage(img, 0, 0);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Grayscale + contrast boost
        const contrast = 1.4; // 40% more contrast
        const intercept = 128 * (1 - contrast);

        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale (luminance)
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

          // Apply contrast
          const val = Math.min(255, Math.max(0, gray * contrast + intercept));

          data[i] = val;     // R
          data[i + 1] = val; // G
          data[i + 2] = val; // B
          // Alpha stays the same
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            resolve(blob);
          },
          'image/png',
          1.0
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(new Error('Image preprocessing failed: ' + err.message));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for preprocessing.'));
    };

    img.src = url;
  });
}

/**
 * Extract text from an image file using Tesseract.js.
 * Preprocesses the image for better accuracy before OCR.
 * @param {File} file — Image file
 * @param {function} onProgress — Progress callback (0-100)
 * @returns {Promise<string>} — Extracted text
 */
export async function extractTextFromImage(file, onProgress) {
  try {
    // Dynamically import to avoid blocking the main thread/bundle
    const Tesseract = (await import('tesseract.js')).default;
    
    // Preprocess for better accuracy
    const processedBlob = await preprocessImage(file);
    let lastProgress = 0;

    const result = await Tesseract.recognize(processedBlob, 'eng', {
      logger: (info) => {
        if (info.status === 'recognizing text' && typeof info.progress === 'number') {
          const newProgress = Math.round(info.progress * 100);
          // Throttle updates to at least 5% increments to avoid lagging React
          if (newProgress - lastProgress >= 5 || newProgress === 100) {
            lastProgress = newProgress;
            onProgress?.(newProgress);
          }
        }
      },
    });

    const text = result.data.text?.trim();

    if (!text || text.length < 5) {
      throw new Error('No readable text detected in the image. Please try a clearer photo.');
    }

    return text;
  } catch (err) {
    if (err.message.includes('No readable text')) throw err;
    throw new Error('OCR processing failed: ' + err.message);
  }
}
