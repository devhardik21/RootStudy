import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Menu, X, GraduationCap } from 'lucide-react';

export const TopicSidebar = ({ topics, currentSubtopic, onSubtopicClick, isOpen }) => {
    const [expandedTopics, setExpandedTopics] = useState(new Set(topics.map(t => t.id)));

    const toggleTopic = (topicId) => {
        const newExpanded = new Set(expandedTopics);
        if (newExpanded.has(topicId)) {
            newExpanded.delete(topicId);
        } else {
            newExpanded.add(topicId);
        }
        setExpandedTopics(newExpanded);
    };

    if (!isOpen) return null;

    return (
        <aside
            className="w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-left-4"
        >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-br from-indigo-600/20 to-violet-600/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg tracking-tight">Course Topics</h2>
                        <p className="text-indigo-300 text-xs font-medium uppercase tracking-wider">High School Physics</p>
                    </div>
                </div>
            </div>

            {/* Topics List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {topics.map((topic) => (
                    <div key={topic.id} className="space-y-2">
                        {/* Topic Header */}
                        <button
                            onClick={() => toggleTopic(topic.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${expandedTopics.has(topic.id)
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className={`transition-transform duration-200 ${expandedTopics.has(topic.id) ? 'rotate-90' : ''}`}>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm flex-1 text-left">
                                {topic.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                                {topic.subtopics.length}
                            </span>
                        </button>

                        {/* Subtopics */}
                        {expandedTopics.has(topic.id) && (
                            <div className="ml-4 pl-4 border-l border-white/10 space-y-1 animate-in slide-in-from-top-2 duration-300">
                                {topic.subtopics.map((subtopic) => (
                                    <button
                                        key={subtopic.id}
                                        onClick={() => onSubtopicClick(topic.id, subtopic.id, subtopic.canvasY)}
                                        className={`w-full text-left p-2.5 px-4 rounded-lg text-sm transition-all duration-200 relative group ${currentSubtopic === subtopic.id
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentSubtopic === subtopic.id
                                                    ? 'bg-white scale-125'
                                                    : 'bg-slate-600 group-hover:bg-slate-400'
                                                }`} />
                                            <span className="font-medium">{subtopic.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                    <span>Progress</span>
                    <span>{topics.reduce((acc, topic) => acc + topic.subtopics.length, 0)} Topics</span>
                </div>
            </div>
        </aside>
    );
};
