-- ============================================================================
-- ISHYA — E-commerce Bijoux — Schéma initial complet
-- 45 tables · UUID PK · RLS activé sur toutes les tables
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TYPES ENUM
-- ============================================================================

CREATE TYPE public.user_role AS ENUM (
  'customer', 'support', 'editor', 'admin', 'super_admin'
);

CREATE TYPE public.loyalty_tier_name AS ENUM (
  'bronze', 'silver', 'gold', 'platinum'
);

CREATE TYPE public.address_type AS ENUM (
  'shipping', 'billing'
);

CREATE TYPE public.order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered',
  'cancelled', 'refunded', 'partially_refunded', 'on_hold', 'failed'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'cancelled'
);

CREATE TYPE public.discount_type AS ENUM (
  'percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'
);

CREATE TYPE public.product_relation_type AS ENUM (
  'cross_sell', 'upsell', 'parure', 'similar'
);

CREATE TYPE public.ticket_status AS ENUM (
  'open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed'
);

CREATE TYPE public.ticket_priority AS ENUM (
  'low', 'medium', 'high', 'urgent'
);

CREATE TYPE public.ticket_channel AS ENUM (
  'email', 'phone', 'chat', 'social_media', 'contact_form'
);

CREATE TYPE public.ticket_category AS ENUM (
  'order_issue', 'product_question', 'shipping', 'return_exchange',
  'payment', 'account', 'complaint', 'other'
);

CREATE TYPE public.return_status AS ENUM (
  'requested', 'approved', 'rejected', 'shipped_back', 'received',
  'inspected', 'refunded', 'exchanged', 'closed'
);

CREATE TYPE public.return_reason AS ENUM (
  'wrong_size', 'defective', 'not_as_described', 'changed_mind',
  'arrived_late', 'wrong_item', 'other'
);

CREATE TYPE public.shipment_status AS ENUM (
  'pending', 'label_created', 'picked_up', 'in_transit',
  'out_for_delivery', 'delivered', 'failed_attempt', 'returned_to_sender', 'exception'
);

CREATE TYPE public.campaign_status AS ENUM (
  'draft', 'scheduled', 'sending', 'sent', 'cancelled'
);

CREATE TYPE public.banner_placement AS ENUM (
  'hero', 'category', 'sidebar', 'popup', 'footer', 'announcement_bar'
);

-- ============================================================================
-- HELPER FUNCTION: auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. CATALOGUE (9 tables)
-- ============================================================================

-- 1.1 categories
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  seo_title       TEXT,
  seo_description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1.2 collections
CREATE TABLE public.collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  seo_title       TEXT,
  seo_description TEXT,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_collections_slug ON public.collections(slug);

CREATE TRIGGER trg_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1.3 products
CREATE TABLE public.products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  collection_id     UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  short_description TEXT,
  base_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price  NUMERIC(10,2),
  cost_price        NUMERIC(10,2),
  currency          TEXT DEFAULT 'EUR',
  sku               TEXT UNIQUE,
  material          TEXT,
  weight_g          NUMERIC(8,2),
  dimensions        TEXT,
  care_instructions TEXT,
  is_nickel_free    BOOLEAN DEFAULT false,
  is_active         BOOLEAN DEFAULT true,
  is_featured       BOOLEAN DEFAULT false,
  is_new            BOOLEAN DEFAULT false,
  sort_order        INT DEFAULT 0,
  seo_title         TEXT,
  seo_description   TEXT,
  meta_keywords     TEXT[],
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_collection_id ON public.products(collection_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1.4 product_variants
CREATE TABLE public.product_variants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku               TEXT UNIQUE,
  name              TEXT,
  size              TEXT,
  material_variant  TEXT,
  stone             TEXT,
  length_cm         NUMERIC(6,2),
  color             TEXT,
  price_override    NUMERIC(10,2),
  stock_quantity    INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  weight_g          NUMERIC(8,2),
  is_active         BOOLEAN DEFAULT true,
  sort_order        INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);

CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1.5 product_media
CREATE TABLE public.product_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  media_type  TEXT DEFAULT 'image',
  sort_order  INT DEFAULT 0,
  is_primary  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_media_product_id ON public.product_media(product_id);

-- 1.6 product_attributes
CREATE TABLE public.product_attributes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_attributes_product_id ON public.product_attributes(product_id);

-- 1.7 product_relations
CREATE TABLE public.product_relations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  relation_type   public.product_relation_type NOT NULL,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, related_product_id, relation_type)
);

CREATE INDEX idx_product_relations_product_id ON public.product_relations(product_id);
CREATE INDEX idx_product_relations_related ON public.product_relations(related_product_id);

-- 1.8 product_tags
CREATE TABLE public.product_tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag         TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, tag)
);

CREATE INDEX idx_product_tags_product_id ON public.product_tags(product_id);
CREATE INDEX idx_product_tags_tag ON public.product_tags(tag);

-- 1.9 inventory
CREATE TABLE public.inventory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id    UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  warehouse     TEXT DEFAULT 'default',
  quantity      INT NOT NULL DEFAULT 0,
  reserved      INT NOT NULL DEFAULT 0,
  last_restock_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(variant_id, warehouse)
);

CREATE INDEX idx_inventory_variant_id ON public.inventory(variant_id);

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2. PACKS / PARURES (3 tables)
-- ============================================================================

-- 2.1 packs
CREATE TABLE public.packs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  image_url       TEXT,
  discount_type   public.discount_type NOT NULL DEFAULT 'percentage',
  discount_value  NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_packs_slug ON public.packs(slug);

CREATE TRIGGER trg_packs_updated_at
  BEFORE UPDATE ON public.packs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2.2 pack_items
CREATE TABLE public.pack_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id     UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pack_id, product_id)
);

CREATE INDEX idx_pack_items_pack_id ON public.pack_items(pack_id);

-- 2.3 pack_variant_options
CREATE TABLE public.pack_variant_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_item_id  UUID NOT NULL REFERENCES public.pack_items(id) ON DELETE CASCADE,
  variant_id    UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  price_adjustment NUMERIC(10,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pack_item_id, variant_id)
);

CREATE INDEX idx_pack_variant_options_pack_item ON public.pack_variant_options(pack_item_id);

-- ============================================================================
-- 3. AVIS (2 tables)
-- ============================================================================

-- 3.1 reviews
CREATE TABLE public.reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating              SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title               TEXT,
  body                TEXT,
  photos              TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved         BOOLEAN DEFAULT false,
  approved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_is_approved ON public.reviews(is_approved);

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3.2 review_responses
CREATE TABLE public.review_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_review_responses_review_id ON public.review_responses(review_id);

CREATE TRIGGER trg_review_responses_updated_at
  BEFORE UPDATE ON public.review_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 4. UTILISATEURS (5 tables)
-- ============================================================================

-- 4.1 profiles
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  first_name      TEXT,
  last_name       TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  date_of_birth   DATE,
  role            public.user_role DEFAULT 'customer',
  loyalty_points  INT DEFAULT 0,
  loyalty_tier    public.loyalty_tier_name DEFAULT 'bronze',
  is_active       BOOLEAN DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4.2 addresses
CREATE TABLE public.addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          public.address_type NOT NULL DEFAULT 'shipping',
  label         TEXT,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  company       TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          TEXT NOT NULL,
  state         TEXT,
  postal_code   TEXT NOT NULL,
  country       TEXT NOT NULL DEFAULT 'FR',
  phone         TEXT,
  is_default    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4.3 wishlists
CREATE TABLE public.wishlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);

