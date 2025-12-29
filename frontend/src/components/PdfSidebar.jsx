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
                    transition-all duration-500 ease-in-out
                    bg-indigo-600 hover:bg-indigo-500 text-white
                    rounded-l-2xl shadow-2xl p-4 group
                    ${isOpen ? 'right-[400px]' : 'right-0'}
                `}
                title={isOpen ? 'Close PDF Sidebar' : 'Open PDF Sidebar'}
            >
                <div className="relative">
                    {isOpen ? <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />}
                    {!isOpen && pdfFile && (
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-indigo-600 animate-pulse" />
                    )}
                </div>
            </button>

            {/* Sidebar Panel */}
            <div
                className={`
                    fixed top-4 bottom-4 right-4 w-[400px] 
                    bg-[#1A1A2E]/80 backdrop-blur-2xl border border-white/10 
                    rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-[9998]
                    transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0'}
                    flex flex-col overflow-hidden
                `}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-br from-indigo-600/20 to-violet-600/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
                                <FileText size={22} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg tracking-tight">PDF Resources</h2>
                                <p className="text-indigo-300 text-xs font-medium uppercase tracking-wider">
                                    {pdfFile ? 'Select Pages' : 'Upload Document'}
                                </p>
                            </div>
                        </div>
                        {pdfFile && (
                            <button
                                onClick={handleReset}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all duration-200 border border-white/5 hover:border-red-500/20"
                                title="Clear PDF"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {/* Upload Section */}
                    {!pdfFile && (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-square max-w-[280px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-3xl hover:border-indigo-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="w-20 h-20 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="text-indigo-400" size={40} />
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-2">Drop your PDF here</h3>
                                <p className="text-slate-400 text-sm text-center mb-6">
                                    Upload a PDF to view and drag pages to your canvas
                                </p>
                                <div className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20">
                                    Browse Files
                                </div>
                                <p className="text-[10px] text-slate-500 mt-6 font-bold uppercase tracking-widest">
                                    Max 25MB • Up to 50 pages
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
                        <div className="h-full flex flex-col items-center justify-center py-12">
                            <div className="relative w-16 h-16 mb-6">
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                            </div>
                            <p className="text-indigo-300 font-medium animate-pulse">Processing PDF...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                            <div className="p-1.5 bg-red-500/20 rounded-lg">
                                <X size={16} className="text-red-400" />
                            </div>
                            <p className="text-red-400 text-sm font-medium leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* PDF Metadata */}
                    {pdfMetadata && !loading && (
                        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <FileText size={18} className="text-emerald-400" />
                                </div>
                                <p className="text-sm font-bold text-white truncate flex-1" title={pdfMetadata.fileName}>
                                    {pdfMetadata.fileName}
                                </p>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                    {pdfMetadata.pageCount || pageCount} pages
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                    {formatFileSize(pdfMetadata.fileSize)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Page Thumbnails Grid */}
                    {pdfFile && pdfMetadata && pdfMetadata.pageCount > 0 && !loading && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Page Thumbnails
                                </p>
                                <span className="text-[10px] text-indigo-400 font-bold bg-indigo-400/10 px-2 py-0.5 rounded-full">
                                    Drag to Canvas
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 z-[10000] animate-in slide-in-from-bottom-4">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span className="text-sm font-bold tracking-tight">Adding page {uploadingPage} to canvas...</span>
                        </div>
                    )}
                </div>

                {/* Footer Instructions */}
                {pdfFile && (
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                            <span>Interactive PDF Viewer</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
});

PdfSidebar.displayName = 'PdfSidebar';

export default PdfSidebar;
