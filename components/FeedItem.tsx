import React from 'react';
import { Review, ContentType } from '../types';
import { Star, MessageCircle, ThumbsUp, ThumbsDown, MoreHorizontal, MapPin, BadgeCheck, Bookmark } from 'lucide-react';

interface FeedItemProps {
  item: Review;
  onSaveClick?: (id: string) => void;
}

export const FeedItem: React.FC<FeedItemProps> = ({ item, onSaveClick }) => {
  const isBusinessPost = item.type === ContentType.BUSINESS_POST;

  return (
    <div className="bg-white border-b border-gray-100 pb-4 mb-2">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={item.author.avatarUrl} 
              alt={item.author.displayName} 
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
            {isBusinessPost && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-sm text-gray-900">{item.author.displayName}</span>
              {/* If it's a user review, show where they are reviewing */}
              {!isBusinessPost && (
                <>
                  <span className="text-gray-400 text-xs">@</span>
                  <span className="font-medium text-sm text-orange-600">{item.businessName}</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <span>{item.timestamp}</span>
              {item.tags && item.tags.length > 0 && (
                 <>
                  <span>•</span>
                  <span>{item.tags[0]}</span>
                 </>
              )}
            </div>
          </div>
        </div>
        <button className="text-gray-400">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media Content */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
         <img 
            src={item.imageUrl} 
            alt="Review content" 
            className="w-full h-full object-cover"
         />
         {/* Rating Overlay for Reviews */}
         {!isBusinessPost && item.rating && (
           <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
             <span className="text-white font-bold">{item.rating.toFixed(1)}</span>
             <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
           </div>
         )}
      </div>

      {/* Action Bar */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-1.5 group">
            <ThumbsUp className="w-6 h-6 text-gray-600 group-hover:text-green-600 transition-colors" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-green-600">{item.agreeCount}</span>
          </button>
          
          <button className="flex items-center space-x-1.5 group">
            <ThumbsDown className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-red-600">{item.disagreeCount > 0 ? item.disagreeCount : ''}</span>
          </button>

          <button className="flex items-center space-x-1.5 group">
            <MessageCircle className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">{item.commentCount}</span>
          </button>
        </div>
        
        <button 
          onClick={() => onSaveClick?.(item.id)}
          className="text-gray-400 hover:text-orange-500 transition-colors"
        >
            <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* Text Content */}
      <div className="px-4 py-2">
        <p className="text-gray-800 text-sm leading-relaxed">
          <span className="font-semibold mr-2">{item.author.displayName}</span>
          {item.text}
        </p>
      </div>
    </div>
  );
};