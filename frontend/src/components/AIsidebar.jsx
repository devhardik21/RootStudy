import React, { useState } from 'react';
import { X, Sparkles, Image, Type, Send, Loader2, Youtube } from 'lucide-react';
import { DEPLOYED_URL } from '../api/api';

export const AISidebar = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('text');
    const [textPrompt, setTextPrompt] = useState('');
    const [imagePrompt, setImagePrompt] = useState('');
    const [youtubePrompt, setYoutubePrompt] = useState('');
    const [textResponse, setTextResponse] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleTextGenerate = async () => {
        if (!textPrompt.trim()) return;
        setIsLoading(true);
        setTextResponse('');

        try {
            const response = await fetch(`${DEPLOYED_URL}/api/text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: textPrompt })
            });
            const data = await response.json();
            setTextResponse(data.text || 'No response from AI.');
        } catch (error) {
            setTextResponse('Error fetching AI response.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageGenerate = async () => {
        if (!imagePrompt.trim()) return;
        setIsLoading(true);
        setImageUrl('');

        try {
            const response = await fetch(`${DEPLOYED_URL}/api/image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: imagePrompt })
            });
            const data = await response.json();
            setImageUrl(data.imageUrl);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleYoutubeSearch = async () => {
        if (!youtubePrompt.trim()) return;
        setIsLoading(true);
        setVideos([]);

        try {
            const response = await fetch(`${DEPLOYED_URL}/api/youtube`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: youtubePrompt })
            });
            const data = await response.json();
            setVideos(data.videos || []);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`fixed top-0 right-0 h-full w-96 bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-9999 ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
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
                    className={`flex-1 flex items-center justify-center gap-2 p-3 transition-colors ${
                        activeTab === 'text'
                            ? 'bg-slate-700 text-white border-b-2 border-green-400'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Type className="w-4 h-4" />
                    Text
                </button>
                <button
                    onClick={() => setActiveTab('image')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 transition-colors ${
                        activeTab === 'image'
                            ? 'bg-slate-700 text-white border-b-2 border-green-400'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Image className="w-4 h-4" />
                    Image
                </button>
                <button
                    onClick={() => setActiveTab('youtube')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 transition-colors ${
                        activeTab === 'youtube'
                            ? 'bg-slate-700 text-white border-b-2 border-green-400'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Youtube className="w-4 h-4" />
                    Videos
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
                ) : activeTab === 'image' ? (
                    <ImageGenerationTab
                        prompt={imagePrompt}
                        setPrompt={setImagePrompt}
                        imageUrl={imageUrl}
                        isLoading={isLoading}
                        onGenerate={handleImageGenerate}
                    />
                ) : (
                    <YoutubeTab
                        prompt={youtubePrompt}
                        setPrompt={setYoutubePrompt}
                        videos={videos}
                        isLoading={isLoading}
                        onSearch={handleYoutubeSearch}
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

// YouTube Tab Component
const YoutubeTab = ({ prompt, setPrompt, videos, isLoading, onSearch }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-white text-sm font-medium mb-2">
                    Search for videos
                </label>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                    placeholder="e.g., Machine Learning tutorial"
                    className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
            </div>

            <button
                onClick={onSearch}
                disabled={isLoading || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                    </>
                ) : (
                    <>
                        <Youtube className="w-4 h-4" />
                        Search Videos
                    </>
                )}
            </button>

            {videos.length > 0 && (
                <div className="space-y-3">
                    {videos.map((video) => (
                        <div
                            key={video.videoId}
                            className="bg-slate-700 rounded-lg overflow-hidden border border-slate-600 hover:border-red-500 transition-colors"
                        >
                            
                               <a href={video.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-3">
                                    <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                                        {video.title}
                                    </h4>
                                    <p className="text-gray-400 text-xs mb-2">
                                        {video.channelTitle}
                                    </p>
                                    <p className="text-gray-500 text-xs line-clamp-2">
                                        {video.description}
                                    </p>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && videos.length === 0 && prompt && (
                <div className="text-center text-gray-400 py-8">
                    No videos found. Try a different search term.
                </div>
            )}
        </div>
    );
};