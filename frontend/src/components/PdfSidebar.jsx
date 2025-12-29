import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight, Upload, X, FileText } from 'lucide-react';
import { usePdfProcessor } from '../hooks/usePdfProcessor';
import { validatePdfFile, formatFileSize, canvasToBlob, blobToFile, generatePageFilename } from '../utils/pdfUtils';
import PdfPageThumbnail from './PdfPageThumbnail';
import { LOCAL_URL } from '../api/api';

/**
 * PdfSidebar Component
 * Right-side collapsible sidebar for PDF page selection
 * Features: Upload PDF, display thumbnails, drag pages to canvas
 */
const PdfSidebar = forwardRef(({ onPageDrop, editor }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfMetadata, setPdfMetadata] = useState(null);
    const [selectedPage, setSelectedPage] = useState(null);
    const [uploadingPage, setUploadingPage] = useState(null);
    const fileInputRef = useRef(null);

    const {
        pdfReady,  // Use pdfReady instead of pdfDocument
        pageCount,
        loading,
        error,
        loadPdf,
        renderThumbnail,
        renderHighRes,
        cleanup
    } = usePdfProcessor();

    /**
     * Handle PDF file upload
     */
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = validatePdfFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            // 1. Upload to backend FIRST
            const formData = new FormData();
            formData.append('pdf', file);
            
            const response = await fetch(`${LOCAL_URL}/api/pdf/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Backend error: ${errorData.message || 'Upload failed'}`);
                return;
            }

            const data = await response.json();
            if (!data.success) {
                alert(`Upload failed: ${data.message}`);
                return;
            }

            // 2. Load PDF for rendering only AFTER backend succeeds
            const result = await loadPdf(file);
            
            if (!result.success) {
                alert(`Failed to load PDF for rendering: ${result.error}`);
                return;
            }

            // 3. Set metadata only after both succeed
            setPdfFile(file);
            setPdfMetadata({
                fileName: file.name,
                fileSize: file.size,
                pageCount: result.pageCount,
                pdfId: data.data.pdfId
            });

        } catch (err) {
            alert(`Upload error: ${err.message}`);
        }
    };

    /**
     * Handle page drag start
     */
    const handlePageDragStart = useCallback((e, pageNumber) => {
        setSelectedPage(pageNumber);
        
        // Store page data for drop event
        e.dataTransfer.effectAllowed = 'copy';
        const data = JSON.stringify({
            pageNumber,
            fileName: pdfMetadata?.fileName
        });
        e.dataTransfer.setData('application/pdf-page', data);
        
        // Set a custom drag image (optional - makes it clear we're dragging)
        const dragImg = document.createElement('div');
        dragImg.textContent = `Page ${pageNumber}`;
        dragImg.style.cssText = 'position: absolute; top: -1000px; background: blue; color: white; padding: 10px; border-radius: 5px;';
        document.body.appendChild(dragImg);
        e.dataTransfer.setDragImage(dragImg, 50, 25);
        setTimeout(() => document.body.removeChild(dragImg), 0);
    }, [pdfMetadata]);

    /**
     * Handle page drop (this gets called by parent component)
     * Renders high-res version and uploads to backend
     */
    const handlePageDropInternal = async (pageNumber, position) => {
        if (!pdfFile || uploadingPage === pageNumber) return;

        setUploadingPage(pageNumber);

        try {
            // Render high-resolution version (4x scale for ultra-sharp quality)
            const canvas = await renderHighRes(pageNumber);
            
            // Convert canvas to data URL (base64 PNG) for tldraw
            const dataUrl = canvas.toDataURL('image/png', 1.0);

            // Add to canvas via parent callback
            if (onPageDrop) {
                onPageDrop({
                    pageNumber,
                    imageUrl: dataUrl,
                    position,
                    dimensions: {
                        width: canvas.width,
                        height: canvas.height
                    }
                });
            }

        } catch (err) {
            alert(`Failed to add page ${pageNumber}: ${err.message}`);
        } finally {
            setUploadingPage(null);
        }
    };

    /**
     * Reset sidebar
     */
    const handleReset = () => {
        cleanup();
        setPdfFile(null);
        setPdfMetadata(null);
        setSelectedPage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /**
     * Toggle sidebar open/close
     */
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
        renderAndDropPage: async (pageNumber, position) => {
            await handlePageDropInternal(pageNumber, position);
        }
    }));

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={`
                    fixed top-1/2 -translate-y-1/2 z-[9999]
                    transition-all duration-300 ease-in-out
                    bg-blue-500 hover:bg-blue-600 text-white
                    rounded-l-lg shadow-lg p-3
                    ${isOpen ? 'right-96' : 'right-0'}
                `}
                title={isOpen ? 'Close PDF Sidebar' : 'Open PDF Sidebar'}
            >
                {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>

            {/* Sidebar Panel */}
            <div
                className={`
                    fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl z-[9998]
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    flex flex-col
                `}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FileText size={24} />
                            <h2 className="text-lg font-bold">PDF Pages</h2>
                        </div>
                        {pdfFile && (
                            <button
                                onClick={handleReset}
                                className="hover:bg-blue-700 rounded-full p-1 transition-colors"
                                title="Clear PDF"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Upload Section */}
                    {!pdfFile && (
                        <div className="space-y-4">
                            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                                <p className="text-gray-600 mb-4">
                                    Upload a PDF to view and drag pages to canvas
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Choose PDF File
                                </button>
                                <p className="text-xs text-gray-500 mt-2">
                                    Max 25MB, up to 50 pages
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-600">Loading PDF...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* PDF Metadata */}
                    {pdfMetadata && !loading && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 truncate" title={pdfMetadata.fileName}>
                                {pdfMetadata.fileName}
                            </p>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{pdfMetadata.pageCount || pageCount} pages</span>
                                <span>{formatFileSize(pdfMetadata.fileSize)}</span>
                            </div>
                        </div>
                    )}

                    {/* Page Thumbnails Grid */}
                    {pdfFile && pdfMetadata && pdfMetadata.pageCount > 0 && !loading && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 font-medium">
                                Drag any page to the canvas
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {Array.from({ length: pdfMetadata.pageCount }, (_, i) => i + 1).map((pageNum) => (
                                    <PdfPageThumbnail
                                        key={pageNum}
                                        pageNumber={pageNum}
                                        renderThumbnail={renderThumbnail}
                                        onDragStart={handlePageDragStart}
                                        onPageClick={(num) => setSelectedPage(num)}
                                        isSelected={selectedPage === pageNum}
                                        pdfReady={pdfReady}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Uploading Indicator */}
                    {uploadingPage && (
                        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="text-sm">Processing page {uploadingPage}...</span>
                        </div>
                    )}
                </div>

                {/* Footer Instructions */}
                {pdfFile && (
                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <p className="text-xs text-gray-600 text-center">
                            💡 Drag a page thumbnail onto the canvas to add it as an image
                        </p>
                    </div>
                )}
            </div>
        </>
    );
});

PdfSidebar.displayName = 'PdfSidebar';

export default PdfSidebar;
