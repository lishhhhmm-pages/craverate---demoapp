
import { Review, ContentType, UserList } from './types';

// --- USERS ---
export const USERS = {
  u1: {
    id: 'u1',
    username: 'foodie_jane',
    displayName: 'Jane Doe',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    bio: 'Chasing the best flavors in Athens 🇬🇷 | Travel & Eats',
    followers: 1205,
    following: 450,
    postsCount: 142,
    isVerified: false,
    socialLinks: {
        instagram: 'jane_eats',
        tiktok: 'foodiejane'
    }
  },
  u3: {
    id: 'u3',
    username: 'coffee_addict',
    displayName: 'Mike Ross',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
    bio: 'Espresso yourself ☕️ | Barista & Photographer',
    followers: 3200,
    following: 120,
    postsCount: 89,
    isVerified: true,
    socialLinks: {
        instagram: 'mike_brews',
        website: 'mikeross.com'
    }
  },
  u4: {
    id: 'u4',
    username: 'sushi_lover',
    displayName: 'Sarah Lee',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80',
    bio: 'Traveling the world one plate at a time.',
    followers: 5400,
    following: 300,
    postsCount: 210,
    isVerified: true,
    socialLinks: {
        tiktok: 'sarah_eats_world',
        twitter: 'sarahlee_food'
    }
  },
  u5: {
    id: 'u5',
    username: 'burger_king',
    displayName: 'Tom H.',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop',
    bio: 'Just here for the fries.',
    followers: 45,
    following: 12,
    postsCount: 5,
    isVerified: false
  }
};

// --- BUSINESSES (Updated for Athens, Greece) ---
export const BUSINESSES = {
  b1: {
    id: 'b1',
    name: 'Plaka Taverna',
    username: 'plaka_taverna',
    displayName: 'Plaka Taverna',
    category: 'Greek Restaurant',
    location: 'Adrianou 12, Plaka',
    avatarUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200&h=200&fit=crop',
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    isVerified: true,
    bio: 'Authentic Greek flavors in the heart of Plaka. 🇬🇷🍷',
    rating: 4.8,
    reviewCount: 1240,
    priceLevel: '$$$',
    isOpen: true,
    phone: '+30 210 555 0199',
    website: 'plakataverna.gr',
    ratingBreakdown: { 5: 800, 4: 300, 3: 100, 2: 20, 1: 20 },
    coordinates: { x: 42, y: 38 }, // North West relative to user
    distance: '200m',
    walkingTime: '3 min'
  },
  b2: {
    id: 'b2',
    name: 'Gyro King',
    username: 'gyro_king',
    displayName: 'Gyro King',
    category: 'Street Food',
    location: 'Monastiraki Sq 5',
    avatarUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200&h=200&fit=crop',
    coverImageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    isVerified: true,
    bio: 'Best Gyros in Athens! 🥙 Open late.',
    rating: 4.5,
    reviewCount: 3400,
    priceLevel: '$',
    isOpen: false,
    phone: '+30 210 555 0123',
    website: 'gyroking.gr',
    ratingBreakdown: { 5: 2000, 4: 1000, 3: 300, 2: 50, 1: 50 },
    coordinates: { x: 55, y: 55 }, // South East, very close
    distance: '100m',
    walkingTime: '1 min'
  },
  b3: {
    id: 'b3',
    name: 'Little Tree Books & Coffee',
    username: 'littletree_ath',
    displayName: 'Little Tree',
    category: 'Coffee Shop',
    location: 'Kavalloti 2, Makrygianni',
    avatarUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
    coverImageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
    isVerified: false,
    bio: 'Books, coffee, and quiet corners.',
    rating: 4.2,
    reviewCount: 450,
    priceLevel: '$$',
    isOpen: true,
    ratingBreakdown: { 5: 200, 4: 150, 3: 80, 2: 10, 1: 10 },
    coordinates: { x: 35, y: 52 }, // West
    distance: '350m',
    walkingTime: '5 min'
  },
  b4: {
    id: 'b4',
    name: 'Peinirli Ionias',
    username: 'peinirli_ionias',
    displayName: 'Peinirli Ionias',
    category: 'Bakery',
    location: 'Panormou 11',
    avatarUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
    coverImageUrl: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80',
    isVerified: true,
    bio: 'Traditional handmade dough. 🥖 Always fresh.',
    rating: 4.7,
    reviewCount: 5200,
    priceLevel: '$',
    isOpen: true,
    ratingBreakdown: { 5: 3000, 4: 1500, 3: 500, 2: 100, 1: 100 },
    coordinates: { x: 70, y: 35 }, // North East
    distance: '250m',
    walkingTime: '4 min'
  },
  b5: {
    id: 'b5',
    name: 'Juicy Grill',
    username: 'juicy_grill',
    displayName: 'Juicy Grill',
    category: 'Burger Joint',
    location: 'Cholargos, Athens',
    avatarUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
    coverImageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    isVerified: true,
    bio: 'The biggest burgers in town. 🍔',
    rating: 4.9,
    reviewCount: 8900,
    priceLevel: '$$',
    isOpen: true
  }
};

