/**
 * PDF Utilities
 * Helper functions for PDF validation and processing
 */

// Configuration constants
export const PDF_CONFIG = {
    MAX_FILE_SIZE: 25 * 1024 * 1024, // 25 MB
    MAX_PAGES: 50,
    ALLOWED_MIME_TYPES: ['application/pdf'],
    THUMBNAIL_SCALE: 0.5, // Scale for thumbnail rendering (sidebar previews)
    HIGH_RES_SCALE: 4.0   // Scale for high-resolution rendering (canvas - 4x for ultra-sharp quality)
};

/**
 * Validate PDF file before upload
 * @param {File} file - PDF file to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validatePdfFile = (file) => {
    if (!file) {
        return {
            valid: false,
            error: 'No file selected'
        };
    }

    // Check file type
    if (!PDF_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Only PDF files are allowed'
        };
    }

    // Check file size
    if (file.size > PDF_CONFIG.MAX_FILE_SIZE) {
        const sizeMB = (PDF_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
        return {
            valid: false,
            error: `File size must be less than ${sizeMB}MB`
        };
    }

    return { valid: true, error: null };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Convert canvas to Blob for upload
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} mimeType - Output MIME type (default: 'image/png')
 * @param {number} quality - Image quality (0-1, default: 0.95)
 * @returns {Promise<Blob>} - Canvas as Blob
 */
export const canvasToBlob = (canvas, mimeType = 'image/png', quality = 0.95) => {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to convert canvas to blob'));
                }
            },
            mimeType,
            quality
        );
    });
};

/**
 * Create a File object from Blob
 * @param {Blob} blob - Blob data
 * @param {string} filename - File name
 * @returns {File} - File object
 */
export const blobToFile = (blob, filename) => {
    return new File([blob], filename, { type: blob.type });
};

/**
 * Generate unique filename for PDF page
 * @param {string} pdfName - Original PDF filename
 * @param {number} pageNumber - Page number
 * @returns {string} - Unique filename
 */
export const generatePageFilename = (pdfName, pageNumber) => {
    const nameWithoutExt = pdfName.replace('.pdf', '');
    const timestamp = Date.now();
    return `${nameWithoutExt}-page${pageNumber}-${timestamp}.png`;
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
