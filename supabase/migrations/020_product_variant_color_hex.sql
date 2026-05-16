-- ============================================================================
-- 020. Coloris : pastille couleur par déclinaison
-- ----------------------------------------------------------------------------
-- Ajoute une couleur (hex) optionnelle sur chaque déclinaison pour afficher
-- une pastille de coloris côté boutique. Additif et non destructif.
-- L'association photo <-> coloris utilise product_media.variant_id, déjà
-- présent depuis la migration 001.
-- ============================================================================

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS color_hex TEXT;

COMMENT ON COLUMN public.product_variants.color_hex IS
  'Couleur d''affichage du coloris (format #RRGGBB), pour la pastille storefront.';
