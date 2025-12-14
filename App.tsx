import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, X, Play, Star, ChevronLeft } from 'lucide-react';
import { Layout } from './components/Layout';
import { TikTokFeedItem } from './components/TikTokFeedItem';
import { ProfileView } from './components/ProfileView';
import { MapView } from './components/MapView';
import { SaveCollectionModal } from './components/SaveCollectionModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CommentsModal } from './components/CommentsModal';
import { ShareModal } from './components/ShareModal';
import { ReviewDetailModal } from './components/ReviewDetailModal';
import { UserList, User, Review } from './types';
import { api } from './services/api';
import { BUSINESSES, MOCK_FEED } from './mockData';

// Simple types for navigation state
type NavTab = 'home' | 'map' | 'profile';
interface ProfileParams {
  id: string;
  isBusiness: boolean;
}

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [viewedProfile, setViewedProfile] = useState<ProfileParams | null>(null);
  
  // Data State
  const [feed, setFeed] = useState<Review[]>([]);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search State (Integrated into Home)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredFeed, setFilteredFeed] = useState<Review[]>([]);
  const [activeSearchResultId, setActiveSearchResultId] = useState<string | null>(null);

  // Interaction State
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const [itemToSaveId, setItemToSaveId] = useState<string | null>(null);
  const [activePostIdForComments, setActivePostIdForComments] = useState<string | null>(null);
  const [reviewToRead, setReviewToRead] = useState<Review | null>(null);

  const feedContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- INITIAL DATA FETCH ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [feedData, listData] = await Promise.all([
            api.getFeed(),
            api.getUserLists('u1')
        ]);
        setFeed(feedData);
        setUserLists(listData);
    } catch (e) {
        console.error("Failed to fetch data", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- SEARCH LOGIC ---
  useEffect(() => {
      if (searchQuery.trim()) {
          const lowerQ = searchQuery.toLowerCase();
          const results = feed.filter(item => 
              item.businessName.toLowerCase().includes(lowerQ) ||
              item.text.toLowerCase().includes(lowerQ) ||
              item.tags?.some(tag => tag.toLowerCase().includes(lowerQ))
          );
          setFilteredFeed(results);
      } else {
          setFilteredFeed([]);
      }
  }, [searchQuery, feed]);

  const handleSearchFocus = () => {
      setIsSearching(true);
      setActiveSearchResultId(null);
  };

  const handleSearchCancel = () => {
      setSearchQuery('');
      setIsSearching(false);
      setActiveSearchResultId(null);
      if (feedContainerRef.current) {
          feedContainerRef.current.scrollTo({ top: 0 });
      }
  };

  // --- HANDLERS ---
  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight);
      // Logic relies on consistent height, standard feed behavior
      if (index >= 0) {
        setCurrentFeedIndex(index);
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInteractionComplete = () => {
    if (feedContainerRef.current) {
      setTimeout(() => {
        // Calculate next scroll pos
        feedContainerRef.current?.scrollTo({
          top: feedContainerRef.current.scrollTop + feedContainerRef.current.clientHeight,
          behavior: 'smooth'
        });
      }, 300);
    }
  };

  // --- ACTIONS ---
  const handleSaveClick = (itemId: string) => {
    setItemToSaveId(itemId);
    setIsSaveModalOpen(true);
  };

  const handleCommentsClick = (itemId: string) => {
      setActivePostIdForComments(itemId);
      setIsCommentsModalOpen(true);
  };

  const handleShareClick = () => {
      setIsShareModalOpen(true);
  };

  const handleSaveToExistingList = async (listId: string) => {
    if (itemToSaveId) {
        await api.addToList(listId, itemToSaveId);
        setUserLists(prev => prev.map(l => l.id === listId ? {...l, itemCount: l.itemCount + 1} : l));
    }
  };

  const handleCreateNewList = async (name: string, isPrivate: boolean, collaborators: User[]) => {
    const newList = await api.createList(name, isPrivate, collaborators);
    setUserLists(prev => [newList, ...prev]);
    if (itemToSaveId) {
        handleSaveToExistingList(newList.id);
    }
  };

  const handlePostCreated = async () => {
    const newFeed = await api.getFeed();
    setFeed(newFeed);
    if (feedContainerRef.current) {
        feedContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveTab('home');
  };

  // --- HOME FEED RENDERER ---
  const renderHomeFeed = () => {
    // Determine which list to show:
    // 1. If searching AND clicked a result -> show reordered filtered list
    // 2. If NOT searching -> show main feed
    // 3. If searching BUT viewing grid -> Handled by renderSearchOverlay

    let displayFeed = feed;
    
    if (activeSearchResultId) {
        const selectedIndex = filteredFeed.findIndex(p => p.id === activeSearchResultId);
        // Put selected item first
        displayFeed = [
            ...filteredFeed.slice(selectedIndex),
            ...filteredFeed.slice(0, selectedIndex)
        ];
    } else if (isSearching) {
        // If searching but no result selected, we show the Search Overlay (Grid) instead of feed
        return renderSearchOverlay();
    }

    return (
      <div 
        ref={feedContainerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth bg-black pt-16" // pt-16 for header
      >
        {isLoading && (
           <div className="h-full w-full flex items-center justify-center bg-black">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
           </div>
        )}
        
        {!isLoading && displayFeed.map((item, index) => (
          <TikTokFeedItem 
            key={item.id} 
            item={item} 
            isActive={index === currentFeedIndex}
            onInteractionComplete={handleInteractionComplete}
            onOpenProfile={(id, isBiz) => setViewedProfile({id, isBusiness: isBiz})}
            onSaveClick={() => handleSaveClick(item.id)}
            onCommentsClick={() => handleCommentsClick(item.id)}
            onShareClick={handleShareClick}
            onReadMore={() => setReviewToRead(item)}
          />
        ))}
        
        {!isLoading && displayFeed.length === 0 && (
            <div className="h-full flex items-center justify-center text-white bg-black">
                <p>No posts found.</p>
            </div>
        )}
      </div>
    );
  };

  // --- SEARCH OVERLAY RENDERER ---
  const renderSearchOverlay = () => {
      const vibes = [
        { name: 'Burgers', emoji: '🍔' },
        { name: 'Pizza', emoji: '🍕' },
        { name: 'Date Night', emoji: '🍷' },
        { name: 'Coffee', emoji: '☕️' },
        { name: 'Dessert', emoji: '🍦' },
      ];
      const featuredBusinesses = Object.values(BUSINESSES);

      return (
          <div className="h-full w-full bg-white pt-20 pb-24 overflow-y-auto">
              
              {/* Quick Filters */}
              <div className="px-4 mb-6">
                 <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                    {vibes.map(v => (
                        <button 
                            key={v.name}
                            onClick={() => setSearchQuery(v.name)}
                            className="flex items-center space-x-1 px-4 py-2 bg-gray-100 rounded-full whitespace-nowrap hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                            <span>{v.emoji}</span>
                            <span className="text-sm font-bold">{v.name}</span>
                        </button>
                    ))}
                 </div>
              </div>

              {/* Trending Spots */}
              {!searchQuery && (
                  <div className="mb-8">
                     <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Trending Spots</h3>
                     <div className="flex space-x-4 overflow-x-auto no-scrollbar px-4">
                         {featuredBusinesses.map((biz) => (
                             <div key={biz.id} className="flex flex-col items-center space-y-2 min-w-[72px] cursor-pointer" onClick={() => setSearchQuery(biz.name)}>
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
                  </div>
              )}

              {/* Masonry Grid Results */}
              <div className="px-2">
                 <h3 className="px-2 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                     {searchQuery ? `Results for "${searchQuery}"` : 'Explore'}
                 </h3>
                 <div className="columns-2 gap-2 space-y-2">
                    {(searchQuery ? filteredFeed : MOCK_FEED).map((item) => (
                        <div 
                          key={item.id} 
                          className="break-inside-avoid relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
                          onClick={() => setActiveSearchResultId(item.id)}
                        >
                            <img src={item.imageUrl} alt="" className="w-full h-auto object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                 {searchQuery && filteredFeed.length === 0 && (
                     <div className="text-center py-10 text-gray-400 text-sm">No results found.</div>
                 )}
              </div>
          </div>
      );
  };


  // --- MAIN RENDER LOGIC ---
  let mainContent;

  if (viewedProfile) {
    mainContent = (
      <ProfileView 
        profileId={viewedProfile.id} 
        isBusiness={viewedProfile.isBusiness} 
        onBack={() => setViewedProfile(null)}
        customLists={viewedProfile.id === 'u1' ? userLists : undefined}
        onSaveClick={handleSaveClick}
      />
    );
  } else {
    switch (activeTab) {
      case 'home':
        mainContent = renderHomeFeed();
        break;
      case 'map':
        mainContent = <MapView onOpenProfile={(id, isBiz) => setViewedProfile({id, isBusiness: isBiz})} />;
        break;
      case 'profile':
        mainContent = (
          <ProfileView 
            profileId="u1" 
            isBusiness={false} 
            isOwnProfile={true} 
            customLists={userLists}
            onSaveClick={handleSaveClick}
          />
        );
        break;
    }
  }

  // --- HEADER CONTENT FOR HOME ---
  const HomeHeaderSearchBar = (
    <div className="w-full flex items-center space-x-2 pt-2">
          {activeSearchResultId ? (
               <button 
                  onClick={() => setActiveSearchResultId(null)}
                  className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white"
               >
                  <ChevronLeft className="w-5 h-5" />
               </button>
          ) : null}

          <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-4 w-4 ${isSearching || activeSearchResultId ? 'text-gray-500' : 'text-white'}`} />
              </div>
              <input
                  ref={searchInputRef}
                  type="text"
                  className={`block w-full pl-10 pr-10 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md
                      ${isSearching || activeSearchResultId
                        ? 'bg-gray-100 text-gray-900 placeholder-gray-500 shadow-sm' 
                        : 'bg-white/20 text-white placeholder-white/70 border border-white/30 focus:bg-white/30'
                      }
                      focus:outline-none focus:ring-0
                  `}
                  placeholder="Search cravings..."
                  value={searchQuery}
                  onFocus={handleSearchFocus}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
              {(isSearching || searchQuery) && (
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                      <button onClick={handleSearchCancel} className="p-1 rounded-full hover:bg-gray-200">
                          <X className="h-4 w-4 text-gray-500" />
                      </button>
                  </div>
              )}
          </div>
      </div>
  );

  // Logic to hide header entirely when viewing profile
  const headerContent = (viewedProfile || activeTab === 'profile') 
     ? null // Pass null to hide
     : (activeTab === 'home' ? HomeHeaderSearchBar : undefined); // undefined falls back to CraveRate text

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          if (tab === 'home') {
              // If already on home, reset search
              if (activeTab === 'home') handleSearchCancel();
          }
          setActiveTab(tab);
          setViewedProfile(null);
        }}
        onCreateClick={() => setIsCreateModalOpen(true)}
        isImmersive={activeTab === 'home' && !viewedProfile && !isSearching && !activeSearchResultId}
        headerContent={headerContent}
      >
        {mainContent}
      </Layout>

      {/* MODALS */}
      <SaveCollectionModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        existingLists={userLists}
        onSaveToExisting={handleSaveToExistingList}
        onCreateNewList={handleCreateNewList}
      />

      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        postId={activePostIdForComments}
      />

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <ReviewDetailModal
        isOpen={!!reviewToRead}
        onClose={() => setReviewToRead(null)}
        review={reviewToRead}
      />
    </>
  );
};

export default App;