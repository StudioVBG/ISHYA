-- ============================================================================
-- ISHYA — Migration 003 — Bucket Storage pour les photos produits
-- 1. Création du bucket public "products-media"
-- 2. Limites : 8 Mo/fichier, MIME image/* uniquement
-- 3. RLS : lecture publique, écriture/suppression réservées au service_role
--    (les uploads passent par les server actions admin → service_role).
-- 4. Ajout colonne product_media.storage_path pour le nettoyage automatique
-- ============================================================================

-- 0. COLONNE STORAGE_PATH SUR product_media
-- ----------------------------------------------------------------------------
-- Permet de supprimer le fichier dans Storage quand on retire un média.
ALTER TABLE public.product_media
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

CREATE INDEX IF NOT EXISTS idx_product_media_storage_path
  ON public.product_media(storage_path)
  WHERE storage_path IS NOT NULL;

-- 1. BUCKET
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products-media',
  'products-media',
  true,
  8388608, -- 8 MiB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. POLICIES
-- ----------------------------------------------------------------------------
-- Lecture publique (le bucket est public mais on l'écrit explicitement)
DROP POLICY IF EXISTS "Public read products-media" ON storage.objects;
CREATE POLICY "Public read products-media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'products-media');

-- Le service_role peut tout faire (uploads via server actions admin)
DROP POLICY IF EXISTS "Service role full access products-media" ON storage.objects;
CREATE POLICY "Service role full access products-media"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'products-media')
  WITH CHECK (bucket_id = 'products-media');

-- Les utilisateurs admin/super_admin authentifiés peuvent uploader directement
-- (utile pour l'uploader côté client qui contourne le passage par server action).
DROP POLICY IF EXISTS "Admins can upload products-media" ON storage.objects;
CREATE POLICY "Admins can upload products-media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'products-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Admins can delete products-media" ON storage.objects;
CREATE POLICY "Admins can delete products-media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'products-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Admins can update products-media" ON storage.objects;
CREATE POLICY "Admins can update products-media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'products-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'editor')
    )
  );

-- ============================================================================
-- FIN MIGRATION 003
-- ============================================================================
