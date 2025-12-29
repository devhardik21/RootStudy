import React, { useState, useEffect, useRef } from 'react';

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
                border-2 rounded-lg overflow-hidden
                transition-all duration-200 ease-in-out
                bg-gray-50
                ${isSelected 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                }
            `}
            style={{ minHeight: '150px', backgroundColor: '#ffffff' }}
            draggable={!!thumbnail}
            onDragStart={handleDragStart}
            onClick={handleClick}
        >
            {/* Loading State */}
            {loading && !thumbnail && (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="w-full h-32 bg-red-50 flex flex-col items-center justify-center p-2">
                    <svg className="w-8 h-8 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-red-600 text-center">{error}</span>
                </div>
            )}

            {/* Thumbnail Image */}
            {thumbnail && (
                <>
                    <img
                        src={thumbnail}
                        alt={`Page ${pageNumber}`}
                        className="w-full h-auto object-contain block"
                        draggable={false}
                        style={{ 
                            backgroundColor: '#ffffff', 
                            minHeight: '120px',
                            display: 'block',
                            position: 'relative',
                            zIndex: 1
                        }}
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-transparent group-hover:bg-blue-500 group-hover:bg-opacity-5 transition-all duration-200 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-12 h-12 text-blue-600 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                        </div>
                    </div>
                </>
            )}

            {/* Page Number Badge */}
            <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-md px-2 py-1 shadow-sm">
                <span className="text-xs font-semibold text-gray-700">
                    {pageNumber}
                </span>
            </div>

            {/* Drag Hint */}
            {thumbnail && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-blue-500 bg-opacity-90 rounded-md px-2 py-1 shadow-sm">
                        <span className="text-xs font-medium text-white">
                            Drag to canvas
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfPageThumbnail;
