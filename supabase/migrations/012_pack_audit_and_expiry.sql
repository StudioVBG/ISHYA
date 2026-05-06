-- =============================================================================
-- Migration 012 : Audit log + cron expiration sur les packs
-- =============================================================================
-- Objectifs :
--   1. Trigger d'audit générique (réutilisable) pour tracer INSERT/UPDATE/DELETE
--      dans audit_logs avec user_id (= auth.uid()), old_data, new_data.
--   2. Attacher le trigger à `packs` et `pack_items` — ces objets impactent
--      directement les promotions affichées en boutique, leur historique de
--      modification doit être traçable.
--   3. Activer pg_cron + créer un job quotidien qui passe is_active = false
--      sur les packs dont la fenêtre `ends_at` est dépassée. Évite que
--      l'admin oublie de désactiver manuellement un pack saisonnier.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Fonction d'audit générique
-- ---------------------------------------------------------------------------
-- Conçue pour être attachée à n'importe quelle table publique. Convertit la
-- ligne en JSONB (compatible avec audit_logs.old_data / new_data) et écrit une
-- entrée. Si auth.uid() est null (mutation non authentifiée / service role
-- direct), user_id reste null — c'est volontaire pour distinguer les deux
-- origines.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_audit_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id   UUID := auth.uid();
  v_record_id UUID;
  v_old       JSONB;
  v_new       JSONB;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    v_record_id := (NEW.id)::UUID;
    v_new := to_jsonb(NEW);
    v_old := NULL;
  ELSIF (TG_OP = 'UPDATE') THEN
    v_record_id := (NEW.id)::UUID;
    v_new := to_jsonb(NEW);
    v_old := to_jsonb(OLD);
    -- Skip silencieusement si rien n'a vraiment changé
    IF v_old = v_new THEN
      RETURN NEW;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    v_record_id := (OLD.id)::UUID;
    v_new := NULL;
    v_old := to_jsonb(OLD);
  END IF;

  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, old_data, new_data
  ) VALUES (
    v_user_id, lower(TG_OP), TG_TABLE_NAME, v_record_id, v_old, v_new
  );

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_audit_changes() IS
  'Trigger générique : écrit INSERT/UPDATE/DELETE dans audit_logs. Réutilisable sur toute table avec colonne id UUID.';

-- ---------------------------------------------------------------------------
-- 2. Attacher à packs + pack_items
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_audit_packs ON public.packs;
CREATE TRIGGER trg_audit_packs
  AFTER INSERT OR UPDATE OR DELETE ON public.packs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

DROP TRIGGER IF EXISTS trg_audit_pack_items ON public.pack_items;
CREATE TRIGGER trg_audit_pack_items
  AFTER INSERT OR UPDATE OR DELETE ON public.pack_items
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

-- ---------------------------------------------------------------------------
-- 3. pg_cron : désactivation auto des packs expirés
-- ---------------------------------------------------------------------------
-- pg_cron ne peut être créé que par un superuser, et l'extension réside dans
-- le schéma `extensions` sur Supabase. CREATE EXTENSION IF NOT EXISTS est
-- idempotent.
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.expire_inactive_packs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.packs
     SET is_active = false
   WHERE is_active = true
     AND ends_at IS NOT NULL
     AND ends_at < now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.expire_inactive_packs() IS
  'Bascule is_active=false sur les packs dont ends_at est dépassé. Retourne le nombre de packs basculés.';

-- Programme : tous les jours à 02:15 UTC (créneau creux storefront).
-- On unschedule d'abord (idempotence) au cas où la migration est rejouée.
DO $$
DECLARE
  v_jobid bigint;
BEGIN
  SELECT jobid INTO v_jobid
    FROM cron.job
   WHERE jobname = 'expire-inactive-packs';
  IF v_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(v_jobid);
  END IF;

  PERFORM cron.schedule(
    'expire-inactive-packs',
    '15 2 * * *',
    $cron$ SELECT public.expire_inactive_packs(); $cron$
  );
END
$$;
