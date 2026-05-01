// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;         // was: name
  email: string;
  password: string;
  phoneNumber?: string;     // was: phone
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string | number;
  fullName: string;         // was: name
  email: string;
  phoneNumber?: string;     // was: phone
  avatar?: string;
  institution?: string;     // was: college
  isVerified?: boolean;     // new
  createdAt?: string;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string | number;
  name: string;
  icon?: string;
}

// ─── Listing ─────────────────────────────────────────────────────────────────

export type Condition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'EXPIRED';

export interface ListingImage {
  id: string | number;
  signedUrl: string;
  isPrimary?: boolean;
}

export interface Listing {
  id: string | number;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  status: ListingStatus;
  category: Category;
  seller: User;
  images: ListingImage[];
  createdAt: string;
  updatedAt?: string;
}

export interface ListingPage {
  content: Listing[];
  totalPages: number;
  totalElements: number;
  number: number;
  last: boolean;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  condition: Condition;
  categoryId: string | number;
}

export interface EditListingRequest extends CreateListingRequest {
  keepImageIds?: (string | number)[];
}

export interface SearchListingsParams {
  keyword?: string;
  categoryId?: string | number;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  page?: number;
  size?: number;
}

// ─── Meeting ─────────────────────────────────────────────────────────────────

export type MeetingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Meeting {
  id: string | number;
  listing: Listing;
  buyer: User;
  seller: User;
  meetingDate: string;
  meetingTime: string;
  location: string;
  notes?: string;
  status: MeetingStatus;
  createdAt: string;
}

export interface CreateMeetingRequest {
  listingId: string | number;
  meetingDate: string;
  meetingTime: string;
  location: string;
  notes?: string;
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
}