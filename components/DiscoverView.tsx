import React, { useState } from 'react';
import { Search, Star, X, Play, Video, Award } from 'lucide-react';
import { MOCK_FEED, BUSINESSES } from '../mockData';
import { TikTokFeedItem } from './TikTokFeedItem';

interface DiscoverViewProps {
  onSaveClick?: (id: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onSaveClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [activeFeedPostId, setActiveFeedPostId] = useState<string | null>(null);

  const cuisines = [
    'Greek', 'Street Food', 'Japanese', 'Bakery', 'Coffee Shop', 'Italian', 'Mexican'
  ];

  const vibes = [
    { name: 'Muckbang', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Play },
    { name: 'Video Reviews', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Video },
    { name: 'POV', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  const filteredFeed = MOCK_FEED.filter(item => {
    const q = searchTerm.toLowerCase();
    const biz = BUSINESSES[item.businessId];
    
    const matchesText = !q || (
      item.businessName.toLowerCase().includes(q) ||
      item.text.toLowerCase().includes(q) ||
      item.tags?.some(tag => tag.toLowerCase().includes(q)) ||
      item.author.username.toLowerCase().includes(q)
    );

    const matchesCuisine = !selectedCuisine || (
      biz?.category.toLowerCase() === selectedCuisine.toLowerCase() ||
      item.tags?.some(tag => tag.toLowerCase() === selectedCuisine.toLowerCase())
    );

    const itemRating = item.rating || biz?.rating || 0;
    const matchesRating = !minRating || itemRating >= minRating;

    // Fixed redundant string comparison logic that caused TS union overlap errors
    if (q) {
      const isVideoKeyword = q === 'video' || q === 'video reviews';
      const isSocialVibe = q === 'muckbang' || q === 'pov';
      
      if (isVideoKeyword && item.mediaType !== 'video') return false;
      if (isSocialVibe && !item.tags?.some(tag => tag.toLowerCase().includes(q))) return false;
    }

    return matchesText && matchesCuisine && matchesRating;
  });

  const featuredBusinesses = Object.values(BUSINESSES);

  if (activeFeedPostId) {
    const selectedIndex = filteredFeed.findIndex(p => p.id === activeFeedPostId);
    const reorderedFeed = [
      ...filteredFeed.slice(selectedIndex),
      ...filteredFeed.slice(0, selectedIndex)
    ];

    return (
      <div className="fixed inset-0 z-50 bg-black animate-[slideUp_0.3s_ease-out]">
        <button 
          onClick={() => setActiveFeedPostId(null)}
          className="absolute top-4 left-4 z-50 p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/20 shadow-2xl active:scale-90 transition-transform"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
          {reorderedFeed.map((item, index) => (
            <TikTokFeedItem 
              key={item.id} 
              item={item} 
              isActive={index === 0} 
              onSaveClick={() => onSaveClick?.(item.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full pb-32">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-2xl border-b border-gray-100">
        <div className="px-5 pt-5 pb-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-11 py-3.5 bg-gray-100/60 border-transparent focus:border-orange-500/10 focus:bg-white rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
              placeholder="Search muckbangs, POV, or spots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="px-5 pb-4 space-y-3">
          <div className="flex space-x-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setSelectedCuisine(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${!selectedCuisine ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'}`}
            >
              All
            </button>
            {cuisines.map(c => (
              <button 
                key={c}
                onClick={() => setSelectedCuisine(selectedCuisine === c ? null : c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedCuisine === c ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'}`}
              >
                {c}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            {[4, 4.5].map(val => (
              <button 
                key={val}
                onClick={() => setMinRating(minRating === val ? null : val)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${minRating === val ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'}`}
              >
                <Award className={`w-3 h-3 ${minRating === val ? 'text-white' : 'text-amber-500'}`} />
                <span>{val}+ Stars</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="py-6 space-y-8">
        {!searchTerm && !selectedCuisine && !minRating && (
          <section>
            <div className="px-5 flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trending Spots</h3>
            </div>
            <div className="flex space-x-5 overflow-x-auto no-scrollbar px-5 pb-2">
              {featuredBusinesses.map((biz) => (
                <div key={biz.id} className="flex flex-col items-center space-y-2.5 min-w-[72px] group cursor-pointer active:scale-95 transition-transform">
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-orange-400 to-rose-500 shadow-lg group-hover:rotate-6 transition-transform">
                    <img src={biz.avatarUrl} alt={biz.name} className="w-full h-full rounded-full object-cover border-4 border-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-900 truncate w-18 tracking-tight">{biz.name}</p>
                    <div className="flex items-center justify-center text-[9px] text-gray-500 font-bold">
                      <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500 mr-1" />
                      {biz.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="px-5">
          <div className="flex flex-wrap gap-2">
            {vibes.map((v) => (
              <button 
                key={v.name} 
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-xl border text-[10px] font-black tracking-wide uppercase transition-all hover:brightness-95 active:scale-95
                  ${v.color} ${searchTerm === v.name ? 'ring-2 ring-current ring-offset-2' : ''}
                `}
                onClick={() => setSearchTerm(v.name)}
              >
                {v.icon && <v.icon className="w-3 h-3" />}
                <span>{v.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="px-3">
          <div className="px-2 mb-4 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {filteredFeed.length} {filteredFeed.length === 1 ? 'Result' : 'Results'}
            </h3>
          </div>
          
          <div className="columns-2 gap-2.5 space-y-2.5">
            {filteredFeed.map((item) => (
              <div 
                key={item.id} 
                className="break-inside-avoid relative rounded-[1.25rem] overflow-hidden bg-gray-100 cursor-pointer group shadow-sm"
                onClick={() => setActiveFeedPostId(item.id)}
              >
                <img src={item.imageUrl} alt="" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                
                {item.mediaType === 'video' && (
                  <div className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20">
                    <Play className="w-3.5 h-3.5 text-white fill-white shadow-xl" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white pointer-events-none transition-transform duration-300 group-hover:-translate-y-1">
                  <p className="text-[10px] font-black line-clamp-1 drop-shadow-md tracking-tight">{item.businessName}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};