-- 4.4 notification_preferences
CREATE TABLE public.notification_preferences (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_marketing       BOOLEAN DEFAULT true,
  email_order_updates   BOOLEAN DEFAULT true,
  email_review_replies  BOOLEAN DEFAULT true,
  sms_marketing         BOOLEAN DEFAULT false,
  sms_order_updates     BOOLEAN DEFAULT true,
  push_enabled          BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

CREATE TRIGGER trg_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4.5 saved_sizes
CREATE TABLE public.saved_sizes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label             TEXT DEFAULT 'default',
  ring_size         TEXT,
  bracelet_size     TEXT,
  necklace_length   TEXT,
  anklet_length     TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, label)
);

CREATE INDEX idx_saved_sizes_user_id ON public.saved_sizes(user_id);

CREATE TRIGGER trg_saved_sizes_updated_at
  BEFORE UPDATE ON public.saved_sizes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 5. PANIER / COMMANDES (8 tables)
-- ============================================================================

-- 5.1 carts
CREATE TABLE public.carts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT,
  currency    TEXT DEFAULT 'EUR',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_carts_user_id ON public.carts(user_id);
CREATE INDEX idx_carts_session_id ON public.carts(session_id);

CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5.2 cart_items
CREATE TABLE public.cart_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id         UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  pack_id         UUID REFERENCES public.packs(id) ON DELETE SET NULL,
  pack_selections JSONB,
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price      NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);

CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5.3 discount_codes
CREATE TABLE public.discount_codes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                TEXT NOT NULL UNIQUE,
  description         TEXT,
  discount_type       public.discount_type NOT NULL DEFAULT 'percentage',
  discount_value      NUMERIC(10,2) NOT NULL,
  minimum_order_amount NUMERIC(10,2),
  maximum_discount    NUMERIC(10,2),
  usage_limit         INT,
  usage_count         INT DEFAULT 0,
  per_user_limit      INT DEFAULT 1,
  applicable_product_ids UUID[],
  applicable_category_ids UUID[],
  is_active           BOOLEAN DEFAULT true,
  starts_at           TIMESTAMPTZ,
  ends_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX idx_discount_codes_is_active ON public.discount_codes(is_active);

CREATE TRIGGER trg_discount_codes_updated_at
  BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5.4 orders
CREATE TABLE public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        TEXT NOT NULL UNIQUE,
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status              public.order_status DEFAULT 'pending',
  currency            TEXT DEFAULT 'EUR',
  subtotal            NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_total      NUMERIC(10,2) DEFAULT 0,
  shipping_total      NUMERIC(10,2) DEFAULT 0,
  tax_total           NUMERIC(10,2) DEFAULT 0,
  grand_total         NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_address_snapshot JSONB,
  billing_address_snapshot  JSONB,
  gift_wrap           BOOLEAN DEFAULT false,
  gift_message        TEXT,
  customer_note       TEXT,
  internal_note       TEXT,
  email               TEXT,
  phone               TEXT,
  cancelled_at        TIMESTAMPTZ,
  shipped_at          TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5.5 order_items
CREATE TABLE public.order_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id            UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id            UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  pack_id               UUID REFERENCES public.packs(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  variant_name_snapshot TEXT,
  sku_snapshot          TEXT,
  unit_price            NUMERIC(10,2) NOT NULL,
  quantity              INT NOT NULL DEFAULT 1,
  discount_amount       NUMERIC(10,2) DEFAULT 0,
  tax_amount            NUMERIC(10,2) DEFAULT 0,
  total                 NUMERIC(10,2) NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- 5.6 payments
CREATE TABLE public.payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status                public.payment_status DEFAULT 'pending',
  method                TEXT DEFAULT 'card',
  amount                NUMERIC(10,2) NOT NULL,
  currency              TEXT DEFAULT 'EUR',
  stripe_payment_intent_id TEXT,
  stripe_charge_id      TEXT,
  stripe_refund_id      TEXT,
  stripe_customer_id    TEXT,
  stripe_receipt_url    TEXT,
  error_message         TEXT,
  paid_at               TIMESTAMPTZ,
  refunded_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_stripe_pi ON public.payments(stripe_payment_intent_id);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5.7 invoices
CREATE TABLE public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number  TEXT NOT NULL UNIQUE,
  subtotal        NUMERIC(10,2) NOT NULL,
  tax_total       NUMERIC(10,2) DEFAULT 0,
  grand_total     NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'EUR',
  pdf_url         TEXT,
  issued_at       TIMESTAMPTZ DEFAULT now(),
  due_at          TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);

