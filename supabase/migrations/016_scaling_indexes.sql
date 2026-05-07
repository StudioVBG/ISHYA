-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes pour scaling > 10K-100K lignes
-- ─────────────────────────────────────────────────────────────────────────────
-- L'audit avait flagué plusieurs requêtes admin qui ne scalent pas sans
-- indexes ciblés :
--
-- 1. /admin/audit  : LIMIT/ORDER BY sur (table_name, action, created_at)
--    + filtre par user_id, dateFrom/dateTo. Sans index, scan full sur
--    audit_logs dès quelques milliers de lignes.
--
-- 2. /admin/rapports : RPC report_top_products / report_revenue_by_category
--    JOIN orders ON oi.order_id = o.id WHERE o.created_at BETWEEN ... AND
--    o.status IN (...). Sans index sur (status, created_at), scan full.
--
-- 3. /admin/avis : pagination + filtre rating + is_approved + ORDER BY
--    created_at. Index sur (is_approved, created_at) accélère le filtre
--    "en attente de modération".
--
-- 4. /admin/paniers-abandonnes : `recovered = false AND reminder_sent_at`
--    pour les filtres "À relancer" / "Relancés".
--
-- Tous les indexes sont créés en `IF NOT EXISTS` pour idempotence + en
-- `CREATE INDEX CONCURRENTLY` non utilisé volontairement (incompatible
-- avec une migration transactionnelle ; pour des tables qui dépassent
-- 1M lignes, basculer en CONCURRENTLY manuellement).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. audit_logs
-- ─────────────────────────────────────────────────────────────────────────────
-- Filtre principal : ORDER BY created_at DESC LIMIT 50
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs (created_at DESC);

-- Filtre par table+action+date (cas le plus courant : "qui a touché orders ?")
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action_created
  ON public.audit_logs (table_name, action, created_at DESC)
  WHERE table_name IS NOT NULL;

-- Filtre par utilisateur
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
  ON public.audit_logs (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- 2. orders
-- ─────────────────────────────────────────────────────────────────────────────
-- Filtre principal des rapports : status IN (...) AND created_at BETWEEN
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON public.orders (status, created_at DESC);

-- Filtre dashboard "commandes en attente"
CREATE INDEX IF NOT EXISTS idx_orders_pending
  ON public.orders (created_at DESC)
  WHERE status = 'pending';

-- Recherche par numéro (tableaux liste + détail)
CREATE INDEX IF NOT EXISTS idx_orders_order_number
  ON public.orders (order_number);

-- 3. order_items
-- ─────────────────────────────────────────────────────────────────────────────
-- Pour le RPC report_top_products : JOIN orders + GROUP BY product_id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON public.order_items (order_id);

-- Pour les requêtes du type "stats produit X sur la période"
CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON public.order_items (product_id)
  WHERE product_id IS NOT NULL;

-- 4. reviews
-- ─────────────────────────────────────────────────────────────────────────────
-- Filtre principal admin : is_approved + tri par date
CREATE INDEX IF NOT EXISTS idx_reviews_approval_created
  ON public.reviews (is_approved, created_at DESC);

-- Affichage public par produit
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved
  ON public.reviews (product_id, is_approved, created_at DESC);

-- Filtre par note (admin)
CREATE INDEX IF NOT EXISTS idx_reviews_rating
  ON public.reviews (rating, created_at DESC);

-- 5. returns + tickets
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_returns_status_created
  ON public.returns (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tickets_status_created
  ON public.tickets (status, created_at DESC);

-- 6. abandoned_carts
-- ─────────────────────────────────────────────────────────────────────────────
-- Filtre cron + UI : non récupérés, ordre par date
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovered_created
  ON public.abandoned_carts (recovered, created_at DESC);

-- Cron : trouve les paniers à relancer (recovered=false, reminders_count<3)
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_to_remind
  ON public.abandoned_carts (created_at DESC)
  WHERE recovered = false AND reminders_count < 3;

-- 7. notification_counts (cloche admin)
-- ─────────────────────────────────────────────────────────────────────────────
-- 4 SELECT count toutes les 60s : status='pending' / 'requested' / etc.
CREATE INDEX IF NOT EXISTS idx_returns_requested
  ON public.returns (id)
  WHERE status = 'requested';

CREATE INDEX IF NOT EXISTS idx_tickets_open_states
  ON public.tickets (id)
  WHERE status IN ('open', 'in_progress', 'waiting_internal');

CREATE INDEX IF NOT EXISTS idx_reviews_unmoderated
  ON public.reviews (id)
  WHERE is_approved = false;
