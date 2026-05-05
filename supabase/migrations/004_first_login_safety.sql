-- ============================================================================
-- ISHYA — Migration 004 — Robustesse de la première connexion
--
-- Objectif : garantir que tout compte (auth.users) ait toujours, dès sa
-- création, les lignes nécessaires pour une expérience fonctionnelle :
--   - public.profiles (id, email, role='customer')
--   - public.notification_preferences (valeurs par défaut)
--
-- Sans cette migration, un utilisateur peut se retrouver sans `profiles`
-- (cas observé en prod) et le proxy le renvoie vers /compte au lieu de
-- son tableau de bord, voire bloque l'accès admin pour les staff.
-- ============================================================================

-- 1. TRIGGER SUR auth.users — recréation idempotente
-- ----------------------------------------------------------------------------
-- Le ON CONFLICT DO NOTHING permet de ne jamais lever d'erreur si la ligne
-- existe déjà (ex : retry, double trigger, backfill manuel préalable).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Le trigger lui-même est déjà créé en 001, mais on le recrée par sécurité
-- au cas où il aurait été supprimé manuellement.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. BACKFILL — profils manquants pour les comptes existants
-- ----------------------------------------------------------------------------
-- Crée un profil 'customer' pour chaque auth.user orphelin.
-- N'écrase JAMAIS un profil existant (ON CONFLICT DO NOTHING).

INSERT INTO public.profiles (id, email, role)
SELECT u.id, u.email, 'customer'
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
 WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Resynchronise l'email côté profile pour les comptes où l'email a changé
-- dans auth.users après la création du profil (changement de mail).
UPDATE public.profiles p
   SET email = u.email
  FROM auth.users u
 WHERE p.id = u.id
   AND p.email IS DISTINCT FROM u.email;

-- 3. BACKFILL — préférences de notification manquantes
-- ----------------------------------------------------------------------------

INSERT INTO public.notification_preferences (user_id)
SELECT u.id
  FROM auth.users u
  LEFT JOIN public.notification_preferences np ON np.user_id = u.id
 WHERE np.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 4. SANITY CHECKS (commentés — décommenter en SQL editor pour vérifier)
-- ----------------------------------------------------------------------------
-- SELECT count(*) AS auth_users FROM auth.users;
-- SELECT count(*) AS profiles FROM public.profiles;
-- SELECT count(*) AS prefs FROM public.notification_preferences;
-- Les trois counts doivent désormais être identiques.