-- 5.8 applied_discounts
CREATE TABLE public.applied_discounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  discount_code_id UUID REFERENCES public.discount_codes(id) ON DELETE SET NULL,
  code            TEXT NOT NULL,
  discount_type   public.discount_type NOT NULL,
  discount_value  NUMERIC(10,2) NOT NULL,
  amount_saved    NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_applied_discounts_order_id ON public.applied_discounts(order_id);

-- ============================================================================
-- 6. LIVRAISON (5 tables)
-- ============================================================================

-- 6.1 shipping_zones
CREATE TABLE public.shipping_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  countries   TEXT[] NOT NULL DEFAULT '{}',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_shipping_zones_updated_at
  BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6.2 shipping_methods
CREATE TABLE public.shipping_methods (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id           UUID NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  carrier           TEXT,
  description       TEXT,
  price             NUMERIC(10,2) NOT NULL DEFAULT 0,
  free_above        NUMERIC(10,2),
  estimated_days_min INT,
  estimated_days_max INT,
  is_active         BOOLEAN DEFAULT true,
  sort_order        INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shipping_methods_zone_id ON public.shipping_methods(zone_id);

CREATE TRIGGER trg_shipping_methods_updated_at
  BEFORE UPDATE ON public.shipping_methods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6.3 shipments
CREATE TABLE public.shipments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shipping_method_id  UUID REFERENCES public.shipping_methods(id) ON DELETE SET NULL,
  status              public.shipment_status DEFAULT 'pending',
  tracking_number     TEXT,
  carrier             TEXT,
  label_url           TEXT,
  shipped_at          TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  estimated_delivery  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_shipments_tracking ON public.shipments(tracking_number);

CREATE TRIGGER trg_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6.4 shipment_items
CREATE TABLE public.shipment_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id   UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  quantity      INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shipment_items_shipment_id ON public.shipment_items(shipment_id);

-- 6.5 tracking_events
CREATE TABLE public.tracking_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id   UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status        TEXT NOT NULL,
  description   TEXT,
  location      TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload   JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tracking_events_shipment_id ON public.tracking_events(shipment_id);

-- ============================================================================
-- 7. SAV / SUPPORT (5 tables)
-- ============================================================================

-- 7.1 tickets
CREATE TABLE public.tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id      UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  assigned_to   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject       TEXT NOT NULL,
  status        public.ticket_status DEFAULT 'open',
  priority      public.ticket_priority DEFAULT 'medium',
  channel       public.ticket_channel DEFAULT 'contact_form',
  category      public.ticket_category DEFAULT 'other',
  resolved_at   TIMESTAMPTZ,
  closed_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7.2 ticket_messages
CREATE TABLE public.ticket_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  is_internal BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);

-- 7.3 returns
CREATE TABLE public.returns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        public.return_status DEFAULT 'requested',
  reason        public.return_reason NOT NULL,
  description   TEXT,
  refund_amount NUMERIC(10,2),
  refund_method TEXT DEFAULT 'original_payment',
  tracking_number TEXT,
  approved_at   TIMESTAMPTZ,
  received_at   TIMESTAMPTZ,
  refunded_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_returns_order_id ON public.returns(order_id);
CREATE INDEX idx_returns_user_id ON public.returns(user_id);
CREATE INDEX idx_returns_status ON public.returns(status);

