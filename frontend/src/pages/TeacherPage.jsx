import React, { useState, useRef } from 'react'
import { Tldraw, AssetRecordType, useEditor, getSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import Navbar from '../components/Navbar'
import GroupSelectorModal from '../components/Modal'

// VoiceRecorderButton with Web Speech API transcription
function VoiceRecorderButton({ onRecordingComplete, onTranscriptionUpdate }) {
    const editor = useEditor();
    const [recording, setRecording] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [recognition, setRecognition] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [textShapeId, setTextShapeId] = useState(null);

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

                if (onRecordingComplete) {
                    onRecordingComplete(file);
                }

                // Create visual indicator
                const assetId = AssetRecordType.createId();
                editor.createAssets([{
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
                }]);

                editor.createShape({
                    type: 'image',
                    x: Math.random() * 400 + 100,
                    y: Math.random() * 400 + 100,
                    props: { assetId: assetId, w: 60, h: 60 }
                });

                stream.getTracks().forEach(track => track.stop());
            };

            // Web Speech API for transcription
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = true;
                recognitionInstance.interimResults = true;
                recognitionInstance.lang = 'en-US';

                let finalTranscript = '';

                recognitionInstance.onresult = (event) => {
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    const fullText = finalTranscript + interimTranscript;
                    setTranscription(fullText);

                    if (onTranscriptionUpdate) {
                        onTranscriptionUpdate(finalTranscript.trim());
                    }

                    // Update or create text shape
                    if (textShapeId) {
                        const shape = editor.getShape(textShapeId);
                        if (shape && shape.type === 'text') {
                            editor.updateShape({
                                id: textShapeId,
                                type: 'text',
                                props: { 
                                ...shape.props,
                                text: fullText 
                            }
                            });
                        }
                    } else {
                        const id = editor.createShapeId();
                        editor.createShape({
                            id,
                            type: 'text',
                            x: 100,
                            y: 100,
                            props: { 
                                text: fullText,
                                size: 'm',
                                w: 400,
                                autoSize: false
                            }
                        });
                        setTextShapeId(id);
                    }
                };

                recognitionInstance.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                };

                recognitionInstance.start();
                setRecognition(recognitionInstance);
            }

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
        if (recognition) {
            recognition.stop();
        }
    };

    const clearRecording = () => {
        setAudioFile(null);
        setTranscription('');
        setTextShapeId(null);
        if (onRecordingComplete) onRecordingComplete(null);
        if (onTranscriptionUpdate) onTranscriptionUpdate('');
    };

    return (
        <div className="flex items-center gap-2">
            <button
                className={`px-3 py-1 rounded-lg text-white text-sm ${recording ? "bg-red-600" : "bg-green-600"}`}
                onClick={recording ? stopRecording : startRecording}
            >
                {recording ? "Stop Recording" : "Record Voice"}
            </button>
            {audioFile && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600">✓ Recording ready</span>
                    {transcription && <span className="text-xs text-blue-600">📝 Transcribed</span>}
                    <button onClick={clearRecording} className="px-2 py-1 bg-gray-500 text-white rounded text-xs">
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}

// PdfUploadButton component
function PdfUploadButton({ onPdfUpload }) {
    const editor = useEditor();
    const fileInputRef = useRef(null);
    const [pdfFile, setPdfFile] = useState(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log("Uploaded PDF:", file);
        setPdfFile(file);

        if (onPdfUpload) onPdfUpload(file);

        const assetId = AssetRecordType.createId();
        editor.createAssets([{
            id: assetId,
            type: 'image',
            typeName: 'asset',
            props: {
                name: 'pdf-icon.png',
                src: '/pdf-icon.png',
                w: 80,
                h: 80,
                mimeType: 'image/png',
                isAnimated: false,
            },
            meta: {},
        }]);

        editor.createShape({
            type: 'image',
            x: Math.random() * 400 + 100,
            y: Math.random() * 400 + 100,
            props: { assetId: assetId, w: 80, h: 80 }
        });
    };

    const clearPdf = () => {
        setPdfFile(null);
        if (onPdfUpload) onPdfUpload(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex items-center gap-2">
            <label className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm cursor-pointer">
                Upload PDF
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
            </label>
            {pdfFile && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600">✓ PDF ready</span>
                    <button onClick={clearPdf} className="px-2 py-1 bg-gray-500 text-white rounded text-xs">
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}

// Dark Mode Button
function DarkModeButton() {
    const editor = useEditor()

    const handleClick = () => {
        const isDark = editor.user.getIsDarkMode()
        editor.user.updateUserPreferences({ colorScheme: isDark ? 'light' : 'dark' })
    }

    return (
        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm" onClick={handleClick}>
            {editor.user.getIsDarkMode() ? '☀️ Light' : '🌙 Dark'}
        </button>
    )
}

// Export Canvas Button - exports JSON + PNG
function ExportCanvasButton({ onOpenModal, transcription }) {
    const editor = useEditor()
    const [pageName, setPageName] = useState('My Drawing');

    const handleExportCanvas = async () => {
        try {
            const shapeIds = editor.getCurrentPageShapeIds()
            if (shapeIds.size === 0) {
                return alert('No shapes on the canvas to export')
            }

            // Get JSON snapshot of canvas
            const { document, session } = getSnapshot(editor.store)

            // Generate preview image (PNG)
            const { blob } = await editor.toImage([...shapeIds], {
                format: 'png',
                background: true
            })

            if (onOpenModal) {
                onOpenModal({ document, session }, blob, pageName, transcription)
            }
        } catch (error) {
            console.error('Error exporting canvas:', error)
            alert('Error exporting canvas. Please try again.')
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
                onClick={handleExportCanvas}
            >
                Save Page
            </button>
        </div>
    )
}

// Create wrapper components for Tldraw
const createComponents = (openModal, onPdfUpload, onRecordingComplete, onTranscriptionUpdate, transcription) => ({
    TopPanel: function TopPanel() {
        return (
            <div style={{ pointerEvents: 'all', display: 'flex', gap: '8px', padding: '8px', alignItems: 'center' }}>
                <ExportCanvasButton onOpenModal={openModal} transcription={transcription} />
                <DarkModeButton />
            </div>
        );
    },
    SharePanel: function SharePanel() {
        return (
            <div style={{ pointerEvents: 'all', display: 'flex', justifyContent: 'center', gap: '14px', padding: '8px' }}>
                <PdfUploadButton onPdfUpload={onPdfUpload} />
                <VoiceRecorderButton onRecordingComplete={onRecordingComplete} onTranscriptionUpdate={onTranscriptionUpdate} />
            </div>
        );
    }
});

// Main Teacher Page Component
const TeacherPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pageData, setPageData] = useState({
        pageName: '',
        canvasData: null,
        imageBlob: null
    });
    const [attachments, setAttachments] = useState({
        pdf: null,
        audio: null
    });
    const [transcription, setTranscription] = useState('');

    const handlePdfUpload = (pdfFile) => {
        setAttachments(prev => ({ ...prev, pdf: pdfFile }));
    };

    const handleRecordingComplete = (audioFile) => {
        setAttachments(prev => ({ ...prev, audio: audioFile }));
    };

    const handleTranscriptionUpdate = (text) => {
        setTranscription(text);
    };

    const openModal = (canvasSnapshot, imageBlob, pageName, transcriptionText) => {
        if (canvasSnapshot && imageBlob) {
            setPageData({
                pageName: pageName || 'My Drawing',
                canvasData: canvasSnapshot,
                imageBlob: imageBlob
            });
            setIsModalOpen(true);
        } else {
            alert('No canvas content to export');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setAttachments({ pdf: null, audio: null });
        setTranscription('');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 fixed top-0 left-0 right-0 bottom-0 flex flex-col">
            <Navbar />
            <div className="flex-1 m-4 rounded-2xl shadow-2xl overflow-hidden bg-white">
                <Tldraw
                    components={createComponents(openModal, handlePdfUpload, handleRecordingComplete, handleTranscriptionUpdate, transcription)}
                    persistenceKey="teacher-page"
                    autoFocus
                />
                <GroupSelectorModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    pageData={pageData}
                    attachments={attachments}
                    transcription={transcription} 
                />
            </div>
        </div>
    )
}

export default TeacherPage