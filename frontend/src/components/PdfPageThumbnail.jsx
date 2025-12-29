import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

/**
 * PdfPageThumbnail Component
 * Displays a single PDF page thumbnail with lazy loading
 * Supports drag-and-drop to canvas
 */
const PdfPageThumbnail = ({
    pageNumber,
    renderThumbnail,
    onDragStart,
    onPageClick,
    isSelected = false,
    pdfReady = false  // Add pdfReady prop
}) => {
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const thumbnailRef = useRef(null);
    const observerRef = useRef(null);
    const hasAttemptedLoad = useRef(false);

    /**
     * Lazy load thumbnail when element is visible AND PDF is ready
     */
    useEffect(() => {
        // Guard: Don't set up observer until PDF is ready
        if (!pdfReady) {
            return;
        }

        const observer = new IntersectionObserver(
            async (entries) => {
                const [entry] = entries;

                // Guard: Check pdfReady again before rendering
                if (entry.isIntersecting && !thumbnail && !hasAttemptedLoad.current && pdfReady) {
                    hasAttemptedLoad.current = true;
                    setLoading(true);
                    try {
                        const dataUrl = await renderThumbnail(pageNumber);
                        setThumbnail(dataUrl);
                        setError(null);
                    } catch {
                        setError('Failed to load thumbnail');
                    } finally {
                        setLoading(false);
                    }
                }
            },
            {
                root: null,
                rootMargin: '50px', // Start loading 50px before visible
                threshold: 0.1
            }
        );

        if (thumbnailRef.current) {
            observer.observe(thumbnailRef.current);
            observerRef.current = observer;
        }

        return () => {
            if (observerRef.current && thumbnailRef.current) {
                observerRef.current.unobserve(thumbnailRef.current);
            }
        };
    }, [pageNumber, renderThumbnail, thumbnail, pdfReady]);  // Add pdfReady to dependencies

    /**
     * Handle drag start
     */
    const handleDragStart = (e) => {
        if (onDragStart) {
            onDragStart(e, pageNumber);
        }
    };

    /**
     * Handle click
     */
    const handleClick = () => {
        if (onPageClick) {
            onPageClick(pageNumber);
        }
    };

    return (
        <div
            ref={thumbnailRef}
            className={`
                relative group cursor-grab active:cursor-grabbing
                border-2 rounded-2xl overflow-hidden
                transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                bg-white/5 backdrop-blur-sm
                ${isSelected
                    ? 'border-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] scale-[1.02]'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/10 hover:shadow-xl'
                }
            `}
            style={{ minHeight: '180px' }}
            draggable={!!thumbnail}
            onDragStart={handleDragStart}
            onClick={handleClick}
        >
            {/* Loading State */}
            {loading && !thumbnail && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1A2E]/50">
                    <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-2"></div>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Loading</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-red-500/5">
                    <div className="p-2 bg-red-500/20 rounded-xl mb-2">
                        <X size={20} className="text-red-400" />
                    </div>
                    <span className="text-[10px] text-red-400 font-bold text-center uppercase tracking-widest leading-tight">{error}</span>
                </div>
            )}

            {/* Thumbnail Image */}
            {thumbnail ? (
                <div className="relative w-full h-full flex items-center justify-center p-2">
                    <img
                        src={thumbnail}
                        alt={`Page ${pageNumber}`}
                        className="w-full h-auto max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-[1.05]"
                        draggable={false}
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-all duration-300 flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                            <div className="p-3 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/40">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            ) : !loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
                        <FileText size={24} className="text-slate-600" />
                    </div>
                </div>
            )}

            {/* Page Number Badge */}
            <div className="absolute top-3 left-3 z-10">
                <div className="px-2.5 py-1 bg-[#1A1A2E]/80 backdrop-blur-md border border-white/10 rounded-lg shadow-lg">
                    <span className="text-[10px] font-black text-white tracking-tighter">
                        PG. {pageNumber.toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Drag Hint */}
            {thumbnail && (
                <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <div className="py-1.5 bg-indigo-600 rounded-xl shadow-xl shadow-indigo-500/20 text-center border border-indigo-400/20">
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                            Drag to canvas
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfPageThumbnail;