CREATE TRIGGER trg_returns_updated_at
  BEFORE UPDATE ON public.returns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7.4 return_items
CREATE TABLE public.return_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id     UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  quantity      INT NOT NULL DEFAULT 1,
  reason        public.return_reason,
  condition     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_return_items_return_id ON public.return_items(return_id);

-- 7.5 faq_articles
CREATE TABLE public.faq_articles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_faq_articles_category ON public.faq_articles(category);
CREATE INDEX idx_faq_articles_is_active ON public.faq_articles(is_active);

CREATE TRIGGER trg_faq_articles_updated_at
  BEFORE UPDATE ON public.faq_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 8. MARKETING / FIDÉLITÉ (5 tables)
-- ============================================================================

-- 8.1 loyalty_tiers
CREATE TABLE public.loyalty_tiers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              public.loyalty_tier_name NOT NULL UNIQUE,
  min_points        INT NOT NULL DEFAULT 0,
  points_multiplier NUMERIC(4,2) DEFAULT 1.00,
  perks             JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_loyalty_tiers_updated_at
  BEFORE UPDATE ON public.loyalty_tiers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8.2 loyalty_transactions
CREATE TABLE public.loyalty_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  points      INT NOT NULL,
  type        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_loyalty_transactions_user_id ON public.loyalty_transactions(user_id);

-- 8.3 abandoned_carts
CREATE TABLE public.abandoned_carts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id         UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email           TEXT,
  cart_total      NUMERIC(10,2),
  items_snapshot  JSONB,
  reminder_sent_at TIMESTAMPTZ,
  reminders_count INT DEFAULT 0,
  recovered       BOOLEAN DEFAULT false,
  recovered_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  abandoned_at    TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_abandoned_carts_user_id ON public.abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_recovered ON public.abandoned_carts(recovered);

-- 8.4 email_campaigns
CREATE TABLE public.email_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  subject         TEXT NOT NULL,
  body_html       TEXT,
  body_text       TEXT,
  status          public.campaign_status DEFAULT 'draft',
  recipient_count INT DEFAULT 0,
  open_count      INT DEFAULT 0,
  click_count     INT DEFAULT 0,
  scheduled_at    TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);

CREATE TRIGGER trg_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8.5 blog_posts
CREATE TABLE public.blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  excerpt         TEXT,
  body            TEXT,
  cover_image_url TEXT,
  tags            TEXT[] DEFAULT '{}',
  is_published    BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  seo_title       TEXT,
  seo_description TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_is_published ON public.blog_posts(is_published);

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 9. ADMIN (6 tables)
-- ============================================================================

-- 9.1 admin_roles
CREATE TABLE public.admin_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '[]',
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_admin_roles_updated_at
  BEFORE UPDATE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 9.2 admin_users
CREATE TABLE public.admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id     UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE RESTRICT,
  is_active   BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);

CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 9.3 audit_logs
CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- 9.4 settings
CREATE TABLE public.settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  value       JSONB NOT NULL,
  description TEXT,
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_settings_key ON public.settings(key);

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 9.5 cms_pages
CREATE TABLE public.cms_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  body            TEXT,
  meta_title      TEXT,
  meta_description TEXT,
  is_published    BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cms_pages_slug ON public.cms_pages(slug);
CREATE INDEX idx_cms_pages_is_published ON public.cms_pages(is_published);

CREATE TRIGGER trg_cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 9.6 banners
CREATE TABLE public.banners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  subtitle        TEXT,
  image_url       TEXT,
  link_url        TEXT,
  placement       public.banner_placement DEFAULT 'hero',
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT DEFAULT 0,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_banners_placement ON public.banners(placement);
CREATE INDEX idx_banners_is_active ON public.banners(is_active);

CREATE TRIGGER trg_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- TRIGGER: auto-create profile on new auth.users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY — Activation sur toutes les tables
-- ============================================================================

