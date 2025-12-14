import { Review, User, Business, UserList, ContentType } from '../types';
import { USERS, BUSINESSES, MOCK_FEED, MOCK_LISTS, ALL_POSTS } from '../mockData';

// This service mimics a backend interaction. 
// When you are ready for Firebase/Supabase, you just replace the contents of these functions.

let currentFeed = [...MOCK_FEED];
let currentLists = [...MOCK_LISTS];

// Simulate network delay for "aliveness"
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  
  // --- FEED ---
  getFeed: async (): Promise<Review[]> => {
    await delay(300); // Fake load time
    return [...currentFeed];
  },

  getAllPosts: async (): Promise<Review[]> => {
      await delay(300);
      return [...ALL_POSTS];
  },

  createPost: async (post: Partial<Review>): Promise<Review> => {
    await delay(800); // Fake upload time
    
    const newPost: Review = {
      id: Date.now().toString(),
      type: ContentType.USER_REVIEW,
      author: USERS.u1, // Currently logged in as u1
      businessId: post.businessId || 'unknown',
      businessName: post.businessName || 'Unknown Spot',
      rating: post.rating || 0,
      imageUrl: post.imageUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
      videoUrl: post.videoUrl,
      mediaType: post.mediaType || 'image',
      text: post.text || '',
      timestamp: 'Just now',
      agreeCount: 0,
      disagreeCount: 0,
      commentCount: 0,
      tags: post.tags || [],
      isLocal: true
    };

    // Add to top of feed
    currentFeed = [newPost, ...currentFeed];
    return newPost;
  },

  // --- LISTS ---
  getUserLists: async (userId: string): Promise<UserList[]> => {
    await delay(200);
    return currentLists.filter(l => l.authorId === userId);
  },

  createList: async (title: string, isPrivate: boolean, collaborators: User[]): Promise<UserList> => {
    await delay(500);
    const newList: UserList = {
      id: `l${Date.now()}`,
      authorId: 'u1',
      title,
      isPrivate,
      collaborators,
      itemCount: 0,
      likes: 0,
      coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80'
    };
    currentLists = [newList, ...currentLists];
    return newList;
  },

  addToList: async (listId: string, postId: string) => {
    await delay(300);
    // In a real DB, this would allow a junction table row.
    // Here we just increment the counter to show interaction.
    currentLists = currentLists.map(l => 
        l.id === listId ? { ...l, itemCount: l.itemCount + 1 } : l
    );
    return true;
  },

  // --- SEARCH ---
  searchBusinesses: async (query: string): Promise<Business[]> => {
    await delay(100);
    if (!query) return Object.values(BUSINESSES) as unknown as Business[];
    const lowerQ = query.toLowerCase();
    return Object.values(BUSINESSES).filter(b => 
      b.name.toLowerCase().includes(lowerQ) || 
      b.category.toLowerCase().includes(lowerQ)
    ) as unknown as Business[];
  }
};