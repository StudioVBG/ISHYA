-- ─────────────────────────────────────────────────────────────────────────────
-- Newsletter — gestion des bounces et plaintes (Resend webhooks)
-- ─────────────────────────────────────────────────────────────────────────────
-- L'audit avait flagué qu'il n'y avait aucun bounce handling : les emails
-- qui rebondissent (boîtes invalides, full mailbox, plaintes spam) ne
-- déclenchaient aucune action côté DB → réputation expéditeur dégradée
-- (Gmail/Outlook commencent à bloquer après quelques % de bounces).
--
-- Cette migration ajoute les colonnes nécessaires au tracking + index.
-- Le webhook Resend (POST /api/webhooks/resend) les met à jour.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS bounce_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_bounced_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS last_bounce_type TEXT NULL,
  ADD COLUMN IF NOT EXISTS last_bounce_reason TEXT NULL;

-- Contrainte sur le type pour éviter les valeurs aléatoires
ALTER TABLE public.newsletter_subscribers
  DROP CONSTRAINT IF EXISTS newsletter_subscribers_bounce_type_check;
ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_bounce_type_check
  CHECK (
    last_bounce_type IS NULL
    OR last_bounce_type IN ('hard', 'soft', 'complaint', 'transient')
  );

-- Index partiel pour exposer rapidement les abonnés problématiques dans l'admin
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_bounced
  ON public.newsletter_subscribers (last_bounced_at DESC)
  WHERE bounce_count > 0;