ALTER TABLE public.categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_relations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_variant_options   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_sizes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applied_discounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_articles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners                ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES — Service role (admin) : accès total
-- ============================================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'categories','collections','products','product_variants','product_media',
      'product_attributes','product_relations','product_tags','inventory',
      'packs','pack_items','pack_variant_options',
      'reviews','review_responses',
      'profiles','addresses','wishlists','notification_preferences','saved_sizes',
      'carts','cart_items','discount_codes','orders','order_items','payments',
      'invoices','applied_discounts',
      'shipping_zones','shipping_methods','shipments','shipment_items','tracking_events',
      'tickets','ticket_messages','returns','return_items','faq_articles',
      'loyalty_tiers','loyalty_transactions','abandoned_carts','email_campaigns','blog_posts',
      'admin_roles','admin_users','audit_logs','settings','cms_pages','banners'
    ])
  LOOP
    EXECUTE format(
      'CREATE POLICY "Service role full access on %1$s" ON public.%1$s FOR ALL TO service_role USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- RLS POLICIES — Lecture publique (anon + authenticated)
-- ============================================================================

-- Catalogue : lecture publique des produits actifs et données associées
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public read collections"
  ON public.collections FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public read products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public read product_variants"
  ON public.product_variants FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public read product_media"
  ON public.product_media FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read product_attributes"
  ON public.product_attributes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read product_relations"
  ON public.product_relations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read product_tags"
  ON public.product_tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read packs"
  ON public.packs FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public read pack_items"
  ON public.pack_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read pack_variant_options"
  ON public.pack_variant_options FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read approved reviews"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "Public read review_responses"
  ON public.review_responses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read faq_articles"
  ON public.faq_articles FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public read published blog_posts"
  ON public.blog_posts FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Public read published cms_pages"
  ON public.cms_pages FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Public read active banners"
  ON public.banners FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public read loyalty_tiers"
  ON public.loyalty_tiers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read shipping_zones"
  ON public.shipping_zones FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public read shipping_methods"
  ON public.shipping_methods FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public read discount_codes"
  ON public.discount_codes FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- ============================================================================
-- RLS POLICIES — Utilisateurs authentifiés : CRUD sur leurs propres données
-- ============================================================================

-- profiles
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- addresses
CREATE POLICY "Users CRUD own addresses (select)"
  ON public.addresses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users CRUD own addresses (insert)"
  ON public.addresses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users CRUD own addresses (update)"
  ON public.addresses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users CRUD own addresses (delete)"
  ON public.addresses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- wishlists
CREATE POLICY "Users CRUD own wishlists (select)"
  ON public.wishlists FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users CRUD own wishlists (insert)"
  ON public.wishlists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users CRUD own wishlists (delete)"
  ON public.wishlists FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- notification_preferences
CREATE POLICY "Users CRUD own notification_preferences (select)"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users CRUD own notification_preferences (insert)"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users CRUD own notification_preferences (update)"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- saved_sizes
CREATE POLICY "Users CRUD own saved_sizes (select)"
  ON public.saved_sizes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users CRUD own saved_sizes (insert)"
  ON public.saved_sizes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users CRUD own saved_sizes (update)"
  ON public.saved_sizes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users CRUD own saved_sizes (delete)"
  ON public.saved_sizes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- carts
CREATE POLICY "Users CRUD own carts (select)"
  ON public.carts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users CRUD own carts (insert)"
  ON public.carts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users CRUD own carts (update)"
  ON public.carts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users CRUD own carts (delete)"
  ON public.carts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Anon carts (session-based)
CREATE POLICY "Anon read carts by session"
  ON public.carts FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

CREATE POLICY "Anon insert carts"
  ON public.carts FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Anon update carts by session"
  ON public.carts FOR UPDATE
  TO anon
  USING (user_id IS NULL AND session_id IS NOT NULL)
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- cart_items
CREATE POLICY "Users CRUD own cart_items (select)"
  ON public.cart_items FOR SELECT
  TO authenticated
  USING (
    cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users CRUD own cart_items (insert)"
  ON public.cart_items FOR INSERT
  TO authenticated
  WITH CHECK (
    cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users CRUD own cart_items (update)"
  ON public.cart_items FOR UPDATE
  TO authenticated
  USING (
    cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
  )
  WITH CHECK (
    cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users CRUD own cart_items (delete)"
  ON public.cart_items FOR DELETE
  TO authenticated
  USING (
    cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
  );

CREATE POLICY "Anon CRUD cart_items by session"
  ON public.cart_items FOR SELECT
  TO anon
  USING (
    cart_id IN (SELECT id FROM public.carts WHERE session_id IS NOT NULL AND user_id IS NULL)
  );

CREATE POLICY "Anon insert cart_items"
  ON public.cart_items FOR INSERT
  TO anon
  WITH CHECK (
    cart_id IN (SELECT id FROM public.carts WHERE session_id IS NOT NULL AND user_id IS NULL)
  );

-- reviews: users can create their own
CREATE POLICY "Users insert own reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users read own reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_approved = true);

-- ============================================================================
-- RLS POLICIES — Lecture propre : commandes, paiements, envois, tickets, retours
-- ============================================================================

-- orders
CREATE POLICY "Users read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- order_items
CREATE POLICY "Users read own order_items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- payments
CREATE POLICY "Users read own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- invoices
CREATE POLICY "Users read own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- applied_discounts
CREATE POLICY "Users read own applied_discounts"
  ON public.applied_discounts FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- shipments
CREATE POLICY "Users read own shipments"
  ON public.shipments FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- shipment_items
CREATE POLICY "Users read own shipment_items"
  ON public.shipment_items FOR SELECT
  TO authenticated
  USING (
    shipment_id IN (
      SELECT s.id FROM public.shipments s
      JOIN public.orders o ON o.id = s.order_id
      WHERE o.user_id = auth.uid()
    )
  );

-- tracking_events
CREATE POLICY "Users read own tracking_events"
  ON public.tracking_events FOR SELECT
  TO authenticated
  USING (
    shipment_id IN (
      SELECT s.id FROM public.shipments s
      JOIN public.orders o ON o.id = s.order_id
      WHERE o.user_id = auth.uid()
    )
  );

-- tickets
CREATE POLICY "Users read own tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own tickets"
  ON public.tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own tickets"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ticket_messages
CREATE POLICY "Users read own ticket_messages"
  ON public.ticket_messages FOR SELECT
  TO authenticated
  USING (
    ticket_id IN (SELECT id FROM public.tickets WHERE user_id = auth.uid())
    AND is_internal = false
  );

CREATE POLICY "Users create ticket_messages"
  ON public.ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND ticket_id IN (SELECT id FROM public.tickets WHERE user_id = auth.uid())
  );

-- returns
CREATE POLICY "Users read own returns"
  ON public.returns FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own returns"
  ON public.returns FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- return_items
CREATE POLICY "Users read own return_items"
  ON public.return_items FOR SELECT
  TO authenticated
  USING (
    return_id IN (SELECT id FROM public.returns WHERE user_id = auth.uid())
  );

-- loyalty_transactions
CREATE POLICY "Users read own loyalty_transactions"
  ON public.loyalty_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES — Tables admin-only (pas de policies publiques)
-- inventory, admin_roles, admin_users, audit_logs, settings,
-- email_campaigns, abandoned_carts sont uniquement accessibles via service_role
-- ============================================================================

-- (Aucune policy supplémentaire nécessaire : service_role a déjà accès complet,
--  et les rôles anon/authenticated n'ont aucune policy => accès refusé par défaut)

-- ============================================================================
-- FIN DU SCHÉMA INITIAL — 45 tables, RLS complet, indexes, triggers
-- ============================================================================
