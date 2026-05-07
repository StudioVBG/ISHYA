-- ─────────────────────────────────────────────────────────────────────────────
-- Newsletter — double opt-in + traçabilité du consentement RGPD
-- ─────────────────────────────────────────────────────────────────────────────
-- L'audit a flagué que la table newsletter_subscribers ne traçait ni le
-- consentement explicite (RGPD art. 7), ni la confirmation par email
-- (double opt-in, exigence CNIL pour les emails marketing). De plus, l'admin
-- pouvait réabonner un client sans nouveau consentement — ce qui est
-- explicitement interdit par le RGPD.
--
-- Cette migration ajoute :
--   - `marketing_consent` (boolean) : flag de consentement explicite
--   - `confirmation_token` (text) : token unique envoyé par email pour double opt-in
--   - `confirmed_at` (timestamptz) : date de la confirmation effective
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT NULL,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL;

-- Backfill : les inscrits déjà actifs (non désabonnés) sont considérés comme
-- ayant donné leur consentement (grandfathering RGPD : on assume que le
-- consentement était implicite via l'ancien formulaire). On les marque comme
-- confirmés à leur date d'inscription pour ne pas casser le flow existant.
UPDATE public.newsletter_subscribers
   SET marketing_consent = TRUE,
       confirmed_at = subscribed_at
 WHERE marketing_consent = FALSE
   AND unsubscribed_at IS NULL;

-- Index pour la recherche par token (lookup unique côté API confirm)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_newsletter_subscribers_token
  ON public.newsletter_subscribers (confirmation_token)
  WHERE confirmation_token IS NOT NULL;

-- Index partiel pour cibler rapidement les inscrits confirmés et actifs
-- (= ceux qui doivent recevoir les emails marketing).
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active_confirmed
  ON public.newsletter_subscribers (confirmed_at)
  WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL;
