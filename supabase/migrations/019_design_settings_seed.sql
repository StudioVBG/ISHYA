-- =============================================================================
-- 019_design_settings_seed.sql
-- Seed (idempotent) des clés de configuration "Design" utilisées par
-- /admin/design pour personnaliser le fond du hero de la page d'accueil.
-- Les valeurs sont stockées en JSONB dans la table générique `settings`.
-- =============================================================================

INSERT INTO public.settings (key, description, value)
VALUES
  (
    'design.home_hero_background_url',
    'URL de l''image de fond plein écran du hero de la page d''accueil (gérée depuis /admin/design).',
    '""'::jsonb
  ),
  (
    'design.home_hero_overlay_opacity',
    'Intensité (0-100) du voile sombre par-dessus l''image de fond du hero. 40 = défaut.',
    '40'::jsonb
  )
ON CONFLICT (key) DO NOTHING;
