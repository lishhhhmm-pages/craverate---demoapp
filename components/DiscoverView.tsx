import React, { useState } from 'react';
import { Search, MapPin, Filter, ArrowUpRight, Star, Flame, ChevronRight, Layers, Bookmark, X, Play } from 'lucide-react';
import { MOCK_FEED, BUSINESSES } from '../mockData';
import { TikTokFeedItem } from './TikTokFeedItem';

interface DiscoverViewProps {
  onSaveClick?: (id: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onSaveClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFeedPostId, setActiveFeedPostId] = useState<string | null>(null);

  const cuisines = [
    { name: 'Sushi', emoji: '🍣' },
    { name: 'Burgers', emoji: '🍔' },
    { name: 'Pizza', emoji: '🍕' },
    { name: 'Mexican', emoji: '🌮' },
    { name: 'Coffee', emoji: '☕️' },
    { name: 'Dessert', emoji: '🍦' },
    { name: 'Healthy', emoji: '🥗' },
    { name: 'Asian', emoji: '🍜' },
  ];

  const vibes = [
    { name: 'Date Night', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'Cheap Eats', color: 'bg-green-50 text-green-700 border-green-200' },
    { name: 'Live Music', color: 'bg-purple-50 text-purple-700 border-purple-200', animate: true },
    { name: 'Quiet Study', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Outdoor', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  ];

  // Filtering Logic
  const filteredFeed = MOCK_FEED.filter(item => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return (
          item.businessName.toLowerCase().includes(q) ||
          item.text.toLowerCase().includes(q) ||
          item.tags?.some(tag => tag.toLowerCase().includes(q))
      );
  });

  const featuredBusinesses = Object.values(BUSINESSES);

  // If a post is active, show the Full Screen Feed Overlay
  if (activeFeedPostId) {
      // Reorder feed to start with selected post
      const selectedIndex = filteredFeed.findIndex(p => p.id === activeFeedPostId);
      const reorderedFeed = [
          ...filteredFeed.slice(selectedIndex),
          ...filteredFeed.slice(0, selectedIndex)
      ];

      return (
          <div className="fixed inset-0 z-50 bg-black animate-[slideUp_0.3s_ease-out]">
              <button 
                onClick={() => setActiveFeedPostId(null)}
                className="absolute top-4 left-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60"
              >
                  <X className="w-6 h-6" />
              </button>
              <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
                  {reorderedFeed.map((item, index) => (
                      <TikTokFeedItem 
                        key={item.id} 
                        item={item} 
                        isActive={index === 0} // Simplification: assume first is active initially
                        onSaveClick={() => onSaveClick?.(item.id)}
                      />
                  ))}
              </div>
          </div>
      );
  }

  return (
    <div className="bg-white min-h-full pb-24">
      
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-gray-100/50 supports-[backdrop-filter]:bg-white/60">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-3 bg-gray-100/80 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
            placeholder="Search cravings, spots, or vibes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-400 hover:text-gray-600 transition-colors">
                <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="py-6 space-y-6">
        
        {/* Quick Shops View (Horizontal Scroll) */}
        <section>
             <div className="px-4 flex items-center justify-between mb-3">
                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-xs text-gray-400">Trending Spots</h3>
             </div>
             <div className="flex space-x-4 overflow-x-auto no-scrollbar px-4 pb-2">
                 {featuredBusinesses.map((biz) => (
                     <div key={biz.id} className="flex flex-col items-center space-y-2 min-w-[72px]">
                         <div className="w-16 h-16 rounded-full p-0.5 border-2 border-orange-500">
                             <img src={biz.avatarUrl} alt={biz.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                         </div>
                         <div className="text-center">
                             <p className="text-xs font-bold text-gray-900 truncate w-20">{biz.name}</p>
                             <div className="flex items-center justify-center text-[10px] text-gray-500">
                                 <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500 mr-0.5" />
                                 {biz.rating}
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
        </section>

        {/* Vibe Check Tags */}
        <section className="px-4">
          <div className="flex flex-wrap gap-2">
            {vibes.map((v) => (
              <button 
                key={v.name} 
                className={`
                  relative px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all hover:brightness-95 active:scale-95
                  ${v.color}
                `}
                onClick={() => setSearchTerm(v.name)}
              >
                {v.animate && (
                  <span className="absolute top-0 right-0 -mt-0.5 -mr-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                )}
                {v.name}
              </button>
            ))}
          </div>
        </section>

        {/* Main Content: Masonry Grid */}
        <section className="px-2">
           <h3 className="px-2 mb-3 text-sm font-bold text-gray-900 uppercase tracking-wider text-xs text-gray-400">Explore</h3>
           <div className="columns-2 gap-2 space-y-2">
              {filteredFeed.map((item) => (
                  <div 
                    key={item.id} 
                    className="break-inside-avoid relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
                    onClick={() => setActiveFeedPostId(item.id)}
                  >
                      <img src={item.imageUrl} alt="" className="w-full h-auto object-cover" />
                      
                      {/* Overlay Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Video Icon */}
                      {item.mediaType === 'video' && (
                          <div className="absolute top-2 right-2">
                              <Play className="w-4 h-4 text-white fill-white/50 drop-shadow-sm" />
                          </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2 text-white">
                          <p className="text-xs font-bold line-clamp-1 drop-shadow-md">{item.businessName}</p>
                          <div className="flex items-center text-[10px] opacity-90 mt-0.5">
                              <img src={item.author.avatarUrl} className="w-3 h-3 rounded-full mr-1" alt="" />
                              <span className="truncate">@{item.author.username}</span>
                          </div>
                      </div>
                  </div>
              ))}
           </div>
           {filteredFeed.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                    No results found for "{searchTerm}"
                </div>
            )}
        </section>

      </div>
    </div>
  );
};