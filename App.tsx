import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, X, Play, Star, ChevronLeft, MapPin, Zap, ArrowLeft, Grid3X3 } from 'lucide-react';
import { Layout } from './components/Layout';
import { TikTokFeedItem } from './components/TikTokFeedItem';
import { ProfileView } from './components/ProfileView';
import { MapView } from './components/MapView';
import { SaveCollectionModal } from './components/SaveCollectionModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CommentsModal } from './components/CommentsModal';
import { ShareModal } from './components/ShareModal';
import { ReviewDetailModal } from './components/ReviewDetailModal';
import { UserList, User, Review, Business } from './types';
import { api } from './services/api';
import { BUSINESSES } from './mockData';

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
  const [allPosts, setAllPosts] = useState<Review[]>([]); // New state for search source
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false); 
  const [filteredFeed, setFilteredFeed] = useState<Review[]>([]);
  
  // New State for Grid View vs Feed View in Search
  const [isGridView, setIsGridView] = useState(false);

  // Interaction State
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const [itemToSaveId, setItemToSaveId] = useState<string | null>(null);
  const [activePostIdForComments, setActivePostIdForComments] = useState<string | null>(null);
  const [reviewToRead, setReviewToRead] = useState<Review | null>(null);
  const [reviewTargetBusiness, setReviewTargetBusiness] = useState<Business | null>(null); // New State for Direct Reviews

  const feedContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- INITIAL DATA FETCH ---
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
        console.error("Failed to fetch data", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- SEARCH LOGIC ---
  // When searchQuery changes, update the filtered list based on ALL_POSTS
  useEffect(() => {
      if (searchQuery.trim()) {
          const lowerQ = searchQuery.toLowerCase();
          // SEARCH AGAINST ALL POSTS, not just current feed
          const results = allPosts.filter(item => 
              item.businessName.toLowerCase().includes(lowerQ) ||
              item.text.toLowerCase().includes(lowerQ) ||
              item.tags?.some(tag => tag.toLowerCase().includes(lowerQ))
          );
          setFilteredFeed(results);
      } else {
          setFilteredFeed([]);
      }
  }, [searchQuery, allPosts]);

  // Executed when a user picks a category or hits enter
  const performSearch = (query: string) => {
      setSearchQuery(query);
      setIsSearchOverlayOpen(false); // Close the Launcher Overlay
      setIsGridView(true); // SHOW GRID RESULTS FIRST
      
      if (feedContainerRef.current) {
          feedContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
  };

  const handleSearchFocus = () => {
      setIsSearchOverlayOpen(true);
  };

  const handleClearSearch = () => {
      setSearchQuery('');
      setIsSearchOverlayOpen(false);
      setIsGridView(false);
      setFilteredFeed([]);
      
      // Crucial: Reset feed index so main feed starts at top
      setCurrentFeedIndex(0); 
      if (feedContainerRef.current) {
          feedContainerRef.current.scrollTo({ top: 0 });
      }
  };

  // --- HANDLERS ---
  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (!isGridView) {
          const index = Math.round(container.scrollTop / container.clientHeight);
          if (index >= 0) {
            setCurrentFeedIndex(index);
          }
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isGridView, searchQuery]);

  const handleInteractionComplete = () => {
    if (feedContainerRef.current && !isGridView) {
      setTimeout(() => {
        // Calculate next scroll pos
        feedContainerRef.current?.scrollTo({
          top: feedContainerRef.current.scrollTop + feedContainerRef.current.clientHeight,
          behavior: 'smooth'
        });
      }, 300);
    }
  };

  const handleGridItemClick = (itemId: string) => {
      // 1. Switch to feed view
      setIsGridView(false); 
      
      // 2. Reorder filteredFeed so the clicked item is first
      const index = filteredFeed.findIndex(i => i.id === itemId);
      if (index > 0) {
          const reordered = [
              ...filteredFeed.slice(index),
              ...filteredFeed.slice(0, index)
          ];
          setFilteredFeed(reordered);
      }
      
      // 3. Reset scroll and index to make it feel like a fresh feed
      setCurrentFeedIndex(0);
      if (feedContainerRef.current) {
          feedContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
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
    setReviewTargetBusiness(null); // Clear selection after post
  };

  const handleWriteReview = (business: Business) => {
      setReviewTargetBusiness(business);
      setIsCreateModalOpen(true);
  };

  // --- SEARCH RESULTS GRID RENDERER ---
  const renderSearchResultsGrid = () => {
      return (
          <div className="h-full w-full bg-white pt-24 pb-24 overflow-y-auto px-2 animate-[fadeIn_0.3s_ease-out]">
             <div className="flex justify-between items-center px-2 mb-4">
                 <h2 className="text-sm font-bold text-gray-900">
                     {filteredFeed.length} results for "{searchQuery}"
                 </h2>
             </div>
             
             <div className="columns-2 gap-2 space-y-2">
                 {filteredFeed.map((item) => (
                    <div 
                        key={item.id} 
                        className="break-inside-avoid relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
                        onClick={() => handleGridItemClick(item.id)}
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
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                                {item.rating}
                            </div>
                        </div>
                    </div>
                 ))}
             </div>

             {filteredFeed.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>No results found.</p>
                </div>
             )}
          </div>
      );
  };

  // --- HOME FEED RENDERER ---
  const renderHomeFeed = () => {
    // Determine the data source.
    // Use filteredFeed if in search mode (query exists), else use main feed.
    const isSearchMode = searchQuery.trim().length > 0;
    const displayFeed = isSearchMode ? filteredFeed : feed;

    return (
      <div 
        ref={feedContainerRef}
        // Changing key forces React to treat this as a new component when switching modes, ensuring scroll reset and state clean up
        key={isSearchMode ? 'search-feed' : 'main-feed'} 
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth bg-black pt-0"
      >
        {/* Back to Grid Button (Only visible if we came from search grid) */}
        {isSearchMode && !isGridView && (
             <div className="fixed top-24 left-0 right-0 z-20 flex justify-center pointer-events-none">
                 <button 
                    onClick={() => setIsGridView(true)}
                    className="pointer-events-auto bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center space-x-2 border border-white/10 hover:bg-black/60 transition-colors shadow-lg animate-[fadeIn_0.5s_ease-out]"
                 >
                     <Grid3X3 className="w-4 h-4" />
                     <span className="text-xs font-bold">Results Grid</span>
                 </button>
             </div>
        )}

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
            <div className="h-full flex flex-col items-center justify-center text-white bg-black space-y-4">
                <Search className="w-12 h-12 text-gray-700" />
                <p className="text-gray-400 font-medium">No results found for "{searchQuery}"</p>
                <button 
                    onClick={handleClearSearch}
                    className="text-orange-500 font-bold text-sm hover:underline"
                >
                    Clear Search
                </button>
            </div>
        )}
      </div>
    );
  };

  // --- SEARCH OVERLAY (The Launcher) ---
  const renderSearchOverlay = () => {
      if (!isSearchOverlayOpen) return null;

      const vibes = [
        { name: 'Burgers', emoji: '🍔' },
        { name: 'Pizza', emoji: '🍕' },
        { name: 'Sushi', emoji: '🍣' },
        { name: 'Tacos', emoji: '🌮' },
        { name: 'Coffee', emoji: '☕️' },
        { name: 'Dessert', emoji: '🍦' },
        { name: 'Asian', emoji: '🍜' },
        { name: 'Vegan', emoji: '🥗' },
      ];
      const featuredBusinesses = Object.values(BUSINESSES);

      return (
          <div className="absolute inset-0 z-20 bg-white pt-24 pb-24 overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
              
              {/* Quick Filters - GRID LAYOUT */}
              <div className="px-4 mb-8">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Browse Categories</h3>
                 <div className="grid grid-cols-4 gap-3">
                    {vibes.map(v => (
                        <button 
                            key={v.name}
                            onClick={() => performSearch(v.name)}
                            className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl hover:bg-orange-50 active:scale-95 transition-all group border border-transparent hover:border-orange-100"
                        >
                            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{v.emoji}</span>
                            <span className="text-[10px] font-bold text-gray-600 group-hover:text-orange-600">{v.name}</span>
                        </button>
                    ))}
                 </div>
              </div>

              {/* Trending Spots - NEAR ME */}
              <div className="mb-8">
                 <div className="px-5 flex items-center justify-between mb-3">
                     <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trending Near You</h3>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                     </div>
                     <span className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                        <MapPin className="w-3 h-3 mr-1" />
                        Athens
                     </span>
                 </div>
                 <div className="flex space-x-4 overflow-x-auto no-scrollbar px-5 pb-2">
                     {featuredBusinesses.map((biz) => (
                         <div 
                            key={biz.id} 
                            className="flex flex-col space-y-2 min-w-[120px] cursor-pointer group" 
                            onClick={() => {
                                // Updated to open profile directly instead of search
                                setViewedProfile({ id: biz.id, isBusiness: true });
                                setIsSearchOverlayOpen(false);
                            }}
                         >
                             <div className="w-32 h-40 rounded-xl overflow-hidden relative shadow-md">
                                 <img src={biz.coverImageUrl} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                                 <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center shadow-sm">
                                     {biz.rating} <Star className="w-2 h-2 ml-0.5 fill-orange-400 text-orange-400" />
                                 </div>
                                 <div className="absolute bottom-2 left-2 text-white">
                                      <div className="w-6 h-6 rounded-full border border-white mb-1 overflow-hidden">
                                          <img src={biz.avatarUrl} className="w-full h-full object-cover" alt="" />
                                      </div>
                                 </div>
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">{biz.name}</p>
                                 <div className="flex items-center text-[10px] text-gray-400">
                                    <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-0.5" />
                                    <span>Popular now</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
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
        onWriteReview={handleWriteReview}
      />
    );
  } else {
    switch (activeTab) {
      case 'home':
        mainContent = (
            <>
                {/* 
                    If isGridView is true, show Grid Results.
                    Else, show Feed (which could be the main feed or the filtered feed).
                */}
                {isGridView ? renderSearchResultsGrid() : renderHomeFeed()}
                
                {/* Launcher Overlay sits on top of everything when activated */}
                {renderSearchOverlay()}
            </>
        );
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
    <div className="w-full flex items-center space-x-3 pointer-events-auto py-2">
          {/* Back Button logic - floating circle */}
          {(searchQuery || isSearchOverlayOpen) ? (
               <button 
                  onClick={() => {
                      if (isGridView) {
                          handleClearSearch();
                      } else if (searchQuery) {
                          // If in feed view with search, go back to grid
                          setIsGridView(true);
                      } else {
                          handleClearSearch();
                      }
                  }}
                  className="p-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-white hover:bg-white/30 shadow-lg transition-all animate-[fadeIn_0.2s_ease-out]"
               >
                  <ChevronLeft className={`w-5 h-5 ${isSearchOverlayOpen ? 'text-gray-800' : 'text-white'}`} />
               </button>
          ) : null}

          {/* Island Input */}
          <div className="flex-1 relative group transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search className={`h-4 w-4 transition-colors ${isSearchOverlayOpen ? 'text-gray-400' : 'text-white'}`} />
              </div>
              <input
                  ref={searchInputRef}
                  type="text"
                  className={`block w-full pl-11 pr-10 py-3.5 rounded-full text-sm font-bold transition-all shadow-xl
                      ${isSearchOverlayOpen 
                        ? 'bg-white text-gray-900 placeholder-gray-400 ring-4 ring-gray-100' 
                        : 'bg-white/10 text-white placeholder-white/90 border border-white/20 backdrop-blur-xl hover:bg-white/20'
                      }
                      focus:outline-none
                  `}
                  placeholder="Search cravings..."
                  value={searchQuery}
                  onFocus={handleSearchFocus}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          performSearch(searchQuery);
                          e.currentTarget.blur();
                      }
                  }}
              />
              {searchQuery && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                      <button onClick={handleClearSearch} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500">
                          <X className="h-3 w-3" />
                      </button>
                  </div>
              )}
          </div>
      </div>
  );

  // Logic to hide header entirely when viewing profile
  const headerContent = (viewedProfile || activeTab === 'profile') 
     ? null // Pass null to hide
     : (activeTab === 'home' ? HomeHeaderSearchBar : undefined); 

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          if (tab === 'home') {
              if (activeTab === 'home') {
                  // Tapping home while on home clears search and resets to main feed
                  handleClearSearch();
              }
          }
          setActiveTab(tab);
          setViewedProfile(null);
        }}
        onCreateClick={() => setIsCreateModalOpen(true)}
        isImmersive={activeTab === 'home' && !viewedProfile && !isSearchOverlayOpen && !isGridView}
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
        onClose={() => { setIsCreateModalOpen(false); setReviewTargetBusiness(null); }}
        onPostCreated={handlePostCreated}
        preselectedBusiness={reviewTargetBusiness}
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