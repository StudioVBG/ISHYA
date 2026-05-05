export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at">;
        Update: Partial<Omit<Category, "id">>;
      };
      collections: {
        Row: Collection;
        Insert: Omit<Collection, "id" | "created_at">;
        Update: Partial<Omit<Collection, "id">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id">>;
      };
      product_variants: {
        Row: ProductVariant;
        Insert: Omit<ProductVariant, "id">;
        Update: Partial<Omit<ProductVariant, "id">>;
      };
      product_media: {
        Row: ProductMedia;
        Insert: Omit<ProductMedia, "id">;
        Update: Partial<Omit<ProductMedia, "id">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Profile>;
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, "id" | "created_at">;
        Update: Partial<Omit<Address, "id">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at">;
        Update: Partial<Omit<Order, "id">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id">;
        Update: Partial<Omit<OrderItem, "id">>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at">;
        Update: Partial<Omit<Review, "id">>;
      };
      wishlists: {
        Row: Wishlist;
        Insert: Omit<Wishlist, "id">;
        Update: Partial<Omit<Wishlist, "id">>;
      };
      carts: {
        Row: Cart;
        Insert: Omit<Cart, "id" | "updated_at">;
        Update: Partial<Omit<Cart, "id">>;
      };
      cart_items: {
        Row: CartItem;
        Insert: Omit<CartItem, "id">;
        Update: Partial<Omit<CartItem, "id">>;
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Omit<BlogPost, "id" | "created_at">;
        Update: Partial<Omit<BlogPost, "id">>;
      };
      faq_articles: {
        Row: FaqArticle;
        Insert: Omit<FaqArticle, "id">;
        Update: Partial<Omit<FaqArticle, "id">>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, "id" | "created_at">;
        Update: Partial<Omit<Ticket, "id">>;
      };
      returns: {
        Row: Return;
        Insert: Omit<Return, "id" | "requested_at">;
        Update: Partial<Omit<Return, "id">>;
      };
      shipments: {
        Row: Shipment;
        Insert: Omit<Shipment, "id">;
        Update: Partial<Omit<Shipment, "id">>;
      };
      discount_codes: {
        Row: DiscountCode;
        Insert: Omit<DiscountCode, "id">;
        Update: Partial<Omit<DiscountCode, "id">>;
      };
      loyalty_tiers: {
        Row: LoyaltyTier;
        Insert: Omit<LoyaltyTier, "id">;
        Update: Partial<Omit<LoyaltyTier, "id">>;
      };
      loyalty_transactions: {
        Row: LoyaltyTransaction;
        Insert: Omit<LoyaltyTransaction, "id" | "created_at">;
        Update: Partial<Omit<LoyaltyTransaction, "id">>;
      };
    };
  };
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description_short: string;
  description_long: string | null;
  base_price: number;
  compare_at_price: number | null;
  sku_prefix: string;
  is_active: boolean;
  is_featured: boolean;
  category_id: string;
  collection_ids: string[];
  material: string | null;
  weight_g: number | null;
  dimensions: string | null;
  care_instructions: string | null;
  is_nickel_free: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price_override: number | null;
  size: string | null;
  material_variant: string | null;
  stone: string | null;
  length_cm: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  weight_g: number | null;
  is_active: boolean;
}

export interface ProductMedia {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  type: "image" | "video";
  position: number;
  is_primary: boolean;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  loyalty_points: number;
  loyalty_tier: string;
  newsletter_optin: boolean;
  role: "customer" | "admin";
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  first_name: string;
  last_name: string;
  line1: string;
  line2: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  order_number: string;
  status: OrderStatus;
  shipping_address_id: string | null;
  billing_address_id: string | null;
  shipping_method_id: string | null;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes: string | null;
  gift_wrap: boolean;
  gift_message: string | null;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name_snapshot: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  photos: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
  notify_on_restock: boolean;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  currency: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  pack_id: string | null;
  pack_selections: Json | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content_md: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
}

export interface FaqArticle {
  id: string;
  category: string;
  title: string;
  content_md: string;
  search_keywords: string[];
  helpful_count: number;
  position: number;
}

export interface Ticket {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  channel: "email" | "chat" | "phone" | "social";
  category: "order" | "product" | "shipping" | "return" | "other";
  assigned_to: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface Return {
  id: string;
  order_id: string;
  user_id: string;
  status: "requested" | "approved" | "shipped_back" | "received" | "refunded" | "rejected";
  reason: string;
  reason_detail: string | null;
  return_label_url: string | null;
  refund_amount: number | null;
  refund_method: string | null;
  requested_at: string;
  completed_at: string | null;
}

export interface Shipment {
  id: string;
  order_id: string;
  tracking_number: string | null;
  carrier: string | null;
  label_url: string | null;
  status: "preparing" | "shipped" | "in_transit" | "delivered" | "failed";
  shipped_at: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  applicable_categories: string[];
  applicable_products: string[];
}

export interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  discount_percent: number;
  perks: string[];
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  type: "earn" | "redeem" | "expire" | "bonus";
  order_id: string | null;
  description: string;
  created_at: string;
}

export interface ProductWithRelations extends Product {
  category?: Category;
  variants?: ProductVariant[];
  media?: ProductMedia[];
  reviews?: Review[];
}

export interface CartItemWithProduct extends CartItem {
  product?: Product;
  variant?: ProductVariant;
}

export interface OrderWithItems extends Order {
  items?: OrderItem[];
  shipment?: Shipment;
}
