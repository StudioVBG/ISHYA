-- ============================================================================
-- ISHYA — Migration 006 — Table email_logs (idempotence des emails cron)
--
-- Sans ce journal, les jobs (anniversaires, panier abandonné, etc.) peuvent
-- envoyer plusieurs fois le même email si le cron est rejoué (Vercel retry,
-- redéploiement, exécution manuelle…). Cette table sert à dédupliquer.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email       TEXT NOT NULL,
  email_type  TEXT NOT NULL,
  dedup_key   TEXT NOT NULL,
  metadata    JSONB,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT email_logs_dedup_key_unique UNIQUE (email_type, dedup_key)
);

CREATE INDEX IF NOT EXISTS email_logs_email_idx       ON public.email_logs(email);
CREATE INDEX IF NOT EXISTS email_logs_user_id_idx     ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS email_logs_email_type_idx  ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS email_logs_sent_at_idx     ON public.email_logs(sent_at DESC);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Le service-role gère ces écritures côté serveur ; aucun accès client.
DROP POLICY IF EXISTS "Service role full access on email_logs" ON public.email_logs;
CREATE POLICY "Service role full access on email_logs"
  ON public.email_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Lecture admin uniquement (debug, supervision).
DROP POLICY IF EXISTS "Admins can read email_logs" ON public.email_logs;
CREATE POLICY "Admins can read email_logs"
  ON public.email_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE public.email_logs IS
  'Journal des emails transactionnels envoyés. dedup_key garantit l''idempotence (ex: birthday:USER_ID:2026, abandoned_cart_1:CART_ID).';

-- ============================================================================
-- Idempotence du checkout — colonne sur orders
-- Permet à /api/stripe/create-payment-intent de retourner la même commande
-- en cas de double-clic ou de retry réseau (clé fournie par le client).
-- ============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_key
  ON public.orders(idempotency_key)
  WHERE idempotency_key IS NOT NULL;
