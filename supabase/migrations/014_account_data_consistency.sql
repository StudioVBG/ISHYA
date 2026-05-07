-- ============================================================================
-- ISHYA — Migration 014 — Cohérence des données compte (fixes 4-8 de l'audit)
--
-- Problèmes corrigés :
--   4. profiles.last_login_at jamais alimenté → l'admin affichait toujours
--      "Date inconnue".
--   6. profiles.loyalty_tier jamais recalculé : un client accumulait des
--      points sans jamais sortir de bronze.
--   7. OAuth (Google/Apple) ne récupérait pas le prénom ni l'avatar du
--      provider, alors que ces données arrivent dans raw_user_meta_data.
--   8. profiles.email se désynchronisait de auth.users.email à chaque
--      changement d'email côté Supabase Auth.
--
-- Approche : déclencheurs SQL côté DB pour ne pas dépendre du code applicatif
-- (un cron Vercel qui tombe ou une route oubliée ne casse plus la cohérence).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 4. last_login_at  ← auth.users.last_sign_in_at
-- ----------------------------------------------------------------------------
-- Supabase met à jour auth.users.last_sign_in_at à chaque sign-in (password
-- ou OAuth). On le miroir dans public.profiles.last_login_at pour qu'il soit
-- exploitable depuis l'admin sans avoir à requêter le schéma auth.

CREATE OR REPLACE FUNCTION public.sync_last_login_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at
     AND NEW.last_sign_in_at IS NOT NULL THEN
    UPDATE public.profiles
       SET last_login_at = NEW.last_sign_in_at
     WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_signed_in ON auth.users;
CREATE TRIGGER on_auth_user_signed_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_last_login_at();

-- Backfill une fois pour les comptes existants
UPDATE public.profiles p
   SET last_login_at = u.last_sign_in_at
  FROM auth.users u
 WHERE p.id = u.id
   AND u.last_sign_in_at IS NOT NULL
   AND (p.last_login_at IS NULL OR p.last_login_at <> u.last_sign_in_at);


-- ----------------------------------------------------------------------------
-- 6. Recalcul automatique de loyalty_tier
-- ----------------------------------------------------------------------------
-- Quand loyalty_points change, on lit loyalty_tiers (seeded en 001 :
-- bronze 0 / silver 200 / gold 500 / platinum 1000) et on positionne le
-- bon tier. BEFORE UPDATE pour éviter une seconde UPDATE.

CREATE OR REPLACE FUNCTION public.recalculate_loyalty_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier public.loyalty_tier_name;
BEGIN
  SELECT lt.name INTO v_tier
    FROM public.loyalty_tiers lt
   WHERE lt.min_points <= COALESCE(NEW.loyalty_points, 0)
   ORDER BY lt.min_points DESC
   LIMIT 1;

  IF v_tier IS NOT NULL THEN
    NEW.loyalty_tier := v_tier;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalculate_loyalty_tier ON public.profiles;
CREATE TRIGGER trg_recalculate_loyalty_tier
  BEFORE UPDATE OF loyalty_points ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_loyalty_tier();

-- Resynchronise les profils existants (au cas où des points auraient été
-- accumulés sans recalcul).
UPDATE public.profiles p
   SET loyalty_tier = (
     SELECT lt.name
       FROM public.loyalty_tiers lt
      WHERE lt.min_points <= COALESCE(p.loyalty_points, 0)
      ORDER BY lt.min_points DESC
      LIMIT 1
   )
 WHERE p.loyalty_tier IS DISTINCT FROM (
     SELECT lt.name
       FROM public.loyalty_tiers lt
      WHERE lt.min_points <= COALESCE(p.loyalty_points, 0)
      ORDER BY lt.min_points DESC
      LIMIT 1
   );


-- ----------------------------------------------------------------------------
-- 7. OAuth — extraire first_name / last_name / avatar_url du provider
-- ----------------------------------------------------------------------------
-- Google envoie : given_name, family_name, name, picture, email_verified.
-- Apple envoie : name (parfois), email.
-- L'inscription email/password met first_name explicitement → on garde la
-- priorité à cette valeur si présente.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_name        TEXT;
  v_last_name         TEXT;
  v_avatar_url        TEXT;
  v_newsletter        BOOLEAN;
  v_terms_version     TEXT;
  v_terms_accepted_at TIMESTAMPTZ;
BEGIN
  -- Prénom : champ explicite du formulaire > given_name (Google) > 1er mot
  -- de "name" (Apple/Google fallback).
  v_first_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'first_name',  ''),
    NULLIF(NEW.raw_user_meta_data ->> 'given_name',  ''),
    NULLIF(split_part(
      COALESCE(NEW.raw_user_meta_data ->> 'name',
               NEW.raw_user_meta_data ->> 'full_name', ''),
      ' ', 1
    ), '')
  );

  v_last_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'last_name',   ''),
    NULLIF(NEW.raw_user_meta_data ->> 'family_name', ''),
    NULLIF(NULLIF(
      regexp_replace(
        COALESCE(NEW.raw_user_meta_data ->> 'name',
                 NEW.raw_user_meta_data ->> 'full_name', ''),
        '^\S+\s*', ''
      ), ''
    ), '')
  );

  v_avatar_url := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'picture',    '')
  );

  v_newsletter := COALESCE(
    (NEW.raw_user_meta_data ->> 'newsletter')::boolean,
    false
  );
  v_terms_version := NULLIF(NEW.raw_user_meta_data ->> 'terms_version', '');

  v_terms_accepted_at := CASE
    WHEN NEW.raw_user_meta_data ? 'terms_accepted_at'
      THEN (NEW.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz
    WHEN v_terms_version IS NOT NULL
      THEN now()
    ELSE NULL
  END;

  INSERT INTO public.profiles (
    id, email, first_name, last_name, avatar_url, role,
    terms_accepted_at, terms_version
  )
  VALUES (
    NEW.id, NEW.email, v_first_name, v_last_name, v_avatar_url, 'customer',
    v_terms_accepted_at, v_terms_version
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id, email_marketing)
  VALUES (NEW.id, v_newsletter)
  ON CONFLICT (user_id) DO NOTHING;

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
$$;


-- ----------------------------------------------------------------------------
-- 8. Resync profiles.email ← auth.users.email
-- ----------------------------------------------------------------------------
-- Quand l'utilisateur change son email via Supabase Auth, profiles.email
-- restait à l'ancienne valeur. L'admin lit profiles.email → désync visible.

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
       SET email = NEW.email
     WHERE id = NEW.id;

    -- Si l'utilisateur était abonné à la newsletter sous l'ancien email,
    -- on garde la cohérence en mettant à jour la table subscribers aussi.
    UPDATE public.newsletter_subscribers
       SET email = NEW.email
     WHERE NEW.email IS NOT NULL
       AND lower(email) = lower(OLD.email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();


-- ----------------------------------------------------------------------------
-- Sanity checks (commentés)
-- ----------------------------------------------------------------------------
-- SELECT trigger_name, event_object_schema, event_object_table
--   FROM information_schema.triggers
--  WHERE event_object_table IN ('users','profiles')
--    AND trigger_schema IN ('auth','public')
--  ORDER BY event_object_table, trigger_name;
--
-- Doit lister :
--   on_auth_user_created       (auth.users)   AFTER INSERT
--   on_auth_user_email_changed (auth.users)   AFTER UPDATE
--   on_auth_user_signed_in     (auth.users)   AFTER UPDATE
--   trg_profiles_updated_at    (public.profiles)
--   trg_recalculate_loyalty_tier (public.profiles)
