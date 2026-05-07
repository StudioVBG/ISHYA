-- ============================================================================
-- ISHYA — Migration 013 — Consentement explicite à l'inscription (RGPD)
--
-- Avant :
--   • notification_preferences.email_marketing avait DEFAULT true → tout
--     compte créé recevait du marketing par défaut, même sans consentement.
--   • La case « newsletter » du formulaire /inscription n'était jamais lue
--     côté client : sa valeur était silencieusement perdue.
--   • L'acceptation des CGV n'était pas tracée (pas de timestamp, pas de
--     version) → impossible de prouver le consentement a posteriori.
--
-- Après :
--   1. email_marketing DEFAULT false (opt-in obligatoire et explicite).
--   2. profiles.terms_accepted_at + profiles.terms_version pour journaliser
--      l'acceptation des CGV (preuve RGPD).
--   3. handle_new_user() lit raw_user_meta_data passé au signUp pour :
--        - propager first_name, terms_accepted_at, terms_version sur profiles ;
--        - écrire la préférence newsletter sur notification_preferences ;
--        - si opt-in, créer/réactiver la ligne newsletter_subscribers
--          (source = 'registration').
-- ============================================================================

-- 1) Default RGPD-friendly sur email_marketing
ALTER TABLE public.notification_preferences
  ALTER COLUMN email_marketing SET DEFAULT false;

-- 2) Colonnes de traçabilité du consentement CGV
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version     TEXT;

COMMENT ON COLUMN public.profiles.terms_accepted_at IS
  'Date/heure d''acceptation des CGV par l''utilisateur. NULL pour les comptes pré-migration ou créés via OAuth sans gate explicite.';
COMMENT ON COLUMN public.profiles.terms_version IS
  'Version des CGV acceptée (ex: 2026-05-07). À mettre à jour quand les CGV changent pour forcer un re-consentement.';

-- 3) Trigger handle_new_user — lit les metadata du signup et propage
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first_name        TEXT;
  v_newsletter        BOOLEAN;
  v_terms_version     TEXT;
  v_terms_accepted_at TIMESTAMPTZ;
BEGIN
  v_first_name    := NULLIF(NEW.raw_user_meta_data ->> 'first_name', '');
  v_newsletter    := COALESCE(
                       (NEW.raw_user_meta_data ->> 'newsletter')::boolean,
                       false
                     );
  v_terms_version := NULLIF(NEW.raw_user_meta_data ->> 'terms_version', '');

  -- Si une version est fournie, on horodate ; sinon on laisse NULL.
  v_terms_accepted_at := CASE
    WHEN NEW.raw_user_meta_data ? 'terms_accepted_at'
      THEN (NEW.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz
    WHEN v_terms_version IS NOT NULL
      THEN now()
    ELSE NULL
  END;

  INSERT INTO public.profiles (
    id, email, first_name, role, terms_accepted_at, terms_version
  )
  VALUES (
    NEW.id, NEW.email, v_first_name, 'customer',
    v_terms_accepted_at, v_terms_version
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id, email_marketing)
  VALUES (NEW.id, v_newsletter)
  ON CONFLICT (user_id) DO NOTHING;

  -- Newsletter : si opt-in, créer ou réactiver l'abonné.
  -- Index unique : uniq_newsletter_subscribers_email_lower → ON CONFLICT
  -- doit cibler l'expression lower(email).
  IF v_newsletter AND NEW.email IS NOT NULL THEN
    INSERT INTO public.newsletter_subscribers (
      email, source, subscribed_at, unsubscribed_at, unsubscribe_reason
    )
    VALUES (
      NEW.email, 'registration', now(), NULL, NULL
    )
    ON CONFLICT (lower(email)) DO UPDATE SET
      subscribed_at      = EXCLUDED.subscribed_at,
      unsubscribed_at    = NULL,
      unsubscribe_reason = NULL,
      source             = COALESCE(
                             public.newsletter_subscribers.source,
                             EXCLUDED.source
                           );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Le trigger lui-même est déjà créé en 001/004 ; on ne le redéclare pas.

-- 4) Sanity checks (commentés — décommenter dans le SQL editor pour vérifier)
-- ----------------------------------------------------------------------------
-- SELECT email_marketing, count(*) FROM public.notification_preferences GROUP BY 1;
-- SELECT count(*) FROM public.profiles WHERE terms_accepted_at IS NULL;