// --- LISTS ---
export const MOCK_LISTS: UserList[] = [
  {
    id: 'l1',
    authorId: 'u1',
    title: '🏺 Best Views of Acropolis',
    coverUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
    itemCount: 12,
    isPrivate: false,
    likes: 342,
    collaborators: []
  },
  {
    id: 'l2',
    authorId: 'u1',
    title: 'Date Night Spots 🌙',
    coverUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
    itemCount: 8,
    isPrivate: false,
    likes: 89,
    collaborators: [USERS.u3]
  },
  {
    id: 'l3',
    authorId: 'u4',
    title: 'Seafood by the Sea',
    coverUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd43da?w=800&q=80',
    itemCount: 5,
    isPrivate: true,
    likes: 12,
    collaborators: []
  },
  {
    id: 'l4',
    authorId: 'u3',
    title: 'Study Cafes 💻',
    coverUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
    itemCount: 15,
    isPrivate: false,
    likes: 1205,
    collaborators: []
  }
];

// --- FEED / REVIEWS ---

// 1. The Main "For You" Feed (Curated, does not contain everything initially)
export const MOCK_FEED: Review[] = [
  {
    id: '1',
    type: ContentType.USER_REVIEW,
    mediaType: 'image',
    author: USERS.u1,
    businessId: 'b1',
    businessName: 'Plaka Taverna',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
    text: 'Authentic Moussaka with a view! 🇬🇷 The atmosphere is 10/10 for a summer night.',
    timestamp: '2h ago',
    agreeCount: 1240,
    disagreeCount: 12,
    commentCount: 45,
    tags: ['Greek', 'Moussaka', 'View']
  },
  {
    id: '2',
    type: ContentType.BUSINESS_POST,
    mediaType: 'video',
    author: BUSINESSES.b2 as any,
    businessId: 'b2',
    businessName: 'Gyro King',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&q=80',
    text: '🥙 THE KING SIZE GYRO IS BACK! Available this weekend only. Tag a friend who can finish this beast.',
    timestamp: '5h ago',
    agreeCount: 8500,
    disagreeCount: 24,
    commentCount: 120,
    tags: ['Gyro', 'StreetFood', 'Athens']
  },
  {
    id: '3',
    type: ContentType.USER_REVIEW,
    mediaType: 'image',
    author: USERS.u3,
    businessId: 'b3',
    businessName: 'Little Tree',
    rating: 3.5,
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
    text: 'Great freddo espresso, but the service was kinda slow today. ☕️ Worth the wait if you aren’t in a rush.',
    timestamp: '1d ago',
    agreeCount: 89,
    disagreeCount: 34,
    commentCount: 12,
    tags: ['Coffee', 'Freddo']
  },
  {
    id: '4',
    type: ContentType.USER_REVIEW,
    mediaType: 'video',
    author: USERS.u4,
    businessId: 'b1', 
    businessName: 'Plaka Taverna',
    rating: 5.0,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd43da?w=800&q=80', 
    text: 'Best seafood in the city! 🐟 Every plate was fresh. Highly recommend the grilled octopus.',
    timestamp: '3d ago',
    agreeCount: 2300,
    disagreeCount: 5,
    commentCount: 88,
    tags: ['Seafood', 'Greek', 'Octopus']
  },
  {
    id: '7',
    type: ContentType.USER_REVIEW,
    mediaType: 'image',
    author: USERS.u1,
    businessId: 'b3',
    businessName: 'Little Tree',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    text: 'My go-to study spot. Fast wifi and quiet vibes.',
    timestamp: '1w ago',
    agreeCount: 342,
    disagreeCount: 0,
    commentCount: 14,
    tags: ['Study', 'Wifi']
  },
  {
    id: '8',
    type: ContentType.BUSINESS_POST,
    mediaType: 'image',
    author: BUSINESSES.b1 as any,
    businessId: 'b1',
    businessName: 'Plaka Taverna',
    imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80',
    text: 'New seasonal menu drops tomorrow! 🍂 Stuffed Vine Leaves are back.',
    timestamp: '2w ago',
    agreeCount: 2100,
    disagreeCount: 15,
    commentCount: 302,
    tags: ['FallMenu', 'Dolmades']
  }
];

