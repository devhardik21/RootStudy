import React, { useState, useEffect } from 'react';
import { Search, Paperclip, FileText } from 'lucide-react';
import { LOCAL_URL } from '../api/api';
import Navbar from '../components/Navbar';

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${LOCAL_URL}/api/groups`);
            const data = await response.json();
            setGroups(data.groups || []);
            if (data.groups && data.groups.length > 0) {
                setSelectedGroup(data.groups[0]);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch groups');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredGroups = groups.filter(group =>
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (

        <div className="min-h-screen  bg-gradient-to-br from-[#1E1E32] to-[#3C3B65] flex items-center justify-center p-4">
            <div className="w-full max-w-7xl h-[90vh] bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden flex">

                {/* Left Sidebar - Groups List */}
                <div className="w-1/3 bg-slate-900/60 border-r border-slate-700/50 flex flex-col">
                    {/* Header */}
                    <div className="p-4 bg-slate-800/70 border-b border-slate-700/50">
                        <h1 className="text-xl font-semibold text-white mb-3">Groups</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Groups List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-32 text-slate-400">
                                Loading groups...
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-32 text-red-400">
                                {error}
                            </div>
                        ) : filteredGroups.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-slate-400">
                                No groups found
                            </div>
                        ) : (
                            filteredGroups.map((group) => (
                                <div
                                    key={group._id}
                                    onClick={() => setSelectedGroup(group)}
                                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-slate-700/30 ${selectedGroup?._id === group._id
                                        ? 'bg-slate-700/50'
                                        : 'hover:bg-slate-800/40'
                                        }`}
                                >
                                    <img
                                        src={group.groupImage}
                                        alt={group.groupName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-medium truncate">{group.groupName}</h3>
                                        <p className="text-slate-400 text-sm">
                                            {group.numberofStudents} students
                                        </p>
                                    </div>
                                    {(group.groupAttachments?.length > 0 || group.svgAttachments?.length > 0) && (
                                        <div className="text-blue-400 text-xs">
                                            {(group.groupAttachments?.length || 0) + (group.svgAttachments?.length || 0)} files
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Side - Attachments */}
                <div className="flex-1 flex flex-col bg-slate-800/30">
                    {selectedGroup ? (
                        <>
                            {/* Group Header */}
                            <div className="p-6 bg-slate-800/70 border-b border-slate-700/50">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={selectedGroup.groupImage}
                                        alt={selectedGroup.groupName}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <h2 className="text-2xl font-semibold text-white">{selectedGroup.groupName}</h2>
                                        <p className="text-slate-400">{selectedGroup.numberofStudents} students</p>
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Canvas Pages */}
                                {selectedGroup.svgAttachments && selectedGroup.svgAttachments.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <Paperclip className="w-5 h-5" />
                                            Canvas Pages ({selectedGroup.svgAttachments.length})
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {selectedGroup.svgAttachments.map((page) => (
                                                <div
                                                    key={page._id}
                                                    className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-colors"
                                                >
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-white font-medium truncate">{page.pageName}</h4>
                                                            <p className="text-slate-400 text-sm">
                                                                {formatDate(page.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Canvas Preview Image */}
                                                    <div className="mb-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                                                        <img
                                                            src={page.pageImage}
                                                            alt={page.pageName}
                                                            className="w-full h-auto rounded"
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Transcription Display */}
                                                    {page.transcription && (
                                                        <div className="mb-3 p-3 bg-purple-900/30 rounded-lg border border-purple-700/30">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                                </svg>
                                                                <span className="text-purple-300 text-sm font-medium">Transcription</span>
                                                            </div>
                                                            <p className="text-slate-300 text-sm">{page.transcription}</p>
                                                        </div>
                                                    )}

                                                    {page.attachments && page.attachments.length > 0 && (
                                                        <div className="space-y-2 pt-3 border-t border-slate-700/30">
                                                            {page.attachments.map((att, idx) => (
                                                                <a
                                                                    key={idx}
                                                                    href={att.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                                                                >
                                                                    <FileText className="w-4 h-4" />
                                                                    <span className="truncate">{att.type.toUpperCase()}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Regular Group Attachments */}
                                {selectedGroup.groupAttachments && selectedGroup.groupAttachments.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Group Attachments ({selectedGroup.groupAttachments.length})
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {selectedGroup.groupAttachments.map((attachment, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-colors"
                                                >
                                                    <a
                                                        href={attachment.url || attachment}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 text-blue-400 hover:text-blue-300"
                                                    >
                                                        <FileText className="w-5 h-5" />
                                                        <span className="truncate">Attachment {idx + 1}</span>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No Attachments Message */}
                                {(!selectedGroup.svgAttachments || selectedGroup.svgAttachments.length === 0) &&
                                    (!selectedGroup.groupAttachments || selectedGroup.groupAttachments.length === 0) && (
                                        <div className="flex items-center justify-center h-64 text-slate-400">
                                            No attachments in this group
                                        </div>
                                    )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            Select a group to view attachments
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}