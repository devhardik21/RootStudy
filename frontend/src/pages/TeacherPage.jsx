import React, { useState, useRef } from 'react'
import { Tldraw, AssetRecordType, useEditor } from 'tldraw'
import 'tldraw/tldraw.css'
import Navbar from '../components/Navbar'
import GroupSelectorModal from '../components/Modal'

// VoiceRecorderButton as a separate component that uses useEditor internally
function VoiceRecorderButton({ onRecordingComplete }) {
    const editor = useEditor();
    const [recording, setRecording] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [audioFile, setAudioFile] = useState(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], "recording.webm", { type: "audio/webm" });

                console.log("Audio file created:", file);
                setAudioFile(file);

                // Notify parent component about the recording
                if (onRecordingComplete) {
                    onRecordingComplete(file);
                }

                // Create visual indicator in the editor
                const assetId = AssetRecordType.createId();
                editor.createAssets([
                    {
                        id: assetId,
                        type: 'image',
                        typeName: 'asset',
                        props: {
                            name: 'audio-icon.png',
                            src: '/voice-icon.png',
                            w: 60,
                            h: 60,
                            mimeType: 'image/png',
                            isAnimated: false,
                        },
                        meta: {},
                    },
                ]);

                editor.createShape({
                    type: 'image',
                    x: Math.random() * 400 + 100,
                    y: Math.random() * 400 + 100,
                    props: {
                        assetId: assetId,
                        w: 60,
                        h: 60
                    }
                });

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setRecorder(mediaRecorder);
            setRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Error accessing microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (recorder && recording) {
            recorder.stop();
            setRecording(false);
        }
    };

    const clearRecording = () => {
        setAudioFile(null);
        if (onRecordingComplete) {
            onRecordingComplete(null);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                className={`px-3 py-1 rounded-lg text-white text-sm ${recording ? "bg-red-600" : "bg-green-600"
                    }`}
                onClick={recording ? stopRecording : startRecording}
            >
                {recording ? "Stop Recording" : "Record Voice"}
            </button>
            {audioFile && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600">✓ Recording ready</span>
                    <button
                        onClick={clearRecording}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}

// PdfUploadButton as a separate component that uses useEditor internally
function PdfUploadButton({ onPdfUpload }) {
    const editor = useEditor();
    const fileInputRef = useRef(null);
    const [pdfFile, setPdfFile] = useState(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log("Uploaded PDF:", file);
        setPdfFile(file);

        // Notify parent component about the PDF
        if (onPdfUpload) {
            onPdfUpload(file);
        }

        // Create visual indicator in the editor
        const assetId = AssetRecordType.createId();
        editor.createAssets([
            {
                id: assetId,
                type: 'image',
                typeName: 'asset',
                props: {
                    name: 'pdf-icon.png',
                    src: '/pdf.png',
                    w: 80,
                    h: 80,
                    mimeType: 'image/png',
                    isAnimated: false,
                },
                meta: {},
            },
        ]);

        editor.createShape({
            type: 'image',
            x: Math.random() * 400 + 100,
            y: Math.random() * 400 + 100,
            props: {
                assetId: assetId,
                w: 80,
                h: 80
            }
        });
    };

    const clearPdf = () => {
        setPdfFile(null);
        if (onPdfUpload) {
            onPdfUpload(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex items-center gap-2">
            <label className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm cursor-pointer">
                Upload PDF
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleUpload}
                />
            </label>
            {pdfFile && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600">✓ PDF ready</span>
                    <button
                        onClick={clearPdf}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}

// Dark Mode Button Component for Tldraw
function DarkModeButton() {
    const editor = useEditor()

    const handleClick = () => {
        const isDark = editor.user.getIsDarkMode()
        editor.user.updateUserPreferences({ colorScheme: isDark ? 'light' : 'dark' })
    }

    return (
        <button
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            onClick={handleClick}
        >
            {editor.user.getIsDarkMode() ? '☀️ Light' : '🌙 Dark'}
        </button>
    )
}

// Export SVG Button Component for Tldraw
function ExportSVGButton({ onOpenModal }) {
    const editor = useEditor()
    const [pageName, setPageName] = useState('My Drawing');

    const handleExportSVG = async () => {
        try {
            const shapeIds = editor.getCurrentPageShapeIds()
            if (shapeIds.size === 0) {
                return alert('No shapes on the canvas to export')
            }

            // Export as SVG using the proper Tldraw API
            const { blob } = await editor.toImage([...shapeIds], {
                format: 'svg',
                background: false
            })

            // Convert blob to SVG string
            const svgText = await blob.text()

            if (onOpenModal) {
                onOpenModal(svgText, pageName)
            }
        } catch (error) {
            console.error('Error exporting SVG:', error)
            alert('Error exporting drawing as SVG. Please try again.')
        }
    }

    return (
        <div className="flex items-center gap-2" style={{ pointerEvents: 'all' }}>
            <input
                type="text"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                className="px-2 py-1 rounded border bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Page name"
                style={{ minWidth: '120px' }}
            />
            <button
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                onClick={handleExportSVG}
            >
                Export SVG
            </button>
        </div>
    )
}

// Create wrapper components that will be used inside Tldraw
const createComponents = (openModal, onPdfUpload, onRecordingComplete) => ({
    TopPanel: function TopPanel() {
        return (
            <div style={{
                pointerEvents: 'all',
                display: 'flex',
                gap: '8px',
                padding: '8px',
                alignItems: 'center'
            }}>
                <ExportSVGButton onOpenModal={openModal} />
                <DarkModeButton />
            </div>
        );
    },
    SharePanel: function SharePanel() {
        return (
            <div
                style={{
                    pointerEvents: 'all',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '14px',
                    padding: '8px'
                }}
            >
                <PdfUploadButton onPdfUpload={onPdfUpload} />
                <VoiceRecorderButton onRecordingComplete={onRecordingComplete} />
            </div>
        );
    }
});

// Main Teacher Page Component
const TeacherPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pageData, setPageData] = useState({
        pageName: '',
        pageImage: ''
    });
    const [attachments, setAttachments] = useState({
        pdf: null,
        audio: null
    });

    const handlePdfUpload = (pdfFile) => {
        setAttachments(prev => ({
            ...prev,
            pdf: pdfFile
        }));
    };

    const handleRecordingComplete = (audioFile) => {
        setAttachments(prev => ({
            ...prev,
            audio: audioFile
        }));
    };

    const openModal = (svgContent, pageName) => {
        if (svgContent) {
            setPageData({
                pageName: pageName || 'My Drawing',
                pageImage: svgContent
            });
            setIsModalOpen(true);
        } else {
            alert('No SVG content to export');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        // Clear attachments when modal closes
        setAttachments({ pdf: null, audio: null });
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 fixed top-0 left-0 right-0 bottom-0 flex flex-col">
            <Navbar />
            {/* Tldraw Canvas */}
            <div className="flex-1 m-4 rounded-2xl shadow-2xl overflow-hidden bg-white">
                <Tldraw
                    components={createComponents(openModal, handlePdfUpload, handleRecordingComplete)}
                    persistenceKey="teacher-page"
                    autoFocus
                />
                <GroupSelectorModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    pageData={pageData}
                    attachments={attachments}
                />
            </div>
        </div>
    )
}

export default TeacherPage