// 2. The "Database" of All Posts (Used for Search Results)
export const ALL_POSTS: Review[] = [
    ...MOCK_FEED,
    // EXTRA CONTENT ONLY FOUND VIA SEARCH
    // NEW BURGER POSTS
  {
    id: 'b_1',
    type: ContentType.USER_REVIEW,
    mediaType: 'image',
    author: USERS.u5,
    businessId: 'b5',
    businessName: 'Juicy Grill',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    text: 'This burger is absolutely MASSIVE. The cheese sauce is to die for. 🍔🧀 Best Burgers in Athens hands down.',
    timestamp: '2d ago',
    agreeCount: 4500,
    disagreeCount: 12,
    commentCount: 340,
    tags: ['Burgers', 'Cheesy', 'FoodPorn']
  },
  {
    id: 'b_2',
    type: ContentType.USER_REVIEW,
    mediaType: 'image',
    author: USERS.u1,
    businessId: 'b5',
    businessName: 'Juicy Grill',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    text: 'Worth the hype, but be prepared to wait in line! The brioche bun is perfect. 🍔',
    timestamp: '4d ago',
    agreeCount: 210,
    disagreeCount: 5,
    commentCount: 45,
    tags: ['Burgers', 'Dinner']
  },
  // NEW PIZZA POSTS
  {
    id: 'p_1',
    type: ContentType.USER_REVIEW,
    mediaType: 'image',
    author: USERS.u4,
    businessId: 'b1', 
    businessName: 'Napoli Pizza',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    text: 'Authentic Neapolitan style pizza right here! The crust is so fluffy. 🍕🇮🇹',
    timestamp: '3h ago',
    agreeCount: 890,
    disagreeCount: 2,
    commentCount: 67,
    tags: ['Pizza', 'Italian', 'Authentic']
  },
  {
    id: 'p_2',
    type: ContentType.USER_REVIEW,
    mediaType: 'video',
    author: USERS.u1,
    businessId: 'b1', 
    businessName: 'Crust',
    rating: 4.2,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    text: 'Late night pizza slice heaven. 🍕 Perfect after a night out.',
    timestamp: '12h ago',
    agreeCount: 1200,
    disagreeCount: 45,
    commentCount: 89,
    tags: ['Pizza', 'StreetFood', 'LateNight']
  },
  // NEW SUSHI POST
  {
    id: 's_1',
    type: ContentType.USER_REVIEW,
    mediaType: 'image',
    author: USERS.u4,
    businessId: 'b1', 
    businessName: 'Sushimou',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    text: 'Omakase experience was unforgettable. 🍣 Fresh fish and amazing chef.',
    timestamp: '5d ago',
    agreeCount: 560,
    disagreeCount: 0,
    commentCount: 23,
    tags: ['Sushi', 'Japanese', 'FineDining']
  },
];
