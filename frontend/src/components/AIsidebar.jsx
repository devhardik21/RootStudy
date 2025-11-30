import React, { useState } from 'react';
import { X, Sparkles, Image, Type, Send, Loader2 } from 'lucide-react';
// import { LOCAL_URL } from '../api/api';
import { DEPLOYED_URL } from '../api/api';
// AI Sidebar Component
export const AISidebar = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('text');
    const [textPrompt, setTextPrompt] = useState('');
    const [imagePrompt, setImagePrompt] = useState('');
    const [textResponse, setTextResponse] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleTextGenerate = async () => {
        if (!textPrompt.trim()) return;

        setIsLoading(true);
        setTextResponse('');

        try {
            const response = await fetch(`${DEPLOYED_URL}/api/text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: textPrompt })
            });
            const data = await response.json();
            setTextResponse(data.text || 'No response from AI.');
            setIsLoading(false);
        } catch (error) {
            setTextResponse('Error fetching AI response.');
            setIsLoading(false);
        }
    };

    const handleImageGenerate = async () => {
        if (!imagePrompt.trim()) return;

        setIsLoading(true);
        setImageUrl('');

        // Simulated API call with placeholder image
        setTimeout(() => {
            setImageUrl(`https://picsum.photos/400/400?random=${Date.now()}`);
            setIsLoading(false);
        }, 2000);

        /* Real API call example (commented out):
        try {
          const response = await fetch('YOUR_IMAGE_API_ENDPOINT', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: JSON.stringify({ prompt: imagePrompt })
          });
          const data = await response.json();
          setImageUrl(data.imageUrl);
          setIsLoading(false);
        } catch (error) {
          console.error('Error:', error);
          setIsLoading(false);
        }
        */
    };

    return (
        <div
            className={`fixed top-0 right-0 h-full w-96 bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-9999 ${isOpen ? ' translate-x-0' : 'translate-x-full'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-white font-bold text-lg">RootStudy AI</h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('text')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 transition-colors ${activeTab === 'text'
                        ? 'bg-slate-700 text-white border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <Type className="w-4 h-4" />
                    Text Generation
                </button>
                <button
                    onClick={() => setActiveTab('image')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 transition-colors ${activeTab === 'image'
                        ? 'bg-slate-700 text-white border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <Image className="w-4 h-4" />
                    Image Generation
                </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto h-[calc(100%-8rem)]">
                {activeTab === 'text' ? (
                    <TextGenerationTab
                        prompt={textPrompt}
                        setPrompt={setTextPrompt}
                        response={textResponse}
                        isLoading={isLoading}
                        onGenerate={handleTextGenerate}
                    />
                ) : (
                    <ImageGenerationTab
                        prompt={imagePrompt}
                        setPrompt={setImagePrompt}
                        imageUrl={imageUrl}
                        isLoading={isLoading}
                        onGenerate={handleImageGenerate}
                    />
                )}
            </div>
        </div>
    );
};

// Text Generation Tab Component
const TextGenerationTab = ({ prompt, setPrompt, response, isLoading, onGenerate }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-white text-sm font-medium mb-2">
                    Enter your prompt
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask me anything..."
                    className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                    rows={4}
                />
            </div>

            <button
                onClick={onGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        Generate Text
                    </>
                )}
            </button>

            {response && (
                <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        AI Response
                    </h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
                </div>
            )}
        </div>
    );
};

// Image Generation Tab Component
const ImageGenerationTab = ({ prompt, setPrompt, imageUrl, isLoading, onGenerate }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-white text-sm font-medium mb-2">
                    Describe the image you want
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A beautiful sunset over mountains..."
                    className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                    rows={4}
                />
            </div>

            <button
                onClick={onGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Image...
                    </>
                ) : (
                    <>
                        <Image className="w-4 h-4" />
                        Generate Image
                    </>
                )}
            </button>

            {imageUrl && (
                <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        Generated Image
                    </h3>
                    <img
                        src={imageUrl}
                        alt="Generated"
                        className="w-full rounded-lg shadow-lg"
                    />
                    <button
                        onClick={() => {
                            const a = document.createElement('a');
                            a.href = imageUrl;
                            a.download = 'generated-image.png';
                            a.click();
                        }}
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Download Image
                    </button>
                </div>
            )}
        </div>
    );
};