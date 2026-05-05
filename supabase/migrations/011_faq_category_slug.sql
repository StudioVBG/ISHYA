-- ============================================================================
-- Migration 011 — Stabilisation des slugs de catégorie FAQ
-- ============================================================================
--
-- Avant : `faq_articles.category` était un libellé libre (ex. "Livraison",
-- "Programme fidélité"), slugifié dynamiquement côté Next via faqSlugify().
-- Conséquence : renommer une catégorie en admin cassait silencieusement
-- toutes les ancres #<slug> et tout lien externe vers la FAQ.
--
-- On ajoute une colonne `category_slug` stable, backfillée depuis l'existant.
-- Le code public lit désormais ce slug explicite.
-- ============================================================================

ALTER TABLE public.faq_articles
  ADD COLUMN IF NOT EXISTS category_slug TEXT;

-- Backfill simple sans extension unaccent : on remplace les diacritiques
-- les plus courants en français puis on slugifie.
UPDATE public.faq_articles
   SET category_slug = trim(
     both '-' FROM
     regexp_replace(
       lower(
         translate(
           coalesce(category, ''),
           'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
           'aaaaaaceeeeiiiinooooouuuuyy'
         )
       ),
       '[^a-z0-9]+',
       '-',
       'g'
     )
   )
 WHERE category_slug IS NULL;

CREATE INDEX IF NOT EXISTS idx_faq_articles_category_slug
  ON public.faq_articles(category_slug);
