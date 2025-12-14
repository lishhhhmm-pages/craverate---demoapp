import React, { useRef, useEffect, useState } from 'react';
import { Review, ContentType } from '../types';
import { Star, MessageCircle, Heart, Share2, MapPin, BadgeCheck, Play, Loader2, Bookmark, Check } from 'lucide-react';

interface TikTokFeedItemProps {
  item: Review;
  isActive: boolean;
  onInteractionComplete?: () => void;
  onOpenProfile?: (id: string, isBusiness: boolean) => void;
  onSaveClick?: () => void;
  onCommentsClick?: () => void;
  onShareClick?: () => void;
  onReadMore?: () => void;
}

export const TikTokFeedItem: React.FC<TikTokFeedItemProps> = ({ item, isActive, onInteractionComplete, onOpenProfile, onSaveClick, onCommentsClick, onShareClick, onReadMore }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isBusinessPost = item.type === ContentType.BUSINESS_POST;
  
  // Media State
  const [isPlaying, setIsPlaying] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Interaction State
  const [lastTap, setLastTap] = useState<number>(0);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Swipe State
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [voteState, setVoteState] = useState<'none' | 'agreed' | 'disagreed'>('none');

  // Reset states when item changes
  useEffect(() => {
    setMediaError(false);
    setIsLoading(true);
    setVoteState('none');
    setDragX(0);
    setShowBigHeart(false);
    setIsSaved(false);
  }, [item.id]);

  // Handle auto-play based on active state
  useEffect(() => {
    if (item.mediaType === 'video' && videoRef.current && !mediaError) {
      if (isActive) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(error => {
              console.log("Autoplay prevented:", error);
              setIsPlaying(false);
            });
        }
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isActive, item.mediaType, mediaError]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging || Math.abs(dragX) > 5) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
        handleDoubleTap();
    } else {
        togglePlay();
    }
    setLastTap(now);
  };

  const handleDoubleTap = () => {
    setShowBigHeart(true);
    triggerVote('agreed');
    setTimeout(() => setShowBigHeart(false), 1000);
  };

  const togglePlay = () => {
    if (item.mediaType === 'video' && videoRef.current && !mediaError) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMediaLoaded = () => setIsLoading(false);
  const handleMediaError = () => {
    console.error(`Failed to load media for item ${item.id}`);
    setMediaError(true);
    setIsLoading(false);
  };

  // --- ACTIONS ---

  const handleBookmark = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSaved(true);
      if (onSaveClick) onSaveClick();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareClick) onShareClick();
  };

  const handleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCommentsClick) onCommentsClick();
  };

  // --- SWIPE / DRAG LOGIC ---

  const handleDragStart = (clientX: number) => {
    setDragStart(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStart === null) return;
    const diff = clientX - dragStart;
    setDragX(diff);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStart(null);

    const threshold = 100; 
    if (dragX > threshold) {
      triggerVote('agreed');
    } else if (dragX < -threshold) {
      triggerVote('disagreed');
    } else {
      setDragX(0); 
    }
  };

  const triggerVote = (type: 'agreed' | 'disagreed' | 'none') => {
    setVoteState(type);
    if (type === 'none') return;
    setTimeout(() => setDragX(0), 200);
    if (onInteractionComplete && (Math.abs(dragX) > 100)) {
       onInteractionComplete();
    }
  };

  const preventNativeDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleDragMove(e.clientX);
    }
  };
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => { if (isDragging) handleDragEnd(); };

  const rotation = dragX * 0.05; 
  const opacityAgree = Math.min(Math.max(dragX / 100, 0), 1);
  const opacityDisagree = Math.min(Math.max(-dragX / 100, 0), 1);
  const showVideo = item.mediaType === 'video' && item.videoUrl && !mediaError;

  return (
    <div className="relative w-full h-full bg-black snap-start flex-shrink-0 overflow-hidden perspective-1000 cursor-grab active:cursor-grabbing select-none">
      
      {/* Swipeable Container */}
      <div 
        className="w-full h-full relative transition-transform duration-200 ease-out origin-bottom"
        style={{
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onClick={handleTap}
        onDragStart={preventNativeDrag}
      >
        
        {/* BIG HEART ANIMATION */}
        {showBigHeart && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <Heart className="w-32 h-32 text-white fill-white animate-[ping_0.5s_ease-out_reverse] drop-shadow-2xl" />
            </div>
        )}

        {/* TINDER STAMPS */}
        <div 
            className="absolute top-24 left-8 z-30 border-4 border-green-500 rounded-lg px-4 py-2 transform -rotate-12 pointer-events-none transition-opacity duration-300"
            style={{ opacity: dragX > 0 ? opacityAgree : 0 }}
        >
            <span className="text-4xl font-black text-green-500 tracking-widest uppercase">AGREE</span>
        </div>

        <div 
            className="absolute top-24 right-8 z-30 border-4 border-red-500 rounded-lg px-4 py-2 transform rotate-12 pointer-events-none transition-opacity duration-300"
            style={{ opacity: dragX < 0 ? opacityDisagree : 0 }}
        >
             <span className="text-4xl font-black text-red-500 tracking-widest uppercase">NOPE</span>
        </div>

        {/* Media Content */}
        <div className="absolute inset-0 bg-gray-900">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
          )}

          {showVideo ? (
            <>
              <video
                ref={videoRef}
                src={item.videoUrl}
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
                draggable={false}
                onLoadedData={handleMediaLoaded}
                onError={handleMediaError}
                onDragStart={preventNativeDrag}
              />
              {!isPlaying && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                  <Play className="w-16 h-16 text-white/80 fill-white/80" />
                </div>
              )}
            </>
          ) : (
            <img
              src={item.imageUrl}
              alt={item.businessName}
              className="w-full h-full object-cover"
              draggable={false}
              onLoad={handleMediaLoaded}
              onError={handleMediaError}
              onDragStart={preventNativeDrag}
            />
          )}
        </div>

        {/* Overlay Gradient - Made slightly stronger at the bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent via-50% to-black/90 pointer-events-none" />

        {/* Right Sidebar Actions */}
        <div className="absolute bottom-32 right-2 flex flex-col items-center space-y-6 z-20 pointer-events-auto">
          {/* Avatar */}
          <div className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); onOpenProfile?.(item.author.id, item.type === ContentType.BUSINESS_POST); }}>
            <div className="w-12 h-12 rounded-full border-2 border-white p-0.5 overflow-hidden bg-gray-800 transition-transform group-active:scale-90 shadow-lg">
              <img 
                src={item.author.avatarUrl} 
                alt={item.author.displayName} 
                className="w-full h-full rounded-full object-cover"
                draggable={false}
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 rounded-full p-0.5 shadow-sm hover:scale-110 transition-transform">
              <div className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white">+</div>
            </div>
          </div>

          {/* Like */}
          <button 
            className="flex flex-col items-center space-y-1 group"
            onClick={(e) => { e.stopPropagation(); triggerVote(voteState === 'agreed' ? 'none' : 'agreed'); }}
          >
            <div className={`p-2 backdrop-blur-md rounded-full transition-all duration-300 shadow-lg ${voteState === 'agreed' ? 'bg-green-500 scale-110' : 'bg-black/30 hover:bg-black/50 border border-white/10'}`}>
              <Heart className={`w-8 h-8 transition-colors ${voteState === 'agreed' ? 'fill-white text-white' : 'text-white fill-white/10 group-hover:text-red-500'}`} />
            </div>
            <span className="text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {item.agreeCount + (voteState === 'agreed' ? 1 : 0)}
            </span>
          </button>

          {/* Comments */}
          <button className="flex flex-col items-center space-y-1 group" onClick={handleComments}>
            <div className="p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full group-active:scale-90 transition-transform shadow-lg border border-white/10">
              <MessageCircle className="w-8 h-8 text-white fill-white/10 group-hover:fill-blue-500 group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {item.commentCount}
            </span>
          </button>
          
          {/* Save */}
          <button className="flex flex-col items-center space-y-1 group" onClick={handleBookmark}>
            <div className={`p-2 backdrop-blur-md rounded-full group-active:scale-90 transition-transform shadow-lg border border-white/10 ${isSaved ? 'bg-orange-500 border-transparent' : 'bg-black/30 hover:bg-black/50'}`}>
              <Bookmark className={`w-8 h-8 transition-colors ${isSaved ? 'text-white fill-white' : 'text-white fill-white/10 group-hover:text-orange-400'}`} />
            </div>
            <span className="text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Save
            </span>
          </button>

          {/* Share */}
          <button className="flex flex-col items-center space-y-1 group" onClick={handleShare}>
            <div className="p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full group-active:scale-90 transition-transform shadow-lg border border-white/10">
               <Share2 className="w-8 h-8 text-white group-hover:text-green-400 transition-colors" />
            </div>
            <span className="text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Share
            </span>
          </button>
        </div>

        {/* Bottom Info - Lifted to avoid navigation overlap */}
        <div className="absolute bottom-28 left-0 right-16 px-4 z-10 flex flex-col justify-end pointer-events-auto drop-shadow-lg">
          <div 
            className="flex items-center space-x-2 mb-2 cursor-pointer w-fit"
            onClick={(e) => { e.stopPropagation(); onOpenProfile?.(item.author.id, item.type === ContentType.BUSINESS_POST); }}
          >
            <span className="font-black text-lg text-white shadow-black hover:underline tracking-wide drop-shadow-md">
              @{item.author.username}
            </span>
            {isBusinessPost && (
              <BadgeCheck className="w-5 h-5 text-blue-400 fill-white" />
            )}
            {!isBusinessPost && (
              <div className="flex items-center bg-orange-600/90 backdrop-blur-md px-2 py-0.5 rounded-md space-x-1 shadow-sm border border-white/20">
                  <span className="text-xs font-bold text-white">{item.rating?.toFixed(1)}</span>
                  <Star className="w-3 h-3 fill-white text-white" />
              </div>
            )}
          </div>

          <div 
            className="flex items-center space-x-1 mb-2 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md self-start px-2 py-1 rounded-lg cursor-pointer border border-white/10"
            onClick={(e) => { e.stopPropagation(); onOpenProfile?.(item.businessId, true); }}
          >
            <MapPin className="w-3 h-3 text-white" />
            <span className="text-[10px] font-bold text-white tracking-wide">{item.businessName}</span>
          </div>

          <div className="mb-3">
             <p className="text-sm text-white/95 leading-relaxed font-medium drop-shadow-md transition-all line-clamp-2">
                {item.text}
             </p>
             {item.text.length > 50 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onReadMore?.(); }} 
                  className="text-xs font-black text-white/80 mt-1 hover:text-white uppercase tracking-wider"
                >
                  more
                </button>
             )}
          </div>

          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto no-scrollbar">
            {item.tags?.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-black/40 border border-white/20 text-[10px] font-bold text-white backdrop-blur-sm">
                #{tag}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};