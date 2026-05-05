-- ============================================================================
-- Migration 009 — Suppression des pages CMS en doublon avec les routes React
-- ============================================================================
--
-- Le seed initial créait 5 pages CMS (/p/<slug>) dont le contenu doublonnait
-- des pages React déjà existantes :
--
--   /p/a-propos                  ↔ /a-propos
--   /p/cgv                       ↔ /cgv
--   /p/mentions-legales          ↔ /mentions-legales
--   /p/politique-confidentialite ↔ /confidentialite (slug différent)
--   /p/politique-retour          ↔ /retours          (slug différent)
--
-- Les routes React sont la source canonique (UI riche, animations, structure
-- éditoriale). Les pages CMS doublonnaient le contenu sans être liées dans
-- la navigation publique → invisibles pour l'utilisateur, mais éditables par
-- l'admin qui croyait modifier le site sans effet.
--
-- On supprime ces 5 entrées. L'admin peut toujours créer ses propres pages
-- CMS pour de NOUVEAUX slugs via /admin/pages.
-- ============================================================================

DELETE FROM public.cms_pages
 WHERE slug IN (
   'a-propos',
   'cgv',
   'mentions-legales',
   'politique-confidentialite',
   'politique-retour'
 );
