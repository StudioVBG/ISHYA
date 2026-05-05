-- ============================================================================
-- ISHYA — Migration 005 — Simplification des rôles à 2 valeurs
--
-- Avant : 'customer' | 'support' | 'editor' | 'admin' | 'super_admin'
-- Après : 'customer' | 'admin'
--
-- Mapping :
--   super_admin → admin   (un seul niveau d'admin)
--   admin       → admin
--   editor      → customer (rétrogradé : aucun staff dédié au contenu)
--   support     → customer (rétrogradé : aucun staff dédié au support)
--   customer    → customer
-- ============================================================================

-- 1. NORMALISER LES DONNÉES EXISTANTES
-- ----------------------------------------------------------------------------
UPDATE public.profiles SET role = 'admin'    WHERE role = 'super_admin';
UPDATE public.profiles SET role = 'customer' WHERE role IN ('editor', 'support');

-- 2. DROP LES POLICIES QUI RÉFÉRENCENT profiles.role
-- ----------------------------------------------------------------------------
-- Postgres refuse de modifier le type d'une colonne tant qu'une policy en
-- dépend. On supprime ces policies maintenant, on recrée la colonne, puis
-- on les recrée avec la nouvelle valeur 'admin' à l'étape 4.

DROP POLICY IF EXISTS "Admins can upload products-media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete products-media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update products-media" ON storage.objects;

-- 3. RECRÉER L'ENUM AVEC SEULEMENT 2 VALEURS
-- ----------------------------------------------------------------------------
-- Postgres ne sait pas DROP VALUE sur un enum ; on en crée un nouveau,
-- on convertit la colonne, puis on jette l'ancien.

ALTER TYPE public.user_role RENAME TO user_role_old;

CREATE TYPE public.user_role AS ENUM ('customer', 'admin');

ALTER TABLE public.profiles
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE public.user_role
    USING role::text::public.user_role,
  ALTER COLUMN role SET DEFAULT 'customer';

DROP TYPE public.user_role_old;

-- 4. RECRÉER LES POLICIES STORAGE
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins can upload products-media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'products-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles
       WHERE profiles.id = auth.uid()
         AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products-media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'products-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles
       WHERE profiles.id = auth.uid()
         AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update products-media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'products-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles
       WHERE profiles.id = auth.uid()
         AND profiles.role = 'admin'
    )
  );

-- 5. SANITY CHECK (commenté — décommente dans le SQL editor pour vérifier)
-- ----------------------------------------------------------------------------
-- SELECT role, count(*) FROM public.profiles GROUP BY role;
-- Doit ne contenir que 'customer' et 'admin'.
