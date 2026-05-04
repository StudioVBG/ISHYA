-- ============================================================================
-- ISHYA — Migration 002 — Renforcement modules produit / pack / collection
-- 1. Junctions m2m product↔collections, product↔categories
-- 2. RPC atomique de décrément du stock
-- 3. Trigger d'auto-création de la ligne inventory
-- 4. RLS plus stricte sur pack_items
-- ============================================================================

-- 1. JUNCTIONS M2M
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.product_collections (
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_product_collections_collection
  ON public.product_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_product
  ON public.product_collections(product_id);

CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_category
  ON public.product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_product
  ON public.product_categories(product_id);

-- Backfill depuis les FK existantes (products.collection_id / category_id)
INSERT INTO public.product_collections (product_id, collection_id)
SELECT id, collection_id FROM public.products
WHERE collection_id IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id FROM public.products
WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on product_collections"
  ON public.product_collections FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Public read product_collections"
  ON public.product_collections FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access on product_categories"
  ON public.product_categories FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Public read product_categories"
  ON public.product_categories FOR SELECT TO anon, authenticated
  USING (true);

-- 2. AUTO-CRÉATION INVENTORY À L'INSERT D'UNE VARIANTE
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_inventory_for_variant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.inventory (variant_id, warehouse, quantity)
  VALUES (NEW.id, 'default', NEW.stock_quantity)
  ON CONFLICT (variant_id, warehouse) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_variant_create_inventory ON public.product_variants;
CREATE TRIGGER trg_variant_create_inventory
  AFTER INSERT ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.create_inventory_for_variant();

-- Backfill inventory pour les variantes existantes
INSERT INTO public.inventory (variant_id, warehouse, quantity)
SELECT id, 'default', stock_quantity FROM public.product_variants
ON CONFLICT (variant_id, warehouse) DO NOTHING;

-- 3. RPC ATOMIQUE : DÉCRÉMENT DE STOCK
-- ----------------------------------------------------------------------------
-- Décrémente atomiquement product_variants.stock_quantity ET inventory.quantity
-- Utilisé par le webhook Stripe lors de la confirmation de paiement.

CREATE OR REPLACE FUNCTION public.decrement_variant_stock(
  p_variant_id UUID,
  p_quantity   INT
)
RETURNS TABLE (variant_id UUID, new_quantity INT) AS $$
DECLARE
  v_new_qty INT;
BEGIN
  IF p_quantity <= 0 THEN
    RETURN;
  END IF;

  UPDATE public.product_variants
  SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
  WHERE id = p_variant_id
  RETURNING stock_quantity INTO v_new_qty;

  IF v_new_qty IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.inventory
  SET quantity = GREATEST(0, quantity - p_quantity)
  WHERE inventory.variant_id = p_variant_id;

  RETURN QUERY SELECT p_variant_id, v_new_qty;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.decrement_variant_stock(UUID, INT)
  TO service_role;

-- 4. RLS pack_items : limiter aux packs actifs
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public read pack_items" ON public.pack_items;
CREATE POLICY "Public read pack_items"
  ON public.pack_items FOR SELECT
  TO anon, authenticated
  USING (
    pack_id IN (SELECT id FROM public.packs WHERE is_active = true)
  );

DROP POLICY IF EXISTS "Public read pack_variant_options" ON public.pack_variant_options;
CREATE POLICY "Public read pack_variant_options"
  ON public.pack_variant_options FOR SELECT
  TO anon, authenticated
  USING (
    pack_item_id IN (
      SELECT pi.id FROM public.pack_items pi
      JOIN public.packs p ON p.id = pi.pack_id
      WHERE p.is_active = true
    )
  );

-- ============================================================================
-- FIN MIGRATION 002
-- ============================================================================
