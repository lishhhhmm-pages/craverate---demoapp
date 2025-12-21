
import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Mail, MessageSquare, Twitter, Copy, Check } from 'lucide-react';
import { USERS } from '../mockData';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [sharingStatus, setSharingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setIsVisible(true);
        setSentTo([]);
        setCopied(false);
        setSharingStatus(null);
    } else {
        setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleCopy = () => {
    setCopied(true);
    // Real implementation would use navigator.clipboard
    navigator.clipboard?.writeText(window.location.href);
    setTimeout(() => {
        onClose();
    }, 1000);
  };

  const handleSendToUser = (userId: string) => {
    if (sentTo.includes(userId)) return;
    setSentTo([...sentTo, userId]);
  };

  const handleExternalShare = (platform: string) => {
    setSharingStatus(`Sharing to ${platform}...`);
    setTimeout(() => {
      setSharingStatus(`Shared successfully!`);
      setTimeout(onClose, 800);
    }, 1000);
  };

  if (!isVisible) return null;

  // Mock friends list
  const friends = Object.values(USERS).filter(u => u.id !== 'u1');

  return (
    <div className={`fixed inset-0 z-[100] flex items-end justify-center pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div 
        className={`relative bg-gray-50 w-full max-w-md rounded-t-3xl shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-3xl">
          <h3 className="text-sm font-bold text-gray-900">Share to</h3>
          <button onClick={onClose} className="p-1.5 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-white safe-pb">
            {sharingStatus && (
              <div className="bg-orange-50 text-orange-600 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-center animate-fade-in">
                {sharingStatus}
              </div>
            )}
            
            {/* Quick Send Row */}
            <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Send to Friend</div>
                <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
                    {friends.map(user => {
                        const isSent = sentTo.includes(user.id);
                        return (
                            <button 
                                key={user.id} 
                                onClick={() => handleSendToUser(user.id)}
                                className="flex flex-col items-center space-y-2 min-w-[64px] group"
                            >
                                <div className="relative">
                                    <div className={`w-14 h-14 rounded-full p-0.5 transition-all ${isSent ? 'bg-green-500 scale-95' : 'bg-transparent group-hover:bg-gray-200'}`}>
                                        <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover border-2 border-white" alt="" />
                                    </div>
                                    {isSent && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                                            <Check className="w-6 h-6 text-white drop-shadow-sm" />
                                        </div>
                                    )}
                                </div>
                                <span className={`text-xs font-medium text-center truncate w-full ${isSent ? 'text-green-600' : 'text-gray-600'}`}>
                                    {isSent ? 'Sent' : user.displayName.split(' ')[0]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Apps Grid */}
            <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Share via</div>
                <div className="grid grid-cols-4 gap-4">
                    
                    <button onClick={handleCopy} className="flex flex-col items-center space-y-2">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            {copied ? <Check className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
                        </div>
                        <span className="text-xs font-medium text-gray-600">{copied ? 'Copied' : 'Copy Link'}</span>
                    </button>

                    <button onClick={() => handleExternalShare('WhatsApp')} className="flex flex-col items-center space-y-2 group">
                         <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <MessageSquare className="w-6 h-6" />
                         </div>
                         <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                    </button>

                    <button onClick={() => handleExternalShare('Twitter')} className="flex flex-col items-center space-y-2 group">
                         <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                            <Twitter className="w-6 h-6" />
                         </div>
                         <span className="text-xs font-medium text-gray-600">Twitter</span>
                    </button>

                    <button onClick={() => handleExternalShare('Email')} className="flex flex-col items-center space-y-2 group">
                         <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <Mail className="w-6 h-6" />
                         </div>
                         <span className="text-xs font-medium text-gray-600">Email</span>
                    </button>

                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
