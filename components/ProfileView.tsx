import React, { useState } from 'react';
import { ChevronLeft, MoreHorizontal, MapPin, Grid, Layers, BadgeCheck, Star, Users, Phone, Globe, MessageSquare, Play, Bookmark, Instagram, Twitter, Youtube, Link as LinkIcon, PenLine } from 'lucide-react';
import { MOCK_FEED, MOCK_LISTS, BUSINESSES, USERS } from '../mockData';
import { ContentType, Business, UserList } from '../types';

interface ProfileViewProps {
  profileId: string;
  isBusiness?: boolean;
  onBack?: () => void;
  isOwnProfile?: boolean;
  customLists?: UserList[]; 
  onSaveClick?: (id: string) => void;
  onWriteReview?: (business: Business) => void; // New callback
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profileId, isBusiness = false, onBack, isOwnProfile = false, customLists, onSaveClick, onWriteReview }) => {
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
  
  const businessSpotlight = MOCK_FEED.filter(item => item.author.id === profileId && item.type === ContentType.BUSINESS_POST);
  const businessCommunityReviews = MOCK_FEED.filter(item => item.businessId === profileId && item.type === ContentType.USER_REVIEW);

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
    <div className="bg-white min-h-full pb-20 relative">
      
      {/* --- HERO HEADER --- */}
      <div className="relative">
         {/* Cover Image Parallax-ish */}
         <div className="h-40 w-full overflow-hidden">
            <img 
                src={displayProfile.coverImageUrl || displayProfile.coverUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80'} 
                alt="cover" 
                className="w-full h-full object-cover brightness-75"
            />
         </div>

         {/* Navigation Overlay */}
         <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10">
            {onBack ? (
                <button onClick={onBack} className="bg-black/20 backdrop-blur-md p-2 rounded-full hover:bg-black/40 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
            ) : <div />}
            <button className="bg-black/20 backdrop-blur-md p-2 rounded-full hover:bg-black/40 transition-colors">
                <MoreHorizontal className="w-6 h-6" />
            </button>
         </div>

         {/* Avatar Layer */}
         <div className="absolute -bottom-12 left-4">
             <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                    <img src={displayProfile.avatarUrl} alt="profile" className="w-full h-full object-cover" />
                </div>
                {isBusiness ? (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full border-2 border-white shadow-sm uppercase tracking-wider">
                        Business
                    </div>
                ) : displayProfile.isVerified && (
                    <div className="absolute bottom-1 right-1 bg-blue-500 rounded-full p-1 border-2 border-white">
                        <BadgeCheck className="w-3 h-3 text-white fill-white" />
                    </div>
                )}
             </div>
         </div>
      </div>

      {/* --- PROFILE INFO --- */}
      <div className="pt-14 px-4 pb-2">
         <div className="flex justify-between items-start">
             <div>
                <h1 className="font-black text-2xl text-gray-900 leading-none flex items-center">
                    {displayProfile.displayName || displayProfile.name}
                    {displayProfile.isVerified && <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50 ml-1.5" />}
                </h1>
                <p className="text-gray-500 font-medium text-sm mt-1">@{displayProfile.username}</p>
             </div>
             
             {/* Action Buttons for Business */}
             {isBusiness && (
                 <div className="flex space-x-2">
                     <button className="bg-gray-100 p-2 rounded-full text-gray-700 hover:bg-gray-200"><Phone className="w-5 h-5" /></button>
                     <button className="bg-gray-100 p-2 rounded-full text-gray-700 hover:bg-gray-200"><Globe className="w-5 h-5" /></button>
                 </div>
             )}
         </div>

         {/* Bio & Details */}
         <div className="mt-3">
             {isBusiness && (
                 <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                    <span className="font-bold text-gray-900">{displayProfile.category}</span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">{displayProfile.priceLevel}</span>
                    <span>•</span>
                    <span className={displayProfile.isOpen ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                        {displayProfile.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                 </div>
             )}
             <p className="text-gray-700 text-sm leading-relaxed max-w-sm">
                 {displayProfile.bio || "No bio yet."}
             </p>
             {isBusiness && (
                <div className="flex items-center text-gray-500 text-xs mt-2">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {displayProfile.location}
                </div>
             )}
         </div>

         {/* Social Links Row (User Profile Only) */}
         {!isBusiness && displayProfile.socialLinks && (
             <div className="flex items-center space-x-3 mt-4">
                 {displayProfile.socialLinks.instagram && (
                    <a href={`https://instagram.com/${displayProfile.socialLinks.instagram}`} className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors">
                        <Instagram className="w-4 h-4" />
                    </a>
                 )}
                 {displayProfile.socialLinks.tiktok && (
                    <a href={`https://tiktok.com/@${displayProfile.socialLinks.tiktok}`} className="p-2 bg-gray-100 text-black rounded-full hover:bg-gray-200 transition-colors">
                         {/* Simple Music Note icon as TikTok replacement or standard svg */}
                         <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                    </a>
                 )}
                 {displayProfile.socialLinks.twitter && (
                    <a href={`https://twitter.com/${displayProfile.socialLinks.twitter}`} className="p-2 bg-blue-50 text-blue-500 rounded-full hover:bg-blue-100 transition-colors">
                        <Twitter className="w-4 h-4" />
                    </a>
                 )}
                  {displayProfile.socialLinks.website && (
                    <a href={`https://${displayProfile.socialLinks.website}`} className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                        <LinkIcon className="w-4 h-4" />
                    </a>
                 )}
             </div>
         )}
         
         {/* Edit Profile Button (Own Profile) */}
         {isOwnProfile && (
             <div className="mt-4">
                 <button className="w-full py-2 bg-gray-100 text-gray-900 font-bold rounded-lg border border-gray-200 text-xs">Edit Profile</button>
             </div>
         )}
      </div>

      {/* --- BUSINESS RATING SUMMARY --- */}
      {isBusiness && (displayProfile as Business).ratingBreakdown && (
        <div className="px-4 py-4 border-t border-b border-gray-50 mx-4 my-2 rounded-2xl bg-gray-50/50">
            <div className="flex items-center space-x-6">
                <div className="flex flex-col items-center justify-center pl-2">
                    <span className="text-4xl font-black text-gray-900">{displayProfile.rating}</span>
                    <div className="flex text-yellow-400 text-xs my-1">
                        {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= Math.round(displayProfile.rating) ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{displayProfile.reviewCount} Reviews</span>
                </div>
                <div className="flex-1 space-y-1 border-l border-gray-200 pl-6">
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
      <div className="sticky top-14 bg-white z-20 border-b border-gray-100 flex mt-2">
        {isBusiness ? (
            <>
                <button 
                    className={`flex-1 py-3 text-sm font-bold relative transition-colors flex items-center justify-center space-x-2 ${activeTab === 'left' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('left')}
                >
                    <span>Spotlight</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px]">{businessSpotlight.length}</span>
                    {activeTab === 'left' && <div className="absolute bottom-0 inset-x-4 h-0.5 bg-gray-900 rounded-t-full" />}
                </button>
                <button 
                    className={`flex-1 py-3 text-sm font-bold relative transition-colors flex items-center justify-center space-x-2 ${activeTab === 'right' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('right')}
                >
                    <span>Community</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px]">{businessCommunityReviews.length}</span>
                    {activeTab === 'right' && <div className="absolute bottom-0 inset-x-4 h-0.5 bg-gray-900 rounded-t-full" />}
                </button>
            </>
        ) : (
            <>
                <button 
                    className={`flex-1 py-3 flex justify-center items-center text-sm font-bold relative transition-colors space-x-1.5 ${activeTab === 'left' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('left')}
                >
                    <Grid className="w-5 h-5" />
                    <span className="text-xs">{userPosts.length}</span>
                    {activeTab === 'left' && <div className="absolute bottom-0 inset-x-6 h-0.5 bg-gray-900 rounded-t-full" />}
                </button>
                <button 
                    className={`flex-1 py-3 flex justify-center items-center text-sm font-bold relative transition-colors space-x-1.5 ${activeTab === 'center' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('center')}
                >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs">{userPosts.length}</span>
                    {activeTab === 'center' && <div className="absolute bottom-0 inset-x-6 h-0.5 bg-gray-900 rounded-t-full" />}
                </button>
                <button 
                    className={`flex-1 py-3 flex justify-center items-center text-sm font-bold relative transition-colors space-x-1.5 ${activeTab === 'right' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('right')}
                >
                    <Layers className="w-5 h-5" />
                    <span className="text-xs">{userLists.length}</span>
                    {activeTab === 'right' && <div className="absolute bottom-0 inset-x-6 h-0.5 bg-gray-900 rounded-t-full" />}
                </button>
            </>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="min-h-[300px] bg-white">
        
        {/* === POSTS / SPOTLIGHT GRID (Left Tab) === */}
        {activeTab === 'left' && (
             <div className="grid grid-cols-3 gap-0.5">
                {(isBusiness ? businessSpotlight : userPosts).map((item) => (
                    <div key={item.id} className="aspect-[3/4] bg-gray-100 relative group cursor-pointer overflow-hidden">
                        <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                        
                        {/* Type Indicator */}
                        <div className="absolute top-1 right-1">
                             {item.mediaType === 'video' ? (
                                 <Play className="w-4 h-4 text-white drop-shadow-md fill-white/50" />
                             ) : null}
                        </div>

                        {/* Stats Overlay */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 flex items-center text-white text-[10px] font-bold opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                            {item.agreeCount}
                        </div>
                    </div>
                ))}
                {(isBusiness ? businessSpotlight : userPosts).length === 0 && (
                     <div className="col-span-3 py-16 flex flex-col items-center justify-center text-gray-400">
                         <div className="bg-gray-50 p-4 rounded-full mb-2">
                            <Grid className="w-8 h-8 text-gray-300" />
                         </div>
                         <p className="text-sm font-medium">No posts yet.</p>
                     </div>
                )}
             </div>
        )}

        {/* === USER TEXT REVIEWS (Center Tab - User Only) === */}
        {activeTab === 'center' && !isBusiness && (
            <div className="divide-y divide-gray-100">
                {userPosts.map(item => (
                    <div key={item.id} className="p-4 flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm text-gray-900">{item.businessName}</h4>
                                <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                    <Star className="w-3 h-3 fill-current mr-0.5" />
                                    {item.rating?.toFixed(1)}
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.text}</p>
                            <div className="mt-2 text-[10px] text-gray-400">{item.timestamp}</div>
                        </div>
                        {/* Save Button */}
                        <div className="flex flex-col justify-center">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onSaveClick?.(item.id); }}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition-colors"
                            >
                                <Bookmark className="w-5 h-5" />
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
                <div className="grid grid-cols-3 gap-0.5">
                     {businessCommunityReviews.map((item) => (
                        <div key={item.id} className="aspect-square bg-gray-100 relative group cursor-pointer">
                            <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            <div className="absolute top-2 left-2 flex items-center space-x-1">
                                <img src={item.author.avatarUrl} className="w-6 h-6 rounded-full border border-white" alt="" />
                            </div>
                            {/* Save Button (Overlay) */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onSaveClick?.(item.id); }}
                                    className="p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-orange-500 transition-colors"
                                >
                                    <Bookmark className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 rounded text-[10px] font-bold">
                                ⭐ {item.rating}
                            </div>
                        </div>
                     ))}
                     {businessCommunityReviews.length === 0 && (
                        <div className="col-span-3 py-12 text-center text-gray-400 text-sm">
                            No community reviews yet.
                        </div>
                    )}
                </div>
            ) : (
                // User Lists
                <div className="p-4 space-y-4">
                    {userLists.map((list) => (
                        <div key={list.id} className="relative aspect-[2.5/1] rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                            <img src={list.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={list.title} />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 p-4 w-full">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="font-bold text-xl text-white leading-tight mb-1">{list.title}</h3>
                                        <div className="flex items-center space-x-3 text-white/80 text-xs font-medium">
                                            <span>{list.itemCount} Places</span>
                                            {list.collaborators && list.collaborators.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <div className="flex -space-x-1.5">
                                                        {list.collaborators.slice(0,3).map(c => (
                                                            <img key={c.id} src={c.avatarUrl} className="w-4 h-4 rounded-full border border-white" alt="" />
                                                        ))}
                                                        {list.collaborators.length > 3 && (
                                                            <span className="text-[9px] bg-white/20 px-1 rounded-full text-white">+{list.collaborators.length - 3}</span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        {list.isPrivate && (
                                            <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
                                                <BadgeCheck className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {userLists.length === 0 && (
                        <div className="py-12 flex flex-col items-center text-gray-400 text-sm">
                            <Layers className="w-10 h-10 mb-2 opacity-20" />
                            <p>No lists created yet.</p>
                            <button className="mt-4 text-orange-600 font-bold text-xs">Create First List</button>
                        </div>
                    )}
                </div>
            )
        )}
      </div>

      {/* --- FLOATING 'WRITE REVIEW' BUTTON FOR BUSINESS PROFILES --- */}
      {isBusiness && (
          <div className="fixed bottom-28 right-5 z-30 animate-[slideUp_0.4s_ease-out]">
              <button 
                onClick={() => onWriteReview && onWriteReview(displayProfile as Business)}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-full shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 group"
              >
                  <PenLine className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="font-bold text-sm">Rate & Review</span>
              </button>
          </div>
      )}

    </div>
  );
};