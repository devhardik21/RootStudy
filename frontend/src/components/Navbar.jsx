import React from 'react'
import { AppWindow, Stars ,Sparkles , LucideSend, Send } from 'lucide-react'
import { useState } from 'react';
import { AISidebar } from './AIsidebar';
import { useNavigate } from 'react-router-dom';
const Navbar = () => {
    const navigate = useNavigate() ; 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <div className="flex p-2 justify-between">
                <div className="flex">
                    <div className="flex">
                        <img src='/rootvestors-logo.png' className='w-full h-10'></img>
                    </div>
                    <div className="flex bg-green-600 p-1 rounded-2xl ml-8 justify-center align-center mt-1" onClick={()=>{
                        navigate('/groups')
                    }}>
                        <Send color='white' size={20} className='mr-0.5'></Send>
                        <span className='text-black font-bold text-sm'>Group</span>
                    </div>
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