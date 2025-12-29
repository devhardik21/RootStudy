import { useState, useCallback, useRef, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { PDF_CONFIG } from '../utils/pdfUtils';

// Configure PDF.js worker - use local copy from public folder
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

/**
 * Custom hook for PDF processing using PDF.js via react-pdf
 * Handles PDF loading, page rendering, and thumbnail generation
 */
export const usePdfProcessor = () => {
    const pdfDocumentRef = useRef(null);  // Use ref instead of state
    const [pageCount, setPageCount] = useState(0);
    const [pdfReady, setPdfReady] = useState(false);  // Add ready state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const loadingTaskRef = useRef(null);

    /**
     * Load PDF from file
     * @param {File} file - PDF file to load
     * @returns {Promise<Object>} - PDF metadata
     */
    const loadPdf = useCallback(async (file) => {
        setLoading(true);
        setError(null);
        setPdfReady(false);

        try {
            // Safely destroy previous PDF if exists
            if (pdfDocumentRef.current) {
                try {
                    await pdfDocumentRef.current.destroy();
                } catch {
                    // ...existing code...
                }
                pdfDocumentRef.current = null;
            }

            // Cancel any existing loading task
            if (loadingTaskRef.current) {
                loadingTaskRef.current.destroy();
            }

            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();

            // Load PDF document using react-pdf's pdfjs
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            loadingTaskRef.current = loadingTask;

            const pdf = await loadingTask.promise;
            
            // Store in ref, not state
            pdfDocumentRef.current = pdf;
            setPageCount(pdf.numPages);
            setPdfReady(true);  // Signal PDF is ready
            setLoading(false);

            return {
                success: true,
                pageCount: pdf.numPages
            };

        } catch (err) {
            console.error('Error loading PDF:', err);
            setError(err.message);
            setLoading(false);
            pdfDocumentRef.current = null;
            setPageCount(0);
            setPdfReady(false);

            return {
                success: false,
                error: err.message
            };
        }
    }, []);

    /**
     * Render a specific PDF page to canvas
     * @param {number} pageNumber - Page number (1-indexed)
     * @param {number} scale - Render scale (default: 1.0)
     * @returns {Promise<HTMLCanvasElement>} - Rendered canvas
     */
    const renderPage = useCallback(async (pageNumber, scale = 1.0) => {
        // et PDF from ref, not state
        const pdf = pdfDocumentRef.current;

        // Hard guard against null PDF
        if (!pdf) {
            throw new Error('PDF document not initialized');
        }

        // Hard guard against invalid page number
        if (pageNumber < 1 || pageNumber > pdf.numPages) {
            throw new Error(`Invalid page number: ${pageNumber}`);
        }

        // Get page from the ref-stored PDF
        const page = await pdf.getPage(pageNumber);

        // Get viewport
        const viewport = page.getViewport({ scale });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // 🔑 IMPORTANT: fill white background before rendering
        context.save();
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();

        // Render page to canvas
        const renderContext = {
            canvasContext: context,
            viewport: viewport,
            background: 'rgba(255,255,255,1)'  // Force white background
        };

        const renderTask = page.render(renderContext);
        await renderTask.promise;

        // Do NOT call page.cleanup() here - it breaks the worker
        return canvas;
    }, []);  // Remove pdfDocument and pageCount from dependencies

    /**
     * Render thumbnail for a specific page
     * @param {number} pageNumber - Page number (1-indexed)
     * @returns {Promise<string>} - Data URL of thumbnail
     */
    const renderThumbnail = useCallback(async (pageNumber) => {
        const canvas = await renderPage(pageNumber, PDF_CONFIG.THUMBNAIL_SCALE);
        // Verify canvas has content (optional, can be removed if not needed)
        // const context = canvas.getContext('2d');
        // const imageData = context.getImageData(0, 0, Math.min(10, canvas.width), Math.min(10, canvas.height));
        // const hasContent = imageData.data.some(pixel => pixel !== 0);
        const dataUrl = canvas.toDataURL('image/png', 0.95);
        return dataUrl;
    }, [renderPage]);

    /**
     * Render high-resolution version of a page
     * @param {number} pageNumber - Page number (1-indexed)
     * @returns {Promise<HTMLCanvasElement>} - High-res canvas
     */
    const renderHighRes = useCallback(async (pageNumber) => {
        return await renderPage(pageNumber, PDF_CONFIG.HIGH_RES_SCALE);
    }, [renderPage]);

    /**
     * Get page dimensions
     * @param {number} pageNumber - Page number (1-indexed)
     * @returns {Promise<Object>} - { width, height }
     */
    const getPageDimensions = useCallback(async (pageNumber) => {
        const pdf = pdfDocumentRef.current;

        if (!pdf) {
            throw new Error('PDF document not loaded');
        }

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.0 });

        return {
            width: viewport.width,
            height: viewport.height
        };
    }, []);

    /**
     * Cleanup function - only call on unmount or new PDF
     */
    const cleanup = useCallback(() => {
        if (loadingTaskRef.current) {
            loadingTaskRef.current.destroy();
            loadingTaskRef.current = null;
        }

        // Cleanup ref-based PDF
        if (pdfDocumentRef.current) {
            try {
                pdfDocumentRef.current.destroy();
            } catch {
                // ...existing code...
            }
            pdfDocumentRef.current = null;
        }

        setPageCount(0);
        setPdfReady(false);
        setError(null);
    }, []);

    // Cleanup only on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        pdfReady,  // Export ready state, not the document itself
        pageCount,
        loading,
        error,
        loadPdf,
        renderPage,
        renderThumbnail,
        renderHighRes,
        getPageDimensions,
        cleanup
    };
};
