import React, { useState, useEffect } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { Comment } from '../types';
import { USERS } from '../mockData';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Mock fetching comments when modal opens
  useEffect(() => {
    if (isOpen && postId) {
      setIsAnimating(true);
      // Simulate API call
      setComments([
        {
          id: 'c1',
          userId: 'u3',
          username: USERS.u3.username,
          avatarUrl: USERS.u3.avatarUrl,
          text: 'This place looks amazing! 😍',
          timestamp: '2h',
          likes: 12
        },
        {
          id: 'c2',
          userId: 'u4',
          username: USERS.u4.username,
          avatarUrl: USERS.u4.avatarUrl,
          text: 'Is it expensive?',
          timestamp: '3h',
          likes: 4
        },
        {
          id: 'c3',
          userId: 'u5',
          username: USERS.u5.username,
          avatarUrl: USERS.u5.avatarUrl,
          text: 'Added to my list! 📝',
          timestamp: '5h',
          likes: 24
        }
      ]);
    } else {
        setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen, postId]);

  const handleSend = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'u1', // Current user
      username: USERS.u1.username,
      avatarUrl: USERS.u1.avatarUrl,
      text: newComment,
      timestamp: 'Just now',
      likes: 0
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div 
        className={`relative bg-white w-full max-w-md h-[70vh] rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="w-8" /> {/* Spacer */}
          <h3 className="text-sm font-bold text-gray-900">{comments.length} comments</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-gray-900 bg-gray-50 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img src={comment.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 object-cover" />
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                    <span className="text-xs font-bold text-gray-900">{comment.username}</span>
                    <span className="text-[10px] text-gray-400">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mt-0.5">
                    {comment.text}
                </p>
                <button className="text-[10px] font-semibold text-gray-400 mt-1 hover:text-gray-600">Reply</button>
              </div>
              <div className="flex flex-col items-center space-y-1 pt-1">
                 <Heart className="w-4 h-4 text-gray-300 hover:text-red-500 cursor-pointer transition-colors" />
                 <span className="text-[10px] text-gray-400">{comment.likes > 0 ? comment.likes : ''}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 pb-8 bg-white safe-pb">
          <div className="flex items-center gap-3">
            <img src={USERS.u1.avatarUrl} className="w-8 h-8 rounded-full border border-gray-100" alt="" />
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="w-full bg-gray-100 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
                <button 
                    onClick={handleSend}
                    disabled={!newComment.trim()}
                    className="absolute right-1 top-1 p-1.5 bg-orange-500 rounded-full text-white disabled:opacity-0 disabled:scale-75 transition-all"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};