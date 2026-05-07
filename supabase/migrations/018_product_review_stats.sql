-- ─────────────────────────────────────────────────────────────────────────────
-- Vue product_review_stats : agrégat (average, count) des avis approuvés
-- ─────────────────────────────────────────────────────────────────────────────
-- Permet d'afficher la note moyenne sur les cartes produit (boutique,
-- carrousels, related) sans charger la liste complète des avis.
--
-- La vue ne stocke rien : c'est un agrégat en lecture sur reviews. La policy
-- "Public read approved reviews" autorise déjà l'anon à lire les lignes
-- is_approved=true, donc la vue hérite naturellement de ces droits.
-- Si la table grossit (>100k lignes) on basculera vers une matérialisée
-- rafraîchie sur le webhook d'approbation.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view public.product_review_stats as
select
  product_id,
  round(avg(rating)::numeric, 2)::float as average,
  count(*)::int as count
from public.reviews
where is_approved = true
group by product_id;

comment on view public.product_review_stats is
  'Agrégat (note moyenne, nombre d''avis approuvés) par produit pour les cartes storefront.';

-- Index sur reviews(product_id, is_approved) pour accélérer la vue
create index if not exists idx_reviews_product_approved
  on public.reviews(product_id)
  where is_approved = true;
