
import React, { useState } from 'react';
import { ChevronLeft, MoreHorizontal, MapPin, Grid, Layers, BadgeCheck, Star, Users, Phone, Globe, MessageSquare, Play, Bookmark, Instagram, Twitter, Youtube, Link as LinkIcon, PenLine, Wifi, Car, Clock, CreditCard, Sparkles, Utensils, Info } from 'lucide-react';
import { MOCK_FEED, MOCK_LISTS, BUSINESSES, USERS } from '../mockData';
import { ContentType, Business, UserList, Review } from '../types';

interface ProfileViewProps {
  profileId: string;
  isBusiness?: boolean;
  onBack?: () => void;
  isOwnProfile?: boolean;
  customLists?: UserList[]; 
  onSaveClick?: (id: string) => void;
  onWriteReview?: (business: Business) => void;
  onPostClick?: (post: Review) => void;
  onCreateListClick?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  profileId, 
  isBusiness = false, 
  onBack, 
  isOwnProfile = false, 
  customLists, 
  onSaveClick, 
  onWriteReview,
  onPostClick,
  onCreateListClick
}) => {
  // 1. Data Retrieval
  let profileData: any = null;

  if (isBusiness) {
    profileData = Object.values(BUSINESSES).find(b => b.id === profileId);
  } else {
    profileData = Object.values(USERS).find(u => u.id === profileId);
  }

  if (!profileData) {
      profileData = MOCK_FEED.find(item => 
        isBusiness ? item.businessId === profileId : item.author.id === profileId
      )?.author;
  }

  const displayProfile = profileData || {
    username: 'unknown',
    displayName: 'Unknown',
    avatarUrl: '',
    coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80',
    bio: '',
    postsCount: 0,
    isVerified: false
  } as any;

  // 2. Filter Content
  const userPosts = MOCK_FEED.filter(item => item.author.id === profileId);
  const userLists = customLists || MOCK_LISTS.filter(list => list.authorId === profileId);
  
  // Spotlight is content authored BY the business
  const businessSpotlight = MOCK_FEED.filter(item => 
    (isBusiness && item.author.id === profileId) || 
    (isBusiness && item.businessId === profileId && item.type === ContentType.BUSINESS_POST)
  );
  
  // Community is content authored BY users about this business
  const businessCommunityReviews = MOCK_FEED.filter(item => 
    item.businessId === profileId && item.type === ContentType.USER_REVIEW
  );

  // 3. Tab State
  const [activeTab, setActiveTab] = useState<string>('left');

  const RatingBar = ({ stars, count, total }: { stars: number, count: number, total: number }) => (
    <div className="flex items-center space-x-2 text-xs">
        <span className="w-3 font-semibold text-gray-600">{stars}</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-yellow-400 rounded-full" 
                style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
            />
        </div>
    </div>
  );

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar bg-white pb-48 relative scroll-smooth">
      
      {/* --- HERO HEADER --- */}
      <div className="relative">
         {/* Cover Image */}
         <div className="h-44 w-full overflow-hidden">
            <img 
                src={displayProfile.coverImageUrl || displayProfile.coverUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80'} 
                alt="cover" 
                className="w-full h-full object-cover brightness-75"
            />
         </div>

         {/* Navigation Overlay */}
         <div className="absolute top-0 left-0 right-0 p-4 flex items-center text-white z-10 pt-6">
            {onBack && (
                <button onClick={onBack} className="bg-black/20 backdrop-blur-md p-2.5 rounded-full hover:bg-black/40 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}
         </div>

         {/* Avatar Layer */}
         <div className="absolute -bottom-14 left-4">
             <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                    <img src={displayProfile.avatarUrl} alt="profile" className="w-full h-full object-cover" />
                </div>
                {isBusiness ? (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full border-2 border-white shadow-sm uppercase tracking-wider">
                        Business
                    </div>
                ) : displayProfile.isVerified && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1 border-2 border-white">
                        <BadgeCheck className="w-4 h-4 text-white fill-white" />
                    </div>
                )}
             </div>
         </div>
      </div>

      {/* --- PROFILE INFO --- */}
      <div className="pt-16 px-5 pb-2">
         <div className="flex justify-between items-start">
             <div className="flex-1 pr-4">
                <h1 className="font-black text-2xl text-gray-900 leading-none flex items-center">
                    {displayProfile.displayName || displayProfile.name}
                    {displayProfile.isVerified && <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-50 ml-2" />}
                </h1>
                <p className="text-gray-400 font-bold text-sm mt-1.5 uppercase tracking-wide">@{displayProfile.username}</p>
             </div>
             
             {isBusiness && (
                 <div className="flex flex-col space-y-2">
                    <button 
                        onClick={() => onWriteReview && onWriteReview(displayProfile as Business)}
                        className="bg-orange-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center space-x-2"
                    >
                        <PenLine className="w-3.5 h-3.5" />
                        <span>Rate & Review</span>
                    </button>
                 </div>
             )}
         </div>

         {/* Bio & Details */}
         <div className="mt-5">
             {isBusiness && (
                 <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3 font-bold uppercase tracking-wide">
                    <span className="text-orange-600">{displayProfile.category}</span>
                    <span className="text-gray-200">|</span>
                    <span className="text-emerald-600">{displayProfile.priceLevel}</span>
                    <span className="text-gray-200">|</span>
                    <div className="flex items-center">
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${displayProfile.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={displayProfile.isOpen ? 'text-emerald-600' : 'text-rose-500'}>
                            {displayProfile.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                    </div>
                 </div>
             )}
             <p className="text-gray-700 text-sm leading-relaxed max-w-sm font-medium">
                 {displayProfile.bio || (isBusiness ? "Crafting memorable flavors in the heart of the city. Join us for an authentic experience. ✨" : "Exploring the world one bite at a time. 🌍🍴")}
             </p>
             
             {/* SOCIAL LINKS */}
             {!isBusiness && displayProfile.socialLinks && (
                 <div className="flex items-center space-x-3 mt-5">
                     {displayProfile.socialLinks.instagram && (
                        <a 
                          href={`https://instagram.com/${displayProfile.socialLinks.instagram}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-all active:scale-95"
                        >
                            <Instagram className="w-5 h-5" />
                        </a>
                     )}
                     {displayProfile.socialLinks.tiktok && (
                        <a 
                          href={`https://tiktok.com/@${displayProfile.socialLinks.tiktok}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                        >
                             <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                        </a>
                     )}
                     {displayProfile.socialLinks.twitter && (
                        <a 
                          href={`https://twitter.com/${displayProfile.socialLinks.twitter}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-sky-50 text-sky-500 rounded-xl hover:bg-sky-100 transition-all active:scale-95"
                        >
                            <Twitter className="w-5 h-5" />
                        </a>
                     )}
                 </div>
             )}

             {isBusiness && (
                <div className="flex flex-col space-y-3 mt-6 border-y border-gray-50 py-5">
                    <div className="flex items-center text-gray-600 text-xs font-bold">
                        <MapPin className="w-4 h-4 mr-3 text-orange-500" />
                        {displayProfile.location}
                    </div>
                    <div className="flex items-center text-gray-600 text-xs font-bold">
                        <Phone className="w-4 h-4 mr-3 text-orange-500" />
                        +30 210 555 1234
                    </div>
                    <div className="flex items-center text-gray-600 text-xs font-bold">
                        <Clock className="w-4 h-4 mr-3 text-orange-500" />
                        Mon - Sun: 12:00 PM - 12:00 AM
                    </div>
                </div>
             )}
         </div>

         {/* Amenities Section for Business */}
         {isBusiness && (
             <div className="mt-8">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                    <Info className="w-3.5 h-3.5 mr-2" /> Amenities & Vibe
                 </h3>
                 <div className="grid grid-cols-2 gap-3">
                     {[
                         { icon: Wifi, text: 'Free Wi-Fi' },
                         { icon: Car, text: 'Parking Available' },
                         { icon: CreditCard, text: 'Cards Accepted' },
                         { icon: Utensils, text: 'Outdoor Seating' },
                         { icon: Sparkles, text: 'Scenic View' },
                         { icon: Users, text: 'Group Friendly' }
                     ].map((item, idx) => (
                         <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                             <item.icon className="w-4 h-4 text-orange-500/60" />
                             <span className="text-[11px] font-bold text-gray-600">{item.text}</span>
                         </div>
                     ))}
                 </div>
             </div>
         )}
         
         {isOwnProfile && (
             <div className="mt-6">
                 <button className="w-full py-3.5 bg-gray-50 text-gray-900 font-black rounded-[1.25rem] border border-gray-100 text-[10px] uppercase tracking-widest active:scale-95 transition-transform hover:bg-gray-100">Edit Profile</button>
             </div>
         )}
      </div>

      {/* --- BUSINESS RATING SUMMARY --- */}
      {isBusiness && (displayProfile as Business).ratingBreakdown && (
        <div className="px-5 py-6 border-t border-b border-gray-50 mx-5 my-8 rounded-[2rem] bg-gray-50/50">
            <div className="flex items-center space-x-8">
                <div className="flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-gray-900 tracking-tighter">{displayProfile.rating}</span>
                    <div className="flex text-yellow-400 space-x-0.5 my-2">
                        {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= Math.round(displayProfile.rating) ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{displayProfile.reviewCount} Reviews</span>
                </div>
                <div className="flex-1 space-y-1.5 border-l border-gray-100 pl-8">
                    <RatingBar stars={5} count={(displayProfile as Business).ratingBreakdown![5]} total={displayProfile.reviewCount!} />
                    <RatingBar stars={4} count={(displayProfile as Business).ratingBreakdown![4]} total={displayProfile.reviewCount!} />
                    <RatingBar stars={3} count={(displayProfile as Business).ratingBreakdown![3]} total={displayProfile.reviewCount!} />
                    <RatingBar stars={2} count={(displayProfile as Business).ratingBreakdown![2]} total={displayProfile.reviewCount!} />
                    <RatingBar stars={1} count={(displayProfile as Business).ratingBreakdown![1]} total={displayProfile.reviewCount!} />
                </div>
            </div>
        </div>
      )}

      {/* --- TABS --- */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 border-b border-gray-100 flex mt-4 shadow-sm">
        {isBusiness ? (
            <>
                <button 
                    className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] relative transition-colors flex items-center justify-center space-x-2 ${activeTab === 'left' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('left')}
                >
                    <span>Spotlight</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === 'left' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100'}`}>{businessSpotlight.length}</span>
                    {activeTab === 'left' && <div className="absolute bottom-0 inset-x-8 h-1 bg-orange-600 rounded-t-full" />}
                </button>
                <button 
                    className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] relative transition-colors flex items-center justify-center space-x-2 ${activeTab === 'right' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('right')}
                >
                    <span>Community</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === 'right' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100'}`}>{businessCommunityReviews.length}</span>
                    {activeTab === 'right' && <div className="absolute bottom-0 inset-x-8 h-1 bg-orange-600 rounded-t-full" />}
                </button>
            </>
        ) : (
            <>
                <button 
                    className={`flex-1 py-5 flex justify-center items-center relative transition-colors space-x-2 ${activeTab === 'left' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('left')}
                >
                    <Grid className="w-5 h-5" />
                    <span className="text-[10px] font-black">{userPosts.length}</span>
                    {activeTab === 'left' && <div className="absolute bottom-0 inset-x-10 h-1 bg-orange-600 rounded-t-full" />}
                </button>
                <button 
                    className={`flex-1 py-5 flex justify-center items-center relative transition-colors space-x-2 ${activeTab === 'center' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('center')}
                >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[10px] font-black">{userPosts.length}</span>
                    {activeTab === 'center' && <div className="absolute bottom-0 inset-x-10 h-1 bg-orange-600 rounded-t-full" />}
                </button>
                <button 
                    className={`flex-1 py-5 flex justify-center items-center relative transition-colors space-x-2 ${activeTab === 'right' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('right')}
                >
                    <Layers className="w-5 h-5" />
                    <span className="text-[10px] font-black">{userLists.length}</span>
                    {activeTab === 'right' && <div className="absolute bottom-0 inset-x-10 h-1 bg-orange-600 rounded-t-full" />}
                </button>
            </>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="min-h-[400px] bg-gray-50/20">
        
        {/* === POSTS / SPOTLIGHT GRID (Left Tab) === */}
        {activeTab === 'left' && (
             <div className="grid grid-cols-3 gap-0.5 pt-0.5">
                {(isBusiness ? businessSpotlight : userPosts).map((item) => (
                    <div key={item.id} onClick={() => onPostClick?.(item)} className="aspect-[3/4] bg-gray-100 relative group cursor-pointer overflow-hidden">
                        <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                        
                        {/* Type Indicator */}
                        <div className="absolute top-2 right-2">
                             {item.mediaType === 'video' ? (
                                 <div className="p-1 bg-black/30 backdrop-blur-md rounded-lg">
                                    <Play className="w-3 h-3 text-white fill-white/50" />
                                 </div>
                             ) : null}
                        </div>

                        {/* Stats Overlay */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center text-white text-[10px] font-black tracking-widest opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-2" />
                            {item.agreeCount}
                        </div>
                    </div>
                ))}
                {(isBusiness ? businessSpotlight : userPosts).length === 0 && (
                     <div className="col-span-3 py-24 flex flex-col items-center justify-center text-gray-300">
                         <div className="bg-white p-8 rounded-full mb-4 shadow-sm border border-gray-50">
                            <Grid className="w-12 h-12 opacity-20" />
                         </div>
                         <p className="text-[11px] font-black uppercase tracking-widest opacity-40">No captures found</p>
                     </div>
                )}
             </div>
        )}

        {/* === USER TEXT REVIEWS (Center Tab - User Only) === */}
        {activeTab === 'center' && !isBusiness && (
            <div className="divide-y divide-gray-50 bg-white">
                {userPosts.map(item => (
                    <div key={item.id} onClick={() => onPostClick?.(item)} className="p-6 flex gap-5 hover:bg-gray-50/50 transition-colors cursor-pointer">
                        <div className="w-24 h-28 rounded-3xl bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                            <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-black text-sm text-gray-900 tracking-tight">{item.businessName}</h4>
                                <div className="flex items-center text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100/50">
                                    <Star className="w-2.5 h-2.5 fill-current mr-1" />
                                    {item.rating?.toFixed(1)}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2.5 font-medium line-clamp-3 leading-relaxed">{item.text}</p>
                            <div className="mt-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.1em]">{item.timestamp}</div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onSaveClick?.(item.id); }}
                                className="p-3.5 rounded-full hover:bg-gray-100 text-gray-300 hover:text-orange-500 transition-all active:scale-90"
                            >
                                <Bookmark className="w-5.5 h-5.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}


        {/* === LISTS (Right Tab for User) or COMMUNITY (Right Tab for Business) === */}
        {activeTab === 'right' && (
            isBusiness ? (
                // Business Community Reviews
                <div className="grid grid-cols-3 gap-0.5 pt-0.5">
                     {businessCommunityReviews.map((item) => (
                        <div key={item.id} onClick={() => onPostClick?.(item)} className="aspect-square bg-gray-100 relative group cursor-pointer overflow-hidden">
                            <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors" />
                            <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full border border-white/50 overflow-hidden shadow-sm">
                                    <img src={item.author.avatarUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                                <span className="text-[10px] font-black text-white drop-shadow-md truncate max-w-[60px]">@{item.author.username}</span>
                            </div>
                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black shadow-lg">
                                ⭐ {item.rating}
                            </div>
                        </div>
                     ))}
                     {businessCommunityReviews.length === 0 && (
                        <div className="col-span-3 py-24 text-center text-gray-300">
                             <div className="bg-white p-8 rounded-full inline-block mb-4 shadow-sm border border-gray-50">
                                <Users className="w-12 h-12 opacity-20" />
                             </div>
                             <p className="text-[11px] font-black uppercase tracking-widest opacity-40">No community feedback</p>
                        </div>
                    )}
                </div>
            ) : (
                // User Lists
                <div className="p-5 space-y-6">
                    {userLists.map((list) => (
                        <div key={list.id} className="relative aspect-[2.8/1] rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer border border-white/20">
                            <img src={list.coverUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.7]" alt={list.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="font-black text-xl text-white leading-tight mb-1.5 tracking-tight">{list.title}</h3>
                                        <div className="flex items-center space-x-3 text-white/70 text-[10px] font-black uppercase tracking-widest">
                                            <span>{list.itemCount} Places</span>
                                            {list.collaborators && list.collaborators.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <div className="flex -space-x-2.5">
                                                        {list.collaborators.slice(0,3).map(c => (
                                                            <div key={c.id} className="w-6 h-6 rounded-full border-2 border-white/30 overflow-hidden shadow-sm">
                                                                <img src={c.avatarUrl} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                        ))}
                                                        {list.collaborators.length > 3 && (
                                                            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white border-2 border-white/30">
                                                                +{list.collaborators.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-1.5">
                                        {list.isPrivate && (
                                            <div className="bg-black/30 backdrop-blur-md p-2 rounded-xl border border-white/20">
                                                <BadgeCheck className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {userLists.length === 0 && (
                        <div className="py-24 flex flex-col items-center text-gray-300">
                            <div className="bg-white p-8 rounded-full mb-5 shadow-sm border border-gray-50">
                                <Layers className="w-12 h-12 opacity-20" />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest opacity-40">Collections are empty</p>
                            <button 
                              onClick={onCreateListClick}
                              className="mt-8 px-8 py-3 bg-orange-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                            >
                              Create List
                            </button>
                        </div>
                    )}
                </div>
            )
        )}
      </div>

    </div>
  );
};
