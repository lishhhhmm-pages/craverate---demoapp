import React from 'react';
import { X, Star, MapPin, Calendar, Share2, MessageCircle, ThumbsUp, Quote } from 'lucide-react';
import { Review, ContentType } from '../types';

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({ isOpen, onClose, review }) => {
  if (!isOpen || !review) return null;

  const isBusinessPost = review.type === ContentType.BUSINESS_POST;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md h-[85vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
        
        {/* Header Image Area */}
        <div className="relative h-48 flex-shrink-0">
             <img src={review.imageUrl} className="w-full h-full object-cover" alt="Review Context" />
             <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
             >
                 <X className="w-5 h-5" />
             </button>
             
             {/* Author Info Overlay */}
             <div className="absolute bottom-0 left-0 p-6 flex items-end">
                <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg overflow-hidden -mb-8 bg-white">
                    <img src={review.author.avatarUrl} className="w-full h-full object-cover" alt="" />
                </div>
             </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6">
            
            {/* Header Text */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">
                        {review.author.displayName}
                    </h2>
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                        <span>@{review.author.username}</span>
                        <span className="mx-1">•</span>
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{review.timestamp}</span>
                    </div>
                </div>
                
                {/* Rating Badge */}
                {!isBusinessPost && (
                    <div className="flex flex-col items-center bg-orange-50 px-3 py-2 rounded-xl border border-orange-100">
                        <div className="flex items-center text-orange-600 font-black text-2xl leading-none">
                            {review.rating?.toFixed(1)}
                            <span className="text-xs ml-0.5 text-orange-400">/5</span>
                        </div>
                        <div className="flex space-x-0.5 mt-1">
                            {[1,2,3,4,5].map(i => (
                                <Star key={i} className={`w-2 h-2 ${i <= Math.round(review.rating || 0) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Location Context */}
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl mb-6">
                <div className="p-2 bg-white rounded-full shadow-sm">
                    <MapPin className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Reviewing</p>
                    <p className="text-sm font-bold text-gray-900">{review.businessName}</p>
                </div>
            </div>

            {/* The Review Text */}
            <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-gray-100 fill-gray-100 -z-10" />
                <p className="text-gray-800 text-lg leading-relaxed font-serif">
                    {review.text}
                </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
                {review.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Metrics / Social Proof */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50">
                    <ThumbsUp className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="font-bold text-gray-900">{review.agreeCount}</span>
                    <span className="text-[10px] text-gray-400 uppercase">Helpful</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50">
                    <MessageCircle className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="font-bold text-gray-900">{review.commentCount}</span>
                    <span className="text-[10px] text-gray-400 uppercase">Comments</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50">
                    <Share2 className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="font-bold text-gray-900">Share</span>
                    <span className="text-[10px] text-gray-400 uppercase">Review</span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};