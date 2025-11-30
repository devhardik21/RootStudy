import React from 'react'
import { AppWindow, Stars ,Sparkles } from 'lucide-react'
import { useState } from 'react';
import { AISidebar } from './AIsidebar';
const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <div className="flex p-2 justify-between">
                <div className="flex">
                    <AppWindow color='white'></AppWindow>
                    <h1 className="font-bold ml-2">
                        <span className="text-green-400">Root</span>
                        <span className="text-white">Study</span>
                    </h1>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="bg-white rounded-3xl p-2 text-sm font-bold flex items-center gap-2 text-gray-900 hover:bg-gray-100 transition-colors"
                >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    RootStudyAI
                </button>
            </div>

            <AISidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
  };
export default Navbar