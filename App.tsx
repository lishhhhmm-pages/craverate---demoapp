
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star, ChevronLeft, MapPin, Zap, ArrowLeft, History, TrendingUp, Home, Map as MapIcon, Bell, User as UserIcon, Flame, Coffee, Pizza, Cherry, Loader2, Fish, Sandwich, IceCream, Utensils } from 'lucide-react';
import { Layout } from './components/Layout';
import { TikTokFeedItem } from './components/TikTokFeedItem';
import { ProfileView } from './components/ProfileView';
import { MapView } from './components/MapView';
import { SaveCollectionModal } from './components/SaveCollectionModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CommentsModal } from './components/CommentsModal';
import { ShareModal } from './components/ShareModal';
import { ReviewDetailModal } from './components/ReviewDetailModal';
import { UserList, Review, Business } from './types';
import { api } from './services/api';
import { BUSINESSES, USERS } from './mockData';

type NavTab = 'home' | 'map' | 'profile';
interface ProfileParams {
  id: string;
  isBusiness: boolean;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [viewedProfile, setViewedProfile] = useState<ProfileParams | null>(null);
  const [feed, setFeed] = useState<Review[]>([]);
  const [allPosts, setAllPosts] = useState<Review[]>([]);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false); 
  const [filteredFeed, setFilteredFeed] = useState<Review[]>([]);
  const [isGridView, setIsGridView] = useState(false);
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [itemToSaveId, setItemToSaveId] = useState<string | null>(null);
  const [activePostIdForComments, setActivePostIdForComments] = useState<string | null>(null);
  const [reviewToRead, setReviewToRead] = useState<Review | null>(null);
  const [reviewTargetBusiness, setReviewTargetBusiness] = useState<Business | null>(null);
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());

  const [recentSearches, setRecentSearches] = useState([
    'Muckbangs', 'POV Review', 'Gyro King', '@burger_boss'
  ]);

  const feedContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOverlayOpen) {
      document.body.classList.add('overflow-hidden', 'no-scrollbar');
    } else {
      document.body.classList.remove('overflow-hidden', 'no-scrollbar');
    }
    return () => document.body.classList.remove('overflow-hidden', 'no-scrollbar');
  }, [isSearchOverlayOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [feedData, allPostsData, listData] = await Promise.all([
            api.getFeed(),
            api.getAllPosts(),
            api.getUserLists('u1')
        ]);
        setFeed(feedData);
        setAllPosts(allPostsData);
        setUserLists(listData);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
      if (searchQuery.trim()) {
          const lowerQ = searchQuery.toLowerCase();
          const isIntentVideo = lowerQ.includes('video') || lowerQ.includes('muck') || lowerQ.includes('pov');
          
          const results = allPosts.filter(item => {
              const matchesText = item.businessName.toLowerCase().includes(lowerQ) ||
                                  item.text.toLowerCase().includes(lowerQ) ||
                                  item.tags?.some(tag => tag.toLowerCase().includes(lowerQ)) ||
                                  item.author.username.toLowerCase().includes(lowerQ);
              
              if (isIntentVideo) {
                  return matchesText && item.mediaType === 'video';
              }
              return matchesText;
          });
          
          setFilteredFeed(results);
      } else {
          setFilteredFeed([]);
      }
  }, [searchQuery, allPosts]);

  const performSearch = (query: string) => {
      if (!query.trim()) return;
      setSearchQuery(query);
      setIsSearchOverlayOpen(false);
      setIsGridView(true);
      if (!recentSearches.includes(query)) {
          setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
      searchInputRef.current?.blur();
  };

  const handleClearSearch = () => {
      setSearchQuery('');
      setIsSearchOverlayOpen(false);
      setIsGridView(false);
      setFilteredFeed([]);
      setCurrentFeedIndex(0);
      if (feedContainerRef.current) feedContainerRef.current.scrollTo({ top: 0 });
  };

  const handleTagClick = (tag: string) => {
      performSearch(tag);
      setReviewToRead(null);
  };

  const handleGridItemClick = (itemId: string) => {
      const sourceFeed = searchQuery ? filteredFeed : allPosts;
      const index = sourceFeed.findIndex(i => i.id === itemId);
      
      if (index >= 0) {
          setIsGridView(false);
          setCurrentFeedIndex(index);
          setTimeout(() => {
            if (feedContainerRef.current) {
                const itemHeight = feedContainerRef.current.clientHeight;
                feedContainerRef.current.scrollTo({ 
                    top: index * itemHeight, 
                    behavior: 'auto' 
                });
            }
          }, 0);
      }
  };

  const handlePostNavigation = (post: Review) => {
      setViewedProfile(null);
      setActiveTab('home');
      setSearchQuery('');
      setIsGridView(false);
      
      const index = feed.findIndex(f => f.id === post.id);
      if (index >= 0) {
          setCurrentFeedIndex(index);
          setTimeout(() => {
              if (feedContainerRef.current) {
                  const itemHeight = feedContainerRef.current.clientHeight;
                  feedContainerRef.current.scrollTo({ top: index * itemHeight, behavior: 'auto' });
              }
          }, 50);
      }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPos = container.scrollTop;
    const itemHeight = container.clientHeight;
    if (itemHeight > 0) {
      const index = Math.round(scrollPos / itemHeight);
      if (index !== currentFeedIndex) {
        setCurrentFeedIndex(index);
      }
    }
  };

  const handleNextItem = () => {
    if (feedContainerRef.current) {
        const itemHeight = feedContainerRef.current.clientHeight;
        const nextIndex = currentFeedIndex + 1;
        const totalItems = (searchQuery ? filteredFeed : feed).length;
        
        if (nextIndex < totalItems) {
            feedContainerRef.current.scrollTo({
                top: nextIndex * itemHeight,
                behavior: 'smooth'
            });
            setCurrentFeedIndex(nextIndex);
        }
    }
  };

  const activeFeed = searchQuery ? filteredFeed : feed;

  const renderSearchOverlay = () => {
      if (!isSearchOverlayOpen) return null;

      if (activeTab === 'map') {
        const trendingShops = Object.values(BUSINESSES).slice(0, 5);
        return (
          <div className="absolute inset-0 z-40 bg-white/98 backdrop-blur-3xl pt-28 pb-24 overflow-y-auto pointer-events-auto animate-fade-in no-scrollbar text-gray-900">
              <div className="px-6 space-y-12 pb-10">
                  <div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center">
                          <Utensils className="w-3.5 h-3.5 mr-2" /> What are you craving?
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                          {[
                            { name: 'Pizza', icon: Pizza, color: 'text-rose-500 bg-rose-50' },
                            { name: 'Sushi', icon: Fish, color: 'text-indigo-500 bg-indigo-50' },
                            { name: 'Burgers', icon: Sandwich, color: 'text-amber-500 bg-amber-50' },
                            { name: 'Coffee', icon: Coffee, color: 'text-orange-500 bg-orange-50' },
                            { name: 'Sweets', icon: IceCream, color: 'text-pink-500 bg-pink-50' },
                            { name: 'Street', icon: Cherry, color: 'text-emerald-500 bg-emerald-50' }
                          ].map(cat => (
                            <button key={cat.name} onClick={() => performSearch(cat.name)} className="flex flex-col items-center space-y-2 group">
                                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all group-active:scale-90 border border-transparent hover:border-black/5 shadow-sm ${cat.color}`}>
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black text-gray-600 tracking-wide uppercase">{cat.name}</span>
                            </button>
                          ))}
                      </div>
                  </div>

                  <div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center">
                          <TrendingUp className="w-3.5 h-3.5 mr-2" /> Trending Spots Near You
                      </h3>
                      <div className="flex space-x-5 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
                          {trendingShops.map((biz) => (
                              <button 
                                key={biz.id} 
                                onClick={() => { setViewedProfile({id: biz.id, isBusiness: true}); setIsSearchOverlayOpen(false); }}
                                className="flex flex-col items-center space-y-3 min-w-[80px] group active:scale-95 transition-all"
                              >
                                  <div className="relative">
                                      <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-orange-400 to-rose-500 shadow-md">
                                          <img src={biz.avatarUrl} alt="" className="w-full h-full rounded-full object-cover border-2 border-white" />
                                      </div>
                                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm flex items-center space-x-0.5 border border-gray-100">
                                          <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                                          <span className="text-[8px] font-black text-gray-900">{biz.rating}</span>
                                      </div>
                                  </div>
                                  <div className="text-center">
                                      <p className="text-[10px] font-black text-gray-900 truncate w-20 tracking-tight leading-tight">{biz.name}</p>
                                      <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">{biz.distance}</p>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
        );
      }

      return (
          <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-3xl pt-28 pb-24 overflow-y-auto pointer-events-auto animate-fade-in no-scrollbar">
              <div className="px-5 space-y-8 pb-10">
                  <div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                          <History className="w-3.5 h-3.5 mr-2" /> Recent Finds
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                          {recentSearches.map(s => (
                              <button key={s} onClick={() => performSearch(s)} className="w-full flex items-center justify-between py-4 px-5 bg-gray-50/80 hover:bg-white hover:shadow-md rounded-2xl border border-transparent hover:border-gray-100 transition-all group">
                                  <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600">{s}</span>
                                  <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180 group-hover:text-orange-400 group-hover:translate-x-1" />
                              </button>
                          ))}
                      </div>
                  </div>

                  <div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Discover People</h3>
                      <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 px-1">
                           {Object.values(USERS).map(user => (
                               <button 
                                key={user.id} 
                                onClick={() => { setViewedProfile({id: user.id, isBusiness: false}); setIsSearchOverlayOpen(false); handleClearSearch(); }}
                                className="flex flex-col items-center space-y-2 min-w-[70px] active:scale-95 transition-transform"
                               >
                                   <div className="w-16 h-16 rounded-full border-2 border-orange-100 p-0.5 shadow-sm">
                                       <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                                   </div>
                                   <span className="text-[10px] font-bold text-gray-600 truncate w-16 text-center">@{user.username}</span>
                               </button>
                           ))}
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => performSearch("Muckbangs")} className="flex flex-col items-center justify-center p-6 bg-orange-50/50 rounded-3xl border border-orange-100/50 group active:scale-95 transition-all space-y-3">
                           <div className="p-3 bg-white rounded-2xl shadow-sm text-orange-600 group-hover:rotate-12 transition-transform">
                             <Flame className="w-6 h-6" />
                           </div>
                           <span className="text-xs font-black text-orange-700 uppercase tracking-widest">Muckbangs</span>
                      </button>
                      <button onClick={() => performSearch("POV Review")} className="flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 group active:scale-95 transition-all space-y-3">
                           <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:rotate-12 transition-transform">
                             <UserIcon className="w-6 h-6" />
                           </div>
                           <span className="text-xs font-black text-blue-700 uppercase tracking-widest">POV Feed</span>
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const isHomeImmersive = activeTab === 'home' && !viewedProfile && !isSearchOverlayOpen && !isGridView;

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={(tab) => { if (tab === 'home' && activeTab === 'home') handleClearSearch(); setActiveTab(tab); setViewedProfile(null); }}
      onCreateClick={() => setIsCreateModalOpen(true)}
      isImmersive={isHomeImmersive}
      headerContent={viewedProfile || activeTab === 'profile' ? null : (
          <div className="w-full flex items-center space-x-3 pointer-events-auto pt-4 px-4 relative z-[60]">
              {(searchQuery || isSearchOverlayOpen) && (
                  <button 
                    onClick={handleClearSearch} 
                    className="p-3.5 rounded-2xl transition-all shadow-lg border active:scale-90 bg-black/10 border-white/20 text-white backdrop-blur-md"
                  >
                      <ArrowLeft className="w-5 h-5" />
                  </button>
              )}
              
              <div className="flex-1 relative flex items-center">
                  <div className={`absolute left-4 w-6 h-6 flex items-center justify-center transition-all ${isSearchOverlayOpen || searchQuery ? 'text-orange-500' : isHomeImmersive ? 'text-white/60' : 'text-gray-400'} z-10 pointer-events-none`}>
                      <Search className="w-4.5 h-4.5" strokeWidth={3} />
                  </div>
                  <input 
                    ref={searchInputRef} 
                    type="text" 
                    className={`
                        w-full pl-12 pr-10 py-3.5 rounded-full text-sm font-black transition-all outline-none border tracking-tight
                        ${(isSearchOverlayOpen || searchQuery) ? 'bg-white text-gray-900 border-transparent shadow-xl ring-4 ring-black/5' : 
                          isHomeImmersive ? 'bg-white/10 text-white placeholder-white/40 border-white/10 backdrop-blur-xl' : 
                          'bg-gray-100 text-gray-800 placeholder-gray-400 border-gray-200/50 backdrop-blur-xl'}
                    `} 
                    placeholder="Search cravings..." 
                    value={searchQuery} 
                    onFocus={() => setIsSearchOverlayOpen(true)} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && performSearch(searchQuery)} 
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 p-1 bg-gray-400/20 rounded-full hover:bg-gray-400/40 transition-colors">
                        <X className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  )}
              </div>
          </div>
      )}
    >
        {viewedProfile ? (
            <div className="h-full w-full overflow-hidden">
                <ProfileView 
                  profileId={viewedProfile.id} 
                  isBusiness={viewedProfile.isBusiness} 
                  onBack={() => setViewedProfile(null)} 
                  customLists={viewedProfile.id === 'u1' ? userLists : undefined} 
                  onSaveClick={(id) => { setItemToSaveId(id); setIsSaveModalOpen(true); }} 
                  onWriteReview={(b) => { setReviewTargetBusiness(b); setIsCreateModalOpen(true); }}
                  onPostClick={handlePostNavigation}
                  onCreateListClick={() => setIsSaveModalOpen(true)}
                />
            </div>
        ) : activeTab === 'home' ? (
            <div className="h-full w-full relative overflow-hidden bg-black">
                {isGridView ? (
                    <div className="h-full w-full bg-white pt-28 pb-40 overflow-y-auto px-4 no-scrollbar animate-fade-in">
                        {activeFeed.length > 0 ? (
                           <div className="columns-2 gap-3 space-y-3">
                               {activeFeed.map(item => (
                                   <div key={item.id} onClick={() => handleGridItemClick(item.id)} className="break-inside-avoid relative rounded-2xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm group">
                                       <img src={item.imageUrl} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                       <div className="absolute bottom-3 left-3 right-3">
                                           <p className="text-[11px] font-black text-white truncate drop-shadow-md">{item.businessName}</p>
                                           <div className="flex items-center space-x-1 mt-0.5">
                                               <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                               <span className="text-[10px] text-white/90 font-bold">{item.rating?.toFixed(1)}</span>
                                           </div>
                                       </div>
                                   </div>
                               ))}
                           </div>
                        ) : (
                           <div className="flex flex-col items-center justify-center h-full text-gray-400 pb-20">
                               <div className="p-6 bg-gray-50 rounded-full mb-4 shadow-sm border border-gray-100">
                                   <Search className="w-10 h-10 opacity-20" />
                               </div>
                               <p className="text-sm font-bold">No results for "{searchQuery}"</p>
                           </div>
                        )}
                    </div>
                ) : (
                    <div ref={feedContainerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar" onScroll={handleScroll}>
                        {!isLoading && activeFeed.map((item, index) => (
                            <TikTokFeedItem 
                              key={item.id} 
                              item={item} 
                              isActive={index === currentFeedIndex} 
                              isSaved={savedItemIds.has(item.id)}
                              onOpenProfile={(id, isBiz) => setViewedProfile({id, isBusiness: isBiz})} 
                              onSaveClick={() => { setItemToSaveId(item.id); setIsSaveModalOpen(true); }} 
                              onCommentsClick={() => { setActivePostIdForComments(item.id); setIsCommentsModalOpen(true); }} 
                              onShareClick={() => setIsShareModalOpen(true)} 
                              onReadMore={() => setReviewToRead(item)} 
                              onInteractionComplete={handleNextItem}
                              onTagClick={handleTagClick}
                            />
                        ))}
                    </div>
                )}
                {renderSearchOverlay()}
            </div>
        ) : activeTab === 'map' ? (
            <div className="h-full w-full relative bg-gray-50">
                <MapView onOpenProfile={(id, isBiz) => setViewedProfile({id, isBusiness: isBiz})} />
                {renderSearchOverlay()}
            </div>
        ) : (
            <div className="h-full w-full overflow-hidden">
                <ProfileView 
                  profileId="u1" 
                  isBusiness={false} 
                  isOwnProfile={true} 
                  customLists={userLists} 
                  onSaveClick={(id) => { setItemToSaveId(id); setIsSaveModalOpen(true); }}
                  onPostClick={handlePostNavigation}
                  onCreateListClick={() => setIsSaveModalOpen(true)}
                />
            </div>
        )}
        
        <SaveCollectionModal 
          isOpen={isSaveModalOpen} 
          onClose={() => setIsSaveModalOpen(false)} 
          existingLists={userLists} 
          onSaveToExisting={async (id) => { 
            if (itemToSaveId) {
              await api.addToList(id, itemToSaveId); 
              setSavedItemIds(prev => new Set(prev).add(itemToSaveId));
            }
          }} 
          onCreateNewList={async (n, p, c) => { 
            const l = await api.createList(n,p,c); 
            if(itemToSaveId) {
              await api.addToList(l.id, itemToSaveId); 
              setSavedItemIds(prev => new Set(prev).add(itemToSaveId));
            }
            fetchData(); // Refresh lists
          }} 
        />
        <CreatePostModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setReviewTargetBusiness(null); }} onPostCreated={fetchData} preselectedBusiness={reviewTargetBusiness} />
        <CommentsModal isOpen={isCommentsModalOpen} onClose={() => setIsCommentsModalOpen(false)} postId={activePostIdForComments} />
        <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
        <ReviewDetailModal isOpen={!!reviewToRead} onClose={() => setReviewToRead(null)} review={reviewToRead} />
    </Layout>
  );
};

export default App;
