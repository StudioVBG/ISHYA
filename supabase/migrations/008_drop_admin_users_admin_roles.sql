-- =============================================================================
-- Migration 007 : Suppression admin_users / admin_roles (KISS — Sprint 5)
-- =============================================================================
-- Décision documentée dans .claude/skills/admin-guide/AUDIT.md (§4.2) :
-- ces deux tables n'ont jamais été branchées au code. Le contrôle d'accès se
-- fait exclusivement via profiles.role (= 'admin'), tel que vérifié dans :
--   • src/lib/supabase/middleware.ts (redirect si role != admin)
--   • src/app/admin/layout.tsx       (revérif role admin)
--   • src/lib/auth/require-admin.ts  (chaque server action)
--
-- On retire donc le mort pour éviter la confusion (« faut-il insérer dans
-- admin_users à chaque promotion ? »). Si on a besoin un jour d'un système
-- de permissions granulaires, on en repartira d'une nouvelle migration.
--
-- Aucune donnée applicative n'est perdue : les tables n'ont jamais été
-- alimentées par le code, seules d'éventuelles lignes manuelles sont
-- supprimées.
-- =============================================================================

DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.admin_roles CASCADE;
