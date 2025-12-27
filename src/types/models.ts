// PROJECTE: Master Template
// FITXER: src/types/models.ts

// ==========================================
// 1. Tipus de Seccions del Landing (VISUALS)
// ==========================================

export type SectionType =
  | 'hero'
  | 'services'
  | 'contact'
  | 'stats'
  | 'testimonials'
  | 'map'
  | 'faq'
  | 'cta_banner'
  | 'featured_products'
  | 'about';

// --- Base ---
export interface BaseSectionContent {
  title?: string;
  subtitle?: string;
}

// --- Hero ---
export interface HeroContent extends BaseSectionContent {
  ctaText?: string;
  companyName: string;
}

// --- Services (Híbrid: DB + IA) ---
export interface ServiceContent extends BaseSectionContent {
  headlinePrefix?: string;
  headlineHighlight?: string;
  emptyState?: {
    title: string;
    text: string;
  };
  // ✅ CLAU: Això permet que la IA passi serveis de text quan no hi ha DB
  items?: Array<{
    title: string;
    description: string;
  }>;
}

// --- About ---
export interface AboutContent extends BaseSectionContent {
  badge?: string;
  description: string;
  imageUrl?: string;
  features?: string[];
  stats?: Array<{ label: string; value: string }>;
  card?: { title: string; subtitle: string };
}

// --- Contact ---
export interface ContactContent extends BaseSectionContent {
  description?: string;
  buttonText?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// --- Stats ---
export interface StatsContent {
  items: Array<{ value: string; label: string }>;
}

// --- Testimonials ---
export interface TestimonialsContent extends BaseSectionContent {
  reviews: Array<{
    author: string;
    role: string;
    text: string;
    rating: number;
  }>;
}

// --- Map ---
export interface MapContent {
  title: string;
  address: string;
  embedUrl: string;
}

// --- FAQ ---
export interface FAQContent {
  title: string;
  subtitle?: string;
  items: Array<{ question: string; answer: string }>;
}

// --- CTA ---
export interface CTABannerContent {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage?: string;
}

// --- Featured Products ---
export interface FeaturedProductsContent {
  title: string;
  subtitle: string;
  limit?: number;
}

// 🔥 UNIÓ DISCRIMINADA
export type LandingSectionData =
  | { id: string; type: 'hero'; content: HeroContent }
  | { id: string; type: 'services'; content: ServiceContent }
  | { id: string; type: 'contact'; content: ContactContent }
  | { id: string; type: 'stats'; content: StatsContent }
  | { id: string; type: 'testimonials'; content: TestimonialsContent }
  | { id: string; type: 'map'; content: MapContent }
  | { id: string; type: 'faq'; content: FAQContent }
  | { id: string; type: 'cta_banner'; content: CTABannerContent }
  | { id: string; type: 'featured_products'; content: FeaturedProductsContent }
  | { id: string; type: 'about'; content: AboutContent };


// ==========================================
// 2. E-COMMERCE
// ==========================================

export interface Product {
  id: string;
  organization_id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  active: boolean;
  images: string[];
  category_id?: string;
  created_at?: Date;
}

export interface CartItem {
  id: string;
  organization_id: string;
  name: string;
  price: number;
  stock: number;
  slug: string;
  image?: string;
  quantity: number;
}

export interface Order {
  id: string;
  organization_id: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  payment_method: string;
  created_at: Date;
}

export interface CreateOrderDTO {
  customer_email: string;
  customer_details: Record<string, unknown>;
  items: CartItem[];
  payment_method: 'stripe' | 'bank' | 'paypal';
}

export type CreateProductDTO = Omit<Product, 'id' | 'organization_id' | 'slug' | 'created_at'>;


// ==========================================
// 3. BOOKING & SERVEIS
// ==========================================

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'textarea';
  required: boolean;
  placeholder?: string;
}

// --- MODEL DE PRODUCTE / SERVEI (DB) ---
export interface ServiceDTO {
  id: string;
  
  // ✅ OBLIGATORI: Un servei sempre pertany a una organització
  organization_id: string;

  title: string;
  description: string;
  price?: number;
  currency?: string;
  image_url?: string;
  
  // ✅ CORREGIT: Unifiquem a duration_minutes
  duration_minutes?: number;

  // ✅ AFEGIT QUE FALTAVA: Sense això, no pots fer 'active: true' al Service
  active: boolean; 
  
  // ✅ Schema dinàmic
  form_schema?: FormField[];
}
// Alias
export type Service = ServiceDTO;

export interface Booking {
  id: string;
  organization_id: string;
  service_id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  start_time: Date;
  end_time: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: Date;
  form_data?: Record<string, unknown>;

  services?: {
    title: string;
    duration_minutes?: number;
  } | null;
}

export interface BookingWithService extends Booking {
  services: {
    title: string;
    duration_minutes: number;
  };
}

export interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export type CreateServiceDTO = Omit<ServiceDTO, 'id' | 'created_at' | 'active' | 'organization_id'>;
export type CreateBookingDTO = Omit<Booking, 'id' | 'created_at' | 'services' | 'status'>;


// ==========================================
// 4. BLOG & POSTS
// ==========================================

export type PostStatus = 'draft' | 'published' | 'archived';

// Model DB
export interface BlogPost {
  id: string;
  organization_id: string;
  slug: string;
  title: string;
  description: string | null;
  content_mdx: string | null;
  cover_image: string | null;
  tags: string[];
  status: PostStatus;
  published_at: Date | null;
  created_at: Date;
  author_id?: string;
}

// Model App (DTO)
export interface BlogPostDTO {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;      // UI 'content' -> DB 'content_mdx'
  coverImage: string | null;   // UI 'coverImage' -> DB 'cover_image'
  tags: string[];
  date: string | null;

  // Camps opcionals per Admin
  published: boolean;
  reviewed: boolean;
  status?: PostStatus;

  social_posts?: {
    id: string;
    platform: string;
    status: string;
    scheduledFor: string | null;
  }[];

  totalReactions?: number;
}

export type CreatePostDTO = {
  title: string;
  description: string;
  content: string;
  tags?: string[];
  status?: PostStatus;
  cover_image?: string;
};


// ==========================================
// 5. USUARIS & PERFILS
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'client' | 'lead';
  organization_id: string;
  avatar_url?: string | null;
  created_at: Date;
}

export type CreateProfileDTO = {
  id: string;
  email: string;
  full_name: string;
  organization_id: string;
  role?: 'client';
};


// ==========================================
// 6. EINES INTERNES
// ==========================================

export type AuditDTO = {
  id: string;
  url: string;
  status: 'processing' | 'completed' | 'failed';
  seoScore: number | null;
  performanceScore: number | null;
  createdAt: Date;
  reportData: Record<string, unknown> | null;
};

export type AnalyticsEventDTO = {
  event_name: string;
  path: string;
  session_id: string;
  duration?: number;
  referrer?: string;
  meta?: Record<string, unknown>;
  geo?: { country: string | null; city: string | null };
  device?: { type: string; browser: string; os: string };
};