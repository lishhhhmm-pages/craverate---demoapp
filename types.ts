
export enum ContentType {
  USER_REVIEW = 'USER_REVIEW',
  BUSINESS_POST = 'BUSINESS_POST'
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  coverUrl?: string;
  isVerified?: boolean;
  bio?: string;
  followers?: number;
  following?: number;
  postsCount?: number;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Business {
  id: string;
  name: string;
  category: string;
  location: string;
  coverImageUrl: string;
  isVerified: boolean;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  avatarUrl: string;
  displayName: string;
  username: string;
  priceLevel?: '$' | '$$' | '$$$' | '$$$$';
  isOpen?: boolean;
  phone?: string;
  website?: string;
  tags?: string[];
  ratingBreakdown?: { 5: number; 4: number; 3: number; 2: number; 1: number };
  coordinates?: { x: number; y: number }; // Relative 0-100 coordinates
  latLng?: [number, number]; // Real world coordinates for map
  distance?: string;
  walkingTime?: string;
}

export interface UserList {
  id: string;
  authorId: string;
  title: string;
  coverUrl: string;
  itemCount: number;
  isPrivate: boolean;
  likes?: number; 
  collaborators?: User[];
}

export interface Review {
  id: string;
  type: ContentType;
  author: User | Business; 
  businessId: string;
  businessName: string;
  rating?: number; 
  imageUrl?: string;
  videoUrl?: string; 
  mediaType: 'image' | 'video';
  text: string;
  timestamp: string;
  agreeCount: number;
  disagreeCount: number;
  commentCount: number;
  tags?: string[];
  isLocal?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface DraftPost {
  businessId: string | null;
  businessName: string;
  mediaFile: File | null;
  mediaPreviewUrl: string;
  rating: number;
  text: string;
  tags: string[];
}

export type SearchRadius = 500 | 1000 | 2000 | 5000;
