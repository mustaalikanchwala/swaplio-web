// ─────────────────────────────────────────────────────────────────────────────
// All TypeScript types for the Swaplio application
// ─────────────────────────────────────────────────────────────────────────────

// ── AUTH / USER ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}


export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ── LISTINGS ─────────────────────────────────────────────────────────────────

export type Condition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type ListingStatus = 'ACTIVE' | 'SOLD';

export interface ListingImage {
  id: string;
  signedUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  status: ListingStatus;
  categoryId: string;
  categoryName: string;
  sellerName: string;
  sellerId: string;
  images: ListingImage[];
  createdAt: string;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  condition: Condition;
  categoryId: string;
}

export interface EditListingRequest extends CreateListingRequest {
  keepImageIds?: string[];
}

// ── CATEGORIES ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug?: string;
}

// ── MEETINGS ─────────────────────────────────────────────────────────────────

export type MeetingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Meeting {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  meetingDate: string;   // yyyy-MM-dd
  meetingTime: string;   // HH:mm:ss
  location: string;
  notes?: string;
  status: MeetingStatus;
  proposedDate?: string;
  proposedTime?: string;
  proposedLocation?: string;
  proposedNotes?: string;
  createdAt: string;
}

export interface RequestMeetingPayload {
  listingId: string;
  meetingDate: string;   // yyyy-MM-dd
  meetingTime: string;   // HH:mm:ss
  location: string;
  notes?: string;
}

export interface SellerRespondPayload {
  action: 'CONFIRM' | 'REJECT' | 'RESCHEDULE';
  proposedDate?: string;
  proposedTime?: string;
  proposedLocation?: string;
  proposedNotes?: string;
}

export interface BuyerRespondPayload {
  action: 'ACCEPT' | 'DECLINE';
}

// ── CHAT ─────────────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImageUrl?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface ChatMessage {
  conversationId?: string;
  listingId?: string;
  content: string;
}

// ── PAGINATION ───────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;       // 0-indexed current page
  last: boolean;
}

export interface ListingFilterParams {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
}