-- ============================================================================
-- Migration 010 — Nettoyage des image_url de sous-catégories pointant vers
-- des fichiers inexistants
-- ============================================================================
--
-- Le seed initial créait ~25 sous-catégories pointant vers des images comme
-- /images/categories/ras-de-cou.jpg, /images/categories/sautoirs.jpg, etc.
-- qui n'existent pas dans /public/images/categories. Seuls les 6 fichiers
-- des catégories parentes sont présents (colliers, bagues, bracelets,
-- boucles-oreilles, accessoires, packs-parures).
--
-- Le composant <Image> côté front retombe sur un placeholder quand image_url
-- est NULL, donc on nullifie ces refs cassées. Si des assets sont ajoutés
-- plus tard, l'admin pourra les recâbler depuis /admin/categories.
-- ============================================================================

UPDATE public.categories
   SET image_url = NULL
 WHERE parent_id IS NOT NULL
   AND image_url IS NOT NULL;
