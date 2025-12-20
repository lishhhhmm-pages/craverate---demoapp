
import React, { useRef, useEffect, useState } from 'react';
import { Review, ContentType } from '../types';
import { Star, MessageCircle, Heart, Share2, MapPin, BadgeCheck, Loader2, Bookmark, CheckCircle2, XCircle } from 'lucide-react';

interface TikTokFeedItemProps {
  item: Review;
  isActive: boolean;
  isSaved?: boolean;
  onInteractionComplete?: () => void;
  onOpenProfile?: (id: string, isBusiness: boolean) => void;
  onSaveClick?: () => void;
  onCommentsClick?: () => void;
  onShareClick?: () => void;
  onReadMore?: () => void;
}

export const TikTokFeedItem: React.FC<TikTokFeedItemProps> = ({ item, isActive, isSaved = false, onOpenProfile, onSaveClick, onCommentsClick, onShareClick, onReadMore, onInteractionComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isBusinessPost = item.type === ContentType.BUSINESS_POST;
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastTap, setLastTap] = useState<number>(0);
  const [showBigHeart, setShowBigHeart] = useState(false);
  
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [voteState, setVoteState] = useState<'none' | 'agreed' | 'disagreed'>('none');
  const [isAdvancing, setIsAdvancing] = useState(false);

  const startX = useRef<number | null>(null);

  useEffect(() => {
    setMediaError(false);
    setIsLoading(true);
    setVoteState('none');
    setDragX(0);
    setIsAdvancing(false);
  }, [item.id]);

  useEffect(() => {
    if (item.mediaType === 'video' && videoRef.current && !mediaError) {
      if (isActive) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else { 
        videoRef.current.pause(); 
        videoRef.current.currentTime = 0; 
      }
    }
  }, [isActive, item.mediaType, mediaError]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary || isAdvancing) return;
    startX.current = e.clientX;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || startX.current === null || isAdvancing) return;
    const diff = e.clientX - startX.current;
    
    if (Math.abs(diff) > 2) {
        setDragX(diff);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const threshold = 100;
    const now = Date.now();

    if (Math.abs(dragX) < 10) {
        // Handle Tap on the main card area
        if (now - lastTap < 300) { 
            setShowBigHeart(true); 
            setVoteState('agreed'); 
            setTimeout(() => setShowBigHeart(false), 800); 
        } else {
            if (item.mediaType === 'video' && videoRef.current) {
                if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
                setIsPlaying(!isPlaying);
            }
        }
        setLastTap(now);
    } else if (dragX > threshold) {
        setVoteState('agreed');
        if (!isAdvancing) {
          setIsAdvancing(true);
          setTimeout(() => {
            onInteractionComplete?.();
            setIsAdvancing(false);
          }, 600);
        }
    } else if (dragX < -threshold) {
        setVoteState('disagreed');
        if (!isAdvancing) {
          setIsAdvancing(true);
          setTimeout(() => {
            onInteractionComplete?.();
            setIsAdvancing(false);
          }, 600);
        }
    }

    setDragX(0);
    startX.current = null;
  };

  const agreeOpacity = Math.min(1, Math.max(0, (dragX - 30) / 70));
  const nopeOpacity = Math.min(1, Math.max(0, (-dragX - 30) / 70));
  const stampScale = 1 + Math.min(0.1, Math.max(0, (Math.abs(dragX) - 30) / 300));

  return (
    <div className="relative w-full h-full bg-black snap-start flex-shrink-0 overflow-hidden select-none">
      <div 
        className="w-full h-full relative touch-none pointer-events-auto"
        style={{ 
          transform: `translateX(${dragX}px) rotate(${dragX * 0.01}deg)`, 
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={isDragging ? handlePointerUp : undefined}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Voting Stamps */}
        <div 
          className="absolute top-[22%] left-12 z-30 border-[5px] border-emerald-500 rounded-2xl px-5 py-2 pointer-events-none transition-opacity duration-150" 
          style={{ opacity: agreeOpacity, transform: `rotate(-12deg) scale(${stampScale})` }}
        >
          <span className="text-4xl font-black text-emerald-500 uppercase tracking-tighter drop-shadow-2xl flex items-center gap-2">
            AGREE <CheckCircle2 className="w-8 h-8" />
          </span>
        </div>
        
        <div 
          className="absolute top-[22%] right-12 z-30 border-[5px] border-rose-500 rounded-2xl px-5 py-2 pointer-events-none transition-opacity duration-150" 
          style={{ opacity: nopeOpacity, transform: `rotate(12deg) scale(${stampScale})` }}
        >
          <span className="text-4xl font-black text-rose-500 uppercase tracking-tighter drop-shadow-2xl flex items-center gap-2">
            NOPE <XCircle className="w-8 h-8" />
          </span>
        </div>

        {showBigHeart && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none animate-scale-in">
            <Heart className="w-32 h-32 text-white fill-white drop-shadow-2xl" />
          </div>
        )}

        {/* Media Layer */}
        <div className="absolute inset-0 bg-black pointer-events-none">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </div>
          )}
          {item.mediaType === 'video' && item.videoUrl && !mediaError ? (
            <video 
              ref={videoRef} 
              src={item.videoUrl} 
              className="w-full h-full object-cover" 
              loop 
              muted 
              autoPlay
              playsInline 
              onLoadedData={() => setIsLoading(false)} 
              onError={() => { setMediaError(true); setIsLoading(false); }}
              draggable="false"
            />
          ) : (
            <img 
              src={item.imageUrl} 
              className="w-full h-full object-cover" 
              onLoad={() => setIsLoading(false)} 
              onError={() => setIsLoading(false)} 
              draggable="false"
            />
          )}
        </div>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

        {/* Mini Sidebar */}
        <div 
          className="absolute bottom-28 right-3 flex flex-col items-center space-y-5 z-20 pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div 
            className="relative cursor-pointer active:scale-90 transition-transform" 
            onClick={(e) => { e.stopPropagation(); onOpenProfile?.(item.author.id, item.type === ContentType.BUSINESS_POST); }}
          >
            <div className="w-11 h-11 rounded-full border border-white/40 overflow-hidden shadow-lg">
              <img src={item.author.avatarUrl} className="w-full h-full object-cover" draggable="false" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose-600 rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-sm">
              <span className="text-[10px] font-black text-white">+</span>
            </div>
          </div>

          <button className="flex flex-col items-center group" onClick={(e) => { e.stopPropagation(); setVoteState(voteState === 'agreed' ? 'none' : 'agreed'); }}>
            <div className={`p-2.5 backdrop-blur-md rounded-full transition-all duration-300 ${voteState === 'agreed' ? 'bg-rose-500 scale-110' : 'bg-black/20 border border-white/10'}`}>
              <Heart className={`w-6 h-6 ${voteState === 'agreed' ? 'fill-white text-white' : 'text-white'}`} />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">{item.agreeCount + (voteState === 'agreed' ? 1 : 0)}</span>
          </button>

          <button className="flex flex-col items-center group" onClick={(e) => { e.stopPropagation(); onCommentsClick?.(); }}>
            <div className="p-2.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10 transition-all active:scale-95">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">{item.commentCount}</span>
          </button>

          <button className="flex flex-col items-center group" onClick={(e) => { e.stopPropagation(); onSaveClick?.(); }}>
            <div className={`p-2.5 backdrop-blur-md rounded-full border border-white/10 transition-all active:scale-95 ${isSaved ? 'bg-orange-500' : 'bg-black/20'}`}>
              <Bookmark className={`w-6 h-6 text-white ${isSaved ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button className="flex flex-col items-center group" onClick={(e) => { e.stopPropagation(); onShareClick?.(); }}>
            <div className="p-2.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10 transition-all active:scale-95">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">Share</span>
          </button>
        </div>

        {/* Info Area */}
        <div 
          className="absolute bottom-24 left-0 right-16 px-5 z-10 flex flex-col justify-end pointer-events-auto pb-4"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-2 mb-2 cursor-pointer w-fit" onClick={(e) => { e.stopPropagation(); onOpenProfile?.(item.author.id, item.type === ContentType.BUSINESS_POST); }}>
            <span className="font-bold text-base text-white drop-shadow-md tracking-tight">@{item.author.username}</span>
            {isBusinessPost ? (
              <BadgeCheck className="w-4 h-4 text-sky-400 fill-white" />
            ) : (
              <div className="flex items-center bg-orange-600/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg space-x-1 border border-white/10">
                  <span className="text-[9px] font-black text-white">{item.rating?.toFixed(1)}</span>
                  <Star className="w-2.5 h-2.5 fill-white text-white" />
              </div>
            )}
          </div>

          <div 
            className="flex items-center space-x-1.5 mb-3 bg-white/10 hover:bg-white/20 backdrop-blur-md self-start px-3 py-1.5 rounded-xl border border-white/10 transition-all shadow-lg cursor-pointer active:scale-95" 
            onClick={(e) => { e.stopPropagation(); onOpenProfile?.(item.businessId, true); }}
          >
            <MapPin className="w-3 h-3 text-white" />
            <span className="text-[10px] font-black text-white tracking-wide uppercase">{item.businessName}</span>
          </div>

          <div className="mb-3 pr-2">
             <p className="text-sm text-white/95 leading-snug font-medium line-clamp-2 drop-shadow-sm">{item.text}</p>
             {item.text.length > 80 && (
               <button 
                onClick={(e) => { e.stopPropagation(); onReadMore?.(); }} 
                className="text-[10px] font-bold text-white/60 mt-1 uppercase tracking-widest hover:text-white transition-colors"
               >
                 See more
               </button>
             )}
          </div>

          <div className="flex flex-wrap gap-2">
            {item.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 rounded-lg bg-black/30 border border-white/5 text-[9px] font-bold text-white/80 backdrop-blur-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
