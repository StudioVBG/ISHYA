-- ─────────────────────────────────────────────────────────────────────────────
-- Rapports : agrégations SQL natives (RPC)
-- ─────────────────────────────────────────────────────────────────────────────
-- L'audit avait flagué que /admin/rapports faisait des SUM/GROUP BY côté JS
-- sur les 1000 premiers `order_items`, ce qui produisait des Top Produits
-- faux dès ~150 commandes. De plus, `byCategory` ne filtrait pas les
-- commandes annulées/pending.
--
-- Cette migration ajoute deux fonctions Postgres pour faire l'agrégation
-- côté SQL (où elle est rapide et exacte) et les exposer en RPC Supabase.
-- ─────────────────────────────────────────────────────────────────────────────

-- Top produits (par chiffre d'affaires)
CREATE OR REPLACE FUNCTION public.report_top_products(
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  product_id UUID,
  name TEXT,
  quantity BIGINT,
  revenue NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT
    oi.product_id,
    COALESCE(MAX(p.name), MAX(oi.product_name_snapshot))::TEXT AS name,
    SUM(oi.quantity)::BIGINT AS quantity,
    SUM(oi.total)::NUMERIC AS revenue
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  LEFT JOIN public.products p ON p.id = oi.product_id
  WHERE o.created_at >= p_start
    AND o.created_at <  p_end
    AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
    AND oi.product_id IS NOT NULL
  GROUP BY oi.product_id
  ORDER BY revenue DESC
  LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION public.report_top_products(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_top_products(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) TO service_role;

-- CA par catégorie principale (products.category_id)
-- Filtre sur les statuts "valides" (paid+) — corrige le bug audit où
-- byCategory incluait les commandes annulées/pending.
CREATE OR REPLACE FUNCTION public.report_revenue_by_category(
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ
)
RETURNS TABLE (
  category_name TEXT,
  revenue NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT
    c.name::TEXT AS category_name,
    SUM(oi.total)::NUMERIC AS revenue
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  LEFT JOIN public.products p ON p.id = oi.product_id
  LEFT JOIN public.categories c ON c.id = p.category_id
  WHERE o.created_at >= p_start
    AND o.created_at <  p_end
    AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
    AND c.name IS NOT NULL
  GROUP BY c.name
  ORDER BY revenue DESC;
$$;

REVOKE ALL ON FUNCTION public.report_revenue_by_category(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_revenue_by_category(TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;

-- Répartition des statuts (toutes périodes)
-- Plus rapide que SELECT status FROM orders (on évite de transférer 1 ligne
-- par commande pour faire un GROUP BY côté JS).
CREATE OR REPLACE FUNCTION public.report_orders_by_status()
RETURNS TABLE (
  status TEXT,
  total BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT
    o.status::TEXT,
    COUNT(*)::BIGINT AS total
  FROM public.orders o
  GROUP BY o.status;
$$;

REVOKE ALL ON FUNCTION public.report_orders_by_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_orders_by_status() TO service_role;
