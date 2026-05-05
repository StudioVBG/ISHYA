-- =============================================================================
-- Migration 006 : Newsletter + Cartes cadeaux + Messages de contact
-- =============================================================================
-- Tables annexes pour les flows :
--   • Inscription/désinscription newsletter (homepage + footer + /desinscription)
--   • Achat de cartes cadeaux (Stripe Checkout + email Resend au destinataire)
--   • Messages du formulaire de contact (/contact)
--
-- Convention RLS : on suit le même schéma que le reste du projet —
--   • Service role = accès total (utilisé par les server actions / webhooks)
--   • Anon/authenticated peuvent uniquement INSÉRER pour les flows publics
--   • La lecture est réservée au service role (les pages admin lisent côté
--     server avec le client admin).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- newsletter_subscribers
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email              TEXT NOT NULL,
  source             TEXT,                       -- 'home' | 'footer' | 'checkout' | …
  subscribed_at      TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at    TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- Email unique en case-insensitive (pas besoin de citext).
CREATE UNIQUE INDEX IF NOT EXISTS uniq_newsletter_subscribers_email_lower
  ON public.newsletter_subscribers (lower(email));

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active
  ON public.newsletter_subscribers (unsubscribed_at)
  WHERE unsubscribed_at IS NULL;

CREATE TRIGGER trg_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on newsletter_subscribers"
  ON public.newsletter_subscribers FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public insert newsletter_subscribers"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- gift_cards
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                     TEXT NOT NULL UNIQUE,         -- code à utiliser au checkout
  initial_amount           NUMERIC(10,2) NOT NULL CHECK (initial_amount > 0),
  amount_remaining         NUMERIC(10,2) NOT NULL CHECK (amount_remaining >= 0),
  currency                 TEXT NOT NULL DEFAULT 'EUR',
  recipient_email          TEXT NOT NULL,
  recipient_name           TEXT,
  sender_name              TEXT,
  sender_email             TEXT,
  message                  TEXT,
  delivery_date            DATE,                          -- null = envoi immédiat
  status                   TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','paid','sent','redeemed','expired','cancelled')),
  stripe_session_id        TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  paid_at                  TIMESTAMPTZ,
  sent_at                  TIMESTAMPTZ,
  expires_at               TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient
  ON public.gift_cards (lower(recipient_email));
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON public.gift_cards(status);

CREATE TRIGGER trg_gift_cards_updated_at
  BEFORE UPDATE ON public.gift_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Aucun accès anon/authenticated direct : tout passe par le service role
-- (création via Stripe webhook, lecture via pages admin server-side).
CREATE POLICY "Service role full access on gift_cards"
  ON public.gift_cards FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- contact_messages
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  ip_address  INET,
  user_agent  TEXT,
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new','read','answered','spam','archived')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages (lower(email));
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);

CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on contact_messages"
  ON public.contact_messages FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public insert contact_messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
