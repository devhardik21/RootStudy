import React from 'react'
import { AppWindow, Stars, Sparkles, LucideSend, Send, Menu, BookOpen } from 'lucide-react'
import { useState } from 'react';
import { AISidebar } from './AIsidebar';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleTopicSidebar, isTopicSidebarOpen }) => {
    const navigate = useNavigate();
    const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);

    return (
        <>
            <nav className="flex items-center justify-between px-6 py-3 bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <div className="flex cursor-pointer" onClick={() => navigate('/')}>
                        <img src='./white-logo.png' alt="Logo" className='h-8 object-contain' />
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onToggleTopicSidebar}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${isTopicSidebarOpen
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            Topics
                        </button>

                        <button
                            onClick={() => navigate('/groups')}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/20"
                        >
                            <Send className="w-4 h-4" />
                            Groups
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAISidebarOpen(true)}
                        className="group relative flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 shadow-xl shadow-indigo-500/25 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                        <span>RootStudyAI</span>
                    </button>
                </div>
            </nav>

            <AISidebar isOpen={isAISidebarOpen} onClose={() => setIsAISidebarOpen(false)} />
        </>
    );
};

export default Navbar