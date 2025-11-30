import React, { useState, useEffect } from 'react';
import { X, Users, Send, FileText, Mic, Image } from 'lucide-react'
import { LOCAL_URL } from '../api/api';

export default function GroupSelectorModal({ isOpen, onClose, pageData, attachments }) {
    const [groups, setGroups] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchGroups();
        }
    }, [isOpen]);

    const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${LOCAL_URL}/api/groups`);
            const data = await response.json();
            setGroups(data.groups || []);
        } catch (err) {
            setError('Failed to load groups');
            console.error('Error fetching groups:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleGroup = (groupId) => {
        setSelectedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleSend = async () => {
        if (selectedGroups.length === 0) return;

        setSending(true);
        setError(null);

        try {
            const formData = new FormData();

            // Add the page data - ensure pageImage is SVG
            const pageImage = pageData.pageImage || '';
            if (!pageImage.includes('<svg') || !pageImage.includes('</svg>')) {
                throw new Error('Page image must be a valid SVG');
            }

            formData.append('pageName', pageData.pageName || 'Untitled Page');
            formData.append('pageImage', pageImage);
            formData.append('sentGroups', JSON.stringify(selectedGroups));

            // Add file attachments
            if (attachments.pdf) {
                formData.append('attachments', attachments.pdf);
            }
            if (attachments.audio) {
                formData.append('attachments', attachments.audio);
            }
            const response = await fetch(`${LOCAL_URL}/api/create-page`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Page created successfully:', result);
                alert(`Page sent to ${selectedGroups.length} group(s) successfully!`);
                if (onClose) onClose();
                setSelectedGroups([]);
            } else {
                throw new Error(result.message || `Failed to create page: ${response.status}`);
            }
        } catch (err) {
            setError(err.message || 'Failed to send page');
            console.error('Error sending page:', err);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800">Select Groups</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Page: <strong>{pageData.pageName || 'Untitled Page'}</strong>
                        </p>

                        {/* Attachment Preview */}
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                                <Image className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">SVG Drawing</span>
                            </div>
                            {attachments.pdf && (
                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-700">PDF: {attachments.pdf.name}</span>
                                </div>
                            )}
                            {attachments.audio && (
                                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg">
                                    <Mic className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-700">Audio: {attachments.audio.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
                        disabled={sending}
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-4">
                            <p className="text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                            <button
                                onClick={fetchGroups}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && groups.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No groups available
                        </div>
                    )}

                    {!loading && !error && groups.length > 0 && (
                        <div className="space-y-3">
                            {groups.map((group) => (
                                <div
                                    key={group._id}
                                    onClick={() => !sending && toggleGroup(group._id)}
                                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedGroups.includes(group._id)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        } ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {/* Checkbox */}
                                    <div className="flex items-center justify-center w-5 h-5 mr-4">
                                        <div
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedGroups.includes(group._id)
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'border-gray-300'
                                                }`}
                                        >
                                            {selectedGroups.includes(group._id) && (
                                                <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    {/* Group Image */}
                                    <img
                                        src={group.groupImage}
                                        alt={group.groupName}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/56x56?text=Group';
                                        }}
                                    />

                                    {/* Group Info */}
                                    <div className="ml-4 flex-1">
                                        <h3 className="font-semibold text-gray-800 text-lg">
                                            {group.groupName}
                                        </h3>
                                        <div className="flex items-center text-gray-600 mt-1">
                                            <Users className="w-4 h-4 mr-1" />
                                            <span className="text-sm">
                                                {group.numberofStudents} member{group.numberofStudents !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-6 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-600">
                                {selectedGroups.length} group{selectedGroups.length !== 1 ? 's' : ''} selected
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                Includes: {['SVG Drawing', attachments.pdf && 'PDF', attachments.audio && 'Audio'].filter(Boolean).join(', ')}
                            </span>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={selectedGroups.length === 0 || sending}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${selectedGroups.length === 0 || sending
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {sending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Send
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}