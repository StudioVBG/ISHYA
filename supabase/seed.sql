-- ============================================================================
-- ISHYA — Bijoux floraux en fleurs séchées et résine
-- Seed data pour la boutique e-commerce
-- ============================================================================

DO $$
DECLARE
  -- ── Catégories parentes ──
  cat_colliers       uuid;
  cat_bagues         uuid;
  cat_bracelets      uuid;
  cat_bo             uuid;
  cat_accessoires    uuid;
  cat_packs          uuid;

  -- ── Sous-catégories Colliers ──
  sub_ras_de_cou     uuid;
  sub_sautoirs       uuid;
  sub_pendentifs     uuid;
  sub_chaines_col    uuid;
  sub_multi_rangs    uuid;

  -- ── Sous-catégories Bagues ──
  sub_simples        uuid;
  sub_avec_pierre    uuid;
  sub_reglables      uuid;
  sub_chevalieres    uuid;

  -- ── Sous-catégories Bracelets ──
  sub_joncs          uuid;
  sub_chaines_bra    uuid;
  sub_manchettes     uuid;
  sub_cheville       uuid;
  sub_charm          uuid;

  -- ── Sous-catégories Boucles d'oreilles ──
  sub_puces          uuid;
  sub_creoles        uuid;
  sub_pendantes      uuid;
  sub_clips          uuid;

  -- ── Sous-catégories Accessoires ──
  sub_peignes        uuid;
  sub_broches        uuid;
  sub_pinces         uuid;
  sub_porte_cles     uuid;

  -- ── Sous-catégories Packs & Parures ──
  sub_parures        uuid;
  sub_duos           uuid;
  sub_coffrets       uuid;

  -- ── Collections ──
  col_printemps      uuid;
  col_boheme         uuid;
  col_minimaliste    uuid;
  col_mariage        uuid;
  col_noel           uuid;

  -- ── Produits ──
  prod_petale_rose      uuid;
  prod_hortensia        uuid;
  prod_pendentif_gypso  uuid;
  prod_bouton_or        uuid;
  prod_cerisier         uuid;
  prod_chevaliere_foug  uuid;
  prod_jonc_lavande     uuid;
  prod_chaine_marg      uuid;
  prod_manchette_piv    uuid;
  prod_puces_myosotis   uuid;
  prod_creoles_jasmin   uuid;
  prod_pendantes_orch   uuid;
  prod_peigne_gypso     uuid;
  prod_broche_camelia   uuid;
  prod_pince_hort       uuid;
  prod_parure_gypso     uuid;
  prod_duo_rose         uuid;
  prod_coffret_decouv   uuid;
  prod_muguet           uuid;
  prod_cosmos           uuid;

  -- ── Shipping ──
  zone_france        uuid;
  zone_domtom        uuid;
  zone_europe        uuid;

BEGIN

-- ════════════════════════════════════════════════════════════════════════════
-- 1. CATÉGORIES
-- ════════════════════════════════════════════════════════════════════════════

-- Catégories parentes
INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), NULL, 'Colliers', 'colliers', 'Colliers artisanaux en fleurs séchées et résine, pièces uniques façonnées à la main.', '/images/categories/colliers.jpg', 1, true)
RETURNING id INTO cat_colliers;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), NULL, 'Bagues', 'bagues', 'Bagues florales en résine ornées de véritables pétales séchés.', '/images/categories/bagues.jpg', 2, true)
RETURNING id INTO cat_bagues;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), NULL, 'Bracelets', 'bracelets', 'Bracelets délicats mêlant métal doré et fleurs naturelles préservées.', '/images/categories/bracelets.jpg', 3, true)
RETURNING id INTO cat_bracelets;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), NULL, 'Boucles d''oreilles', 'boucles-d-oreilles', 'Boucles d''oreilles fleuries, de la puce discrète aux pendantes statement.', '/images/categories/boucles-oreilles.jpg', 4, true)
RETURNING id INTO cat_bo;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), NULL, 'Accessoires', 'accessoires', 'Accessoires floraux pour sublimer votre coiffure et votre style au quotidien.', '/images/categories/accessoires.jpg', 5, true)
RETURNING id INTO cat_accessoires;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), NULL, 'Packs & Parures', 'packs-parures', 'Ensembles coordonnés et coffrets cadeaux pour offrir ou se faire plaisir.', '/images/categories/packs-parures.jpg', 6, true)
RETURNING id INTO cat_packs;

-- Sous-catégories Colliers
INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_colliers, 'Ras-de-cou', 'ras-de-cou', 'Colliers ras-de-cou ajustés, portés près du cou pour un effet moderne.', '/images/categories/ras-de-cou.jpg', 1, true)
RETURNING id INTO sub_ras_de_cou;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_colliers, 'Sautoirs', 'sautoirs', 'Sautoirs longs et élégants à porter en solo ou superposés.', '/images/categories/sautoirs.jpg', 2, true)
RETURNING id INTO sub_sautoirs;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_colliers, 'Pendentifs', 'pendentifs', 'Pendentifs floraux en résine, chacun renfermant un petit jardin secret.', '/images/categories/pendentifs.jpg', 3, true)
RETURNING id INTO sub_pendentifs;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_colliers, 'Chaînes', 'chaines-colliers', 'Chaînes fines et raffinées en acier inoxydable doré.', '/images/categories/chaines-colliers.jpg', 4, true)
RETURNING id INTO sub_chaines_col;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_colliers, 'Multi-rangs', 'multi-rangs', 'Colliers multi-rangs pour un style bohème et accumulé.', '/images/categories/multi-rangs.jpg', 5, true)
RETURNING id INTO sub_multi_rangs;

-- Sous-catégories Bagues
INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bagues, 'Simples', 'bagues-simples', 'Bagues simples et épurées, sublimées par une touche florale.', '/images/categories/bagues-simples.jpg', 1, true)
RETURNING id INTO sub_simples;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bagues, 'Avec pierre', 'bagues-avec-pierre', 'Bagues associant fleurs séchées et pierres semi-précieuses.', '/images/categories/bagues-pierre.jpg', 2, true)
RETURNING id INTO sub_avec_pierre;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bagues, 'Réglables', 'bagues-reglables', 'Bagues réglables s''adaptant à tous les doigts, idéales pour offrir.', '/images/categories/bagues-reglables.jpg', 3, true)
RETURNING id INTO sub_reglables;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bagues, 'Chevalières', 'chevalieres', 'Chevalières végétales au design audacieux et contemporain.', '/images/categories/chevalieres.jpg', 4, true)
RETURNING id INTO sub_chevalieres;

-- Sous-catégories Bracelets
INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bracelets, 'Joncs', 'joncs', 'Joncs rigides ornés de fleurs préservées en résine cristalline.', '/images/categories/joncs.jpg', 1, true)
RETURNING id INTO sub_joncs;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bracelets, 'Chaînes', 'chaines-bracelets', 'Bracelets chaîne fins avec médaillon floral.', '/images/categories/chaines-bracelets.jpg', 2, true)
RETURNING id INTO sub_chaines_bra;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bracelets, 'Manchettes', 'manchettes', 'Manchettes larges sculptées, véritables œuvres d''art florales.', '/images/categories/manchettes.jpg', 3, true)
RETURNING id INTO sub_manchettes;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bracelets, 'Cheville', 'bracelets-cheville', 'Bracelets de cheville bohèmes pour les beaux jours.', '/images/categories/bracelets-cheville.jpg', 4, true)
RETURNING id INTO sub_cheville;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bracelets, 'Charm', 'bracelets-charm', 'Bracelets à charms personnalisables avec des breloques florales.', '/images/categories/bracelets-charm.jpg', 5, true)
RETURNING id INTO sub_charm;

-- Sous-catégories Boucles d'oreilles
INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bo, 'Puces & Clous', 'puces-clous', 'Puces et clous d''oreilles discrets, parfaits pour le quotidien.', '/images/categories/puces-clous.jpg', 1, true)
RETURNING id INTO sub_puces;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bo, 'Créoles', 'creoles', 'Créoles ornées de fleurs séchées pour un style bohème chic.', '/images/categories/creoles.jpg', 2, true)
RETURNING id INTO sub_creoles;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bo, 'Pendantes', 'pendantes', 'Boucles pendantes élégantes qui capturent la lumière et le regard.', '/images/categories/pendantes.jpg', 3, true)
RETURNING id INTO sub_pendantes;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_bo, 'Clips', 'clips', 'Boucles à clips, sans perçage, pour toutes les oreilles.', '/images/categories/clips.jpg', 4, true)
RETURNING id INTO sub_clips;

-- Sous-catégories Accessoires
INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_accessoires, 'Peignes', 'peignes', 'Peignes floraux pour coiffures de mariage et occasions spéciales.', '/images/categories/peignes.jpg', 1, true)
RETURNING id INTO sub_peignes;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_accessoires, 'Broches', 'broches', 'Broches artisanales pour habiller un blazer ou un col de chemise.', '/images/categories/broches.jpg', 2, true)
RETURNING id INTO sub_broches;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_accessoires, 'Pinces cheveux', 'pinces-cheveux', 'Pinces à cheveux ornées de compositions florales en résine.', '/images/categories/pinces-cheveux.jpg', 3, true)
RETURNING id INTO sub_pinces;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_accessoires, 'Porte-clés', 'porte-cles', 'Porte-clés fleuris, petite attention parfaite à offrir.', '/images/categories/porte-cles.jpg', 4, true)
RETURNING id INTO sub_porte_cles;

-- Sous-catégories Packs & Parures
INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_packs, 'Parures complètes', 'parures-completes', 'Parures assorties collier + boucles d''oreilles + bracelet.', '/images/categories/parures-completes.jpg', 1, true)
RETURNING id INTO sub_parures;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_packs, 'Duos', 'duos', 'Duos de bijoux coordonnés à prix doux.', '/images/categories/duos.jpg', 2, true)
RETURNING id INTO sub_duos;

INSERT INTO categories (id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES (gen_random_uuid(), cat_packs, 'Coffrets cadeaux', 'coffrets-cadeaux', 'Coffrets cadeaux prêts à offrir dans un écrin ISHYA.', '/images/categories/coffrets-cadeaux.jpg', 3, true)
RETURNING id INTO sub_coffrets;

-- Sous-catégories : on ne dispose pas d'images dédiées dans /public/images/categories,
-- on nullifie les image_url pour laisser le placeholder du composant prendre le relais.
UPDATE public.categories SET image_url = NULL WHERE parent_id IS NOT NULL;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. COLLECTIONS
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO collections (id, name, slug, description, image_url, is_active, starts_at, ends_at)
VALUES (gen_random_uuid(), 'Printemps Éternel', 'printemps-eternel',
  'Célébrez la beauté intemporelle du printemps avec des pièces lumineuses aux tons pastels, mêlant gypsophile, rose et hortensia.',
  '/images/collections/printemps-eternel.jpg', true, '2026-03-01T00:00:00Z', NULL)
RETURNING id INTO col_printemps;

INSERT INTO collections (id, name, slug, description, image_url, is_active, starts_at, ends_at)
VALUES (gen_random_uuid(), 'Bohème Florale', 'boheme-florale',
  'L''esprit libre et romantique d''une prairie sauvage capturé dans des bijoux aux tons terracotta et ivoire.',
  '/images/collections/boheme-florale.jpg', true, '2026-01-15T00:00:00Z', NULL)
RETURNING id INTO col_boheme;

INSERT INTO collections (id, name, slug, description, image_url, is_active, starts_at, ends_at)
VALUES (gen_random_uuid(), 'Minimaliste Pétale', 'minimaliste-petale',
  'La délicatesse d''un seul pétale sublimé. Des lignes pures et épurées pour un style discret et raffiné.',
  '/images/collections/minimaliste-petale.jpg', true, '2026-02-01T00:00:00Z', NULL)
RETURNING id INTO col_minimaliste;

INSERT INTO collections (id, name, slug, description, image_url, is_active, starts_at, ends_at)
VALUES (gen_random_uuid(), 'Mariage & Cérémonie', 'mariage-ceremonie',
  'Des parures d''exception pour le plus beau jour de votre vie. Peignes, boucles et colliers assortis pour la mariée et ses demoiselles d''honneur.',
  '/images/collections/mariage-ceremonie.jpg', true, '2026-01-01T00:00:00Z', NULL)
RETURNING id INTO col_mariage;

INSERT INTO collections (id, name, slug, description, image_url, is_active, starts_at, ends_at)
VALUES (gen_random_uuid(), 'Capsule Noël', 'capsule-noel',
  'Une collection éphémère aux teintes givrées et dorées, pensée pour les fêtes. Édition limitée.',
  '/images/collections/capsule-noel.jpg', true, '2026-11-01T00:00:00Z', '2027-01-15T00:00:00Z')
RETURNING id INTO col_noel;

-- ════════════════════════════════════════════════════════════════════════════
-- 3. PRODUITS
-- Schema: id, category_id, collection_id, name, slug, description,
--         short_description, base_price, compare_at_price, sku, material,
--         weight_g, dimensions, care_instructions, is_nickel_free,
--         is_active, is_featured, seo_title, seo_description
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Collier Pétale de Rose
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Collier Pétale de Rose',
  'collier-petale-de-rose',
  'Un véritable pétale de rose préservé dans un écrin de résine, suspendu à une chaîne dorée.',
  'Ce collier capture l''essence d''une rose éternelle. Chaque pétale est soigneusement sélectionné, séché puis enrobé de résine transparente pour en préserver la couleur et la délicatesse. Monté sur une chaîne en acier inoxydable plaqué or, il accompagne aussi bien vos tenues du quotidien que vos soirées les plus élégantes.',
  45.00, 55.00, 'COL-PTR', true, true, sub_pendentifs,
  col_printemps,
  'Acier inoxydable plaqué or 18k, résine, pétale de rose naturel',
  8, '2.5 × 1.5 cm (pendentif)',
  'Évitez le contact avec l''eau, les parfums et les produits chimiques. Rangez dans la pochette ISHYA fournie.',
  true, 'Collier Pétale de Rose | ISHYA', 'Collier artisanal avec véritable pétale de rose préservé en résine. Bijou floral unique fait main.')
RETURNING id INTO prod_petale_rose;

-- 2. Sautoir Fleur d'Hortensia
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Sautoir Fleur d''Hortensia',
  'sautoir-fleur-d-hortensia',
  'Un sautoir long et romantique orné d''une fleur d''hortensia séchée enfermée dans une goutte de résine.',
  'Ce sautoir fait la part belle à l''hortensia, symbole de gratitude et d''émotions sincères. La fleur, cueillie à maturité puis séchée naturellement, est encapsulée dans une résine cristalline en forme de goutte. Le sautoir se porte long sur un pull ou une robe, pour une silhouette bohème et aérienne.',
  52.00, NULL, 'COL-FLH', true, true, sub_sautoirs,
  col_boheme,
  'Acier inoxydable plaqué or 18k, résine, fleur d''hortensia naturelle',
  12, '3 × 2 cm (pendentif)',
  'Évitez le contact avec l''eau, les parfums et les produits chimiques. Rangez dans la pochette ISHYA fournie.',
  true, 'Sautoir Fleur d''Hortensia | ISHYA', 'Sautoir artisanal avec fleur d''hortensia préservée en résine. Bijou bohème fait main.')
RETURNING id INTO prod_hortensia;

-- 3. Pendentif Gypsophile
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Pendentif Gypsophile',
  'pendentif-gypsophile',
  'Brins de gypsophile aérien capturés dans un médaillon rond en résine transparente.',
  'Le gypsophile, fleur de la pureté et de l''innocence, est délicatement emprisonné dans un disque de résine limpide. Ce pendentif minimaliste se glisse sur toutes vos chaînes préférées. Chaque pièce est unique : la disposition naturelle des brins varie d''un bijou à l''autre.',
  35.00, NULL, 'COL-GYP', true, false, sub_pendentifs,
  col_minimaliste,
  'Acier inoxydable plaqué or 18k, résine, gypsophile naturel',
  6, '1.8 cm (diamètre)',
  'Évitez le contact avec l''eau, les parfums et les produits chimiques. Rangez dans la pochette ISHYA fournie.',
  true, 'Pendentif Gypsophile | ISHYA', 'Pendentif en résine avec brins de gypsophile naturel. Bijou minimaliste fait main.')
RETURNING id INTO prod_pendentif_gypso;

-- 4. Bague Bouton d'Or
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Bague Bouton d''Or',
  'bague-bouton-d-or',
  'Une petite fleur de bouton d''or préservée sous un cabochon de résine, montée sur un anneau doré.',
  'Retrouvez la magie des champs d''été avec cette bague ornée d''un véritable bouton d''or. La fleur jaune vif contraste joliment avec le métal doré de l''anneau. Réglable, cette bague s''adapte à la plupart des tailles et convient aussi bien pour un look champêtre que pour apporter une touche de couleur à une tenue sobre.',
  28.00, NULL, 'BAG-BDO', true, false, sub_reglables,
  col_printemps,
  'Acier inoxydable plaqué or 18k, résine, bouton d''or naturel',
  5, '1.2 cm (cabochon)',
  'Retirez avant de vous laver les mains. Évitez les chocs directs sur le cabochon.',
  true, 'Bague Bouton d''Or | ISHYA', 'Bague réglable avec bouton d''or naturel préservé en résine. Bijou floral artisanal.')
RETURNING id INTO prod_bouton_or;

-- 5. Bague Fleur de Cerisier
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Bague Fleur de Cerisier',
  'bague-fleur-de-cerisier',
  'Pétales de cerisier rose pâle emprisonnés dans un anneau de résine, symbole de renouveau.',
  'Inspirée par les sakura japonais, cette bague enferme de véritables pétales de cerisier dans un anneau de résine cristalline. Les nuances roses et blanches du cerisier évoquent la douceur du printemps et la beauté éphémère de la nature. Un bijou poétique qui transforme chaque main en petit jardin.',
  32.00, 40.00, 'BAG-FDC', true, true, sub_simples,
  col_printemps,
  'Résine bio-sourcée, pétales de cerisier naturels',
  4, '0.8 cm (largeur anneau)',
  'Retirez avant de vous laver les mains. Évitez l''exposition prolongée au soleil.',
  true, 'Bague Fleur de Cerisier | ISHYA', 'Bague en résine avec pétales de cerisier naturels. Bijou printanier unique fait main.')
RETURNING id INTO prod_cerisier;

-- 6. Chevalière Fougère
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Chevalière Fougère',
  'chevaliere-fougere',
  'Une feuille de fougère miniature capturée sous le plateau d''une chevalière en acier doré.',
  'Cette chevalière au design contemporain abrite une feuille de fougère séchée sous un plateau ovale de résine. La fougère, symbole de sincérité et de fascination, apporte une touche botanique et graphique. Son style mixte convient aussi bien aux femmes qu''aux hommes, pour un look nature et affirmé.',
  38.00, NULL, 'BAG-CHF', true, false, sub_chevalieres,
  col_boheme,
  'Acier inoxydable plaqué or 18k, résine, feuille de fougère naturelle',
  9, '1.6 × 1.2 cm (plateau)',
  'Retirez avant de vous laver les mains. Nettoyez avec un chiffon doux.',
  true, 'Chevalière Fougère | ISHYA', 'Chevalière avec feuille de fougère préservée en résine. Bijou botanique unisexe fait main.')
RETURNING id INTO prod_chevaliere_foug;

-- 7. Jonc Lavande
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Jonc Lavande',
  'jonc-lavande',
  'Un jonc rigide en acier doré serti d''un trio de brins de lavande préservés en résine.',
  'Portez la Provence à votre poignet avec ce jonc orné de véritables brins de lavande. Les fleurs violettes contrastent subtilement avec le métal doré, créant un bijou à la fois rustique et raffiné. Le jonc se porte seul pour un effet minimaliste ou empilé avec d''autres bracelets pour un style accumulé.',
  30.00, 38.00, 'BRA-JLV', true, true, sub_joncs,
  col_boheme,
  'Acier inoxydable plaqué or 18k, résine, lavande naturelle',
  15, '6.5 cm (diamètre intérieur)',
  'Évitez les chocs. Nettoyez avec un chiffon doux et sec. Ne pas plier.',
  true, 'Jonc Lavande | ISHYA', 'Jonc en acier doré avec brins de lavande naturelle préservés en résine. Bijou provençal fait main.')
RETURNING id INTO prod_jonc_lavande;

-- 8. Bracelet Chaîne Marguerite
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Bracelet Chaîne Marguerite',
  'bracelet-chaine-marguerite',
  'Une chaîne fine dorée ponctuée d''un petit médaillon rond renfermant une marguerite miniature.',
  'La marguerite, fleur de l''innocence et de la joie, est préservée dans un médaillon de résine de seulement 1 cm de diamètre. Suspendu à une chaîne maille forçat en acier plaqué or, ce bracelet apporte une touche champêtre et délicate à votre poignet. Fermoir mousqueton ajustable.',
  25.00, NULL, 'BRA-CHM', true, false, sub_chaines_bra,
  col_minimaliste,
  'Acier inoxydable plaqué or 18k, résine, marguerite naturelle',
  6, '1 cm (médaillon)',
  'Retirez avant la douche. Évitez le contact avec les crèmes et parfums.',
  true, 'Bracelet Chaîne Marguerite | ISHYA', 'Bracelet chaîne doré avec marguerite naturelle en résine. Bijou délicat fait main.')
RETURNING id INTO prod_chaine_marg;

-- 9. Manchette Pivoine
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Manchette Pivoine',
  'manchette-pivoine',
  'Large manchette dorée ornée d''un panneau de résine renfermant des pétales de pivoine rose.',
  'Pièce maîtresse de la collection Bohème Florale, cette manchette est un véritable bijou d''art. Un large panneau de résine transparente renferme des pétales de pivoine rose disposés en dégradé. Le bracelet manchette en acier doré s''ouvre par le dessous pour s''adapter à tous les poignets. Un statement piece qui ne passe pas inaperçu.',
  42.00, 52.00, 'BRA-MNP', true, true, sub_manchettes,
  col_boheme,
  'Acier inoxydable plaqué or 18k, résine, pétales de pivoine naturels',
  28, '4 × 3 cm (panneau résine)',
  'Manipulez avec soin. Évitez les chocs sur le panneau de résine. Rangez à plat.',
  true, 'Manchette Pivoine | ISHYA', 'Manchette en acier doré avec pétales de pivoine naturels en résine. Bijou statement fait main.')
RETURNING id INTO prod_manchette_piv;

-- 10. Puces Myosotis
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Puces Myosotis',
  'puces-myosotis',
  'Minuscules fleurs de myosotis bleu ciel emprisonnées dans des puces d''oreilles rondes en résine.',
  'Le myosotis, « ne m''oubliez pas », est la fleur du souvenir et de l''amour fidèle. Ces puces d''oreilles encapsulent chacune une fleur complète de myosotis dans un petit disque de résine monté sur un clou en acier chirurgical. Discrètes et romantiques, elles se portent au quotidien comme un talisman fleuri.',
  22.00, NULL, 'BO-PMY', true, false, sub_puces,
  col_minimaliste,
  'Acier chirurgical 316L plaqué or 18k, résine, myosotis naturel',
  2, '0.8 cm (diamètre)',
  'Nettoyez les tiges avec un antiseptique doux. Évitez l''eau et les parfums.',
  true, 'Puces Myosotis | ISHYA', 'Puces d''oreilles avec myosotis naturel préservé en résine. Bijou discret et romantique.')
RETURNING id INTO prod_puces_myosotis;

-- 11. Créoles Jasmin
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Créoles Jasmin',
  'creoles-jasmin',
  'Créoles dorées agrémentées de petites fleurs de jasmin séchées fixées en résine sur le devant.',
  'Ces créoles réinventent un classique du bijou en y ajoutant une touche florale inattendue. De petites fleurs de jasmin blanc sont encapsulées dans des éléments de résine sertis sur la partie inférieure des créoles. Le jasmin évoque les nuits d''été et les jardins méditerranéens. Un bijou qui parfume le regard.',
  35.00, NULL, 'BO-CRJ', true, true, sub_creoles,
  col_boheme,
  'Acier inoxydable plaqué or 18k, résine, jasmin naturel',
  7, '3 cm (diamètre créole)',
  'Évitez de dormir avec vos créoles. Nettoyez avec un chiffon doux.',
  true, 'Créoles Jasmin | ISHYA', 'Créoles dorées avec fleurs de jasmin naturel en résine. Bijou bohème chic fait main.')
RETURNING id INTO prod_creoles_jasmin;

-- 12. Pendantes Orchidée
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Pendantes Orchidée',
  'pendantes-orchidee',
  'Boucles pendantes en chaîne dorée terminées par un pétale d''orchidée rose capturé en résine.',
  'L''orchidée, fleur de la sophistication et du raffinement, se décline en boucles d''oreilles pendantes. Un pétale d''orchidée rose est encapsulé dans une forme ovale de résine, suspendue à une fine chaîne dorée. Ces boucles apportent une touche d''élégance florale à toutes vos tenues de soirée.',
  40.00, 48.00, 'BO-POR', true, true, sub_pendantes,
  col_printemps,
  'Acier inoxydable plaqué or 18k, résine, pétale d''orchidée naturel',
  5, '5 cm (longueur totale)',
  'Rangez suspendues ou à plat. Évitez les accrocs avec les vêtements.',
  true, 'Pendantes Orchidée | ISHYA', 'Boucles pendantes avec pétale d''orchidée naturel en résine. Bijou élégant fait main.')
RETURNING id INTO prod_pendantes_orch;

-- 13. Peigne Floral Gypsophile
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Peigne Floral Gypsophile',
  'peigne-floral-gypsophile',
  'Peigne de cheveux décoré d''une cascade de brins de gypsophile et de perles nacrées.',
  'Cet accessoire de coiffure est conçu pour sublimer les chignons et demi-queues. Des brins de gypsophile séchés sont entrelacés de fil doré et de perles d''eau douce, fixés sur un peigne en métal plaqué or. Idéal pour un mariage champêtre ou une soirée habillée, il apporte une touche de poésie à votre coiffure.',
  48.00, 58.00, 'ACC-PGY', true, true, sub_peignes,
  col_mariage,
  'Métal plaqué or 18k, gypsophile naturel, perles d''eau douce, fil doré',
  18, '10 × 5 cm',
  'Manipulez avec délicatesse. Rangez dans l''écrin fourni. Évitez la laque directement sur le bijou.',
  true, 'Peigne Floral Gypsophile | ISHYA', 'Peigne de mariage avec gypsophile naturel et perles. Accessoire de coiffure artisanal.')
RETURNING id INTO prod_peigne_gypso;

-- 14. Broche Camélia
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Broche Camélia',
  'broche-camelia',
  'Broche ronde en résine abritant un camélia séché aux teintes roses et blanches.',
  'Le camélia, symbole d''admiration et de perfection, est ici préservé dans un cabochon de résine monté sur une broche en acier doré. Cette petite pièce se pique sur un revers de veste, un foulard ou un béret pour un détail élégant et inattendu. Un bijou discret qui dit beaucoup.',
  20.00, NULL, 'ACC-BRC', true, false, sub_broches,
  col_minimaliste,
  'Acier inoxydable plaqué or 18k, résine, camélia naturel',
  8, '3 cm (diamètre)',
  'Vérifiez régulièrement la fermeture de la broche. Nettoyez avec un chiffon doux.',
  true, 'Broche Camélia | ISHYA', 'Broche avec camélia naturel préservé en résine. Accessoire artisanal élégant.')
RETURNING id INTO prod_broche_camelia;

-- 15. Pince Hortensia
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Pince Hortensia',
  'pince-hortensia',
  'Pince à cheveux dorée ornée d''une petite fleur d''hortensia séchée sous résine.',
  'Cette pince à cheveux allie praticité et poésie. Une fleur d''hortensia miniature est encapsulée dans un cabochon de résine fixé sur une pince crocodile dorée. Elle retient une mèche rebelle ou complète un chignon avec une touche florale. Existe en rose, bleu et mauve.',
  18.00, NULL, 'ACC-PHO', true, false, sub_pinces,
  col_boheme,
  'Métal plaqué or 18k, résine, hortensia naturel',
  6, '5 × 2 cm',
  'Évitez de tordre la pince. Nettoyez avec un chiffon humide sans frotter le cabochon.',
  true, 'Pince Hortensia | ISHYA', 'Pince à cheveux avec hortensia naturel en résine. Accessoire capillaire artisanal.')
RETURNING id INTO prod_pince_hort;

-- 16. Parure Complète Gypsophile
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Parure Complète Gypsophile',
  'parure-complete-gypsophile',
  'Ensemble assorti collier, boucles d''oreilles et bracelet, tous ornés de gypsophile préservé.',
  'Cette parure réunit trois pièces iconiques de la maison ISHYA, unies par la même fleur : le gypsophile. Le collier pendentif, les puces d''oreilles et le bracelet chaîne partagent le même langage visuel minimaliste et naturel. Présentée dans un coffret ISHYA, c''est le cadeau parfait pour une occasion spéciale.',
  95.00, 115.00, 'PAC-PCG', true, true, sub_parures,
  col_minimaliste,
  'Acier inoxydable plaqué or 18k, résine, gypsophile naturel',
  16, 'Collier 42 cm / Puces 0.8 cm / Bracelet 18 cm',
  'Chaque pièce doit être rangée séparément dans les compartiments du coffret.',
  true, 'Parure Complète Gypsophile | ISHYA', 'Parure 3 pièces avec gypsophile naturel en résine. Coffret cadeau artisanal.')
RETURNING id INTO prod_parure_gypso;

-- 17. Duo Romantique Rose
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Duo Romantique Rose',
  'duo-romantique-rose',
  'Collier et boucles d''oreilles assortis aux pétales de rose, dans un écrin cadeau.',
  'Ce duo coordonné associe le collier Pétale de Rose et les puces en résine rose, créant un ensemble harmonieux et féminin. Les deux pièces partagent les mêmes teintes rosées et le même esprit romantique. Présenté dans un écrin ISHYA avec ruban satin, c''est une idée cadeau idéale pour la Saint-Valentin ou un anniversaire.',
  65.00, 78.00, 'PAC-DRR', true, false, sub_duos,
  col_printemps,
  'Acier inoxydable plaqué or 18k, résine, pétales de rose naturels',
  10, 'Collier 42 cm / Puces 0.8 cm',
  'Rangez les deux pièces séparément. Suivez les consignes d''entretien de chaque bijou.',
  true, 'Duo Romantique Rose | ISHYA', 'Duo collier et boucles avec pétales de rose naturels. Coffret cadeau artisanal.')
RETURNING id INTO prod_duo_rose;

-- 18. Coffret Découverte
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Coffret Découverte',
  'coffret-decouverte',
  'Un coffret surprise de 3 bijoux floraux pour découvrir l''univers ISHYA à prix doux.',
  'Le Coffret Découverte ISHYA est une invitation à explorer notre univers. Il contient trois bijoux surprise sélectionnés parmi nos collections : un collier, un bracelet et une paire de boucles d''oreilles. Chaque coffret est assemblé avec soin et emballé dans notre boîte signature avec carte personnalisée. Le cadeau idéal pour initier une proche aux bijoux floraux.',
  55.00, 70.00, 'PAC-CDV', true, true, sub_coffrets,
  col_printemps,
  'Acier inoxydable plaqué or 18k, résine, fleurs séchées variées',
  14, 'Coffret 15 × 10 × 4 cm',
  'Suivez les consignes d''entretien fournies avec chaque bijou du coffret.',
  true, 'Coffret Découverte | ISHYA', 'Coffret cadeau de 3 bijoux floraux surprise. Idée cadeau originale et artisanale.')
RETURNING id INTO prod_coffret_decouv;

-- 19. Collier Muguet Porte-Bonheur
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Collier Muguet Porte-Bonheur',
  'collier-muguet-porte-bonheur',
  'Un brin de muguet miniature préservé en résine, suspendu à une chaîne fine dorée.',
  'Offrez du bonheur toute l''année avec ce collier orné d''un véritable brin de muguet séché et préservé. La clochette blanche du muguet, symbole du 1er mai et du renouveau, est encapsulée dans une goutte de résine transparente. Un bijou porte-bonheur à porter près du cœur.',
  42.00, NULL, 'COL-MUG', true, false, sub_pendentifs,
  col_printemps,
  'Acier inoxydable plaqué or 18k, résine, muguet naturel',
  7, '2 × 1 cm (pendentif)',
  'Évitez le contact avec l''eau et les parfums. Rangez dans la pochette ISHYA fournie.',
  true, 'Collier Muguet Porte-Bonheur | ISHYA', 'Collier avec brin de muguet naturel préservé en résine. Bijou porte-bonheur artisanal.')
RETURNING id INTO prod_muguet;

-- 20. Bague Cosmos Étoilé
INSERT INTO products (id, name, slug, short_description, description, base_price, compare_at_price, sku, is_active, is_featured, category_id, collection_id, material, weight_g, dimensions, care_instructions, is_nickel_free, seo_title, seo_description)
VALUES (gen_random_uuid(),
  'Bague Cosmos Étoilé',
  'bague-cosmos-etoile',
  'Fleurs de cosmos violet et blanc disposées comme une constellation dans un anneau de résine.',
  'Le cosmos, fleur de l''harmonie et de l''ordre de l''univers, inspire cette bague unique. Plusieurs petites fleurs de cosmos séchées sont disposées dans un anneau large en résine transparente, créant un effet de ciel étoilé floral. Chaque bague est une petite galaxie botanique, différente de toutes les autres.',
  30.00, NULL, 'BAG-COS', true, false, sub_simples,
  col_boheme,
  'Résine bio-sourcée, fleurs de cosmos naturelles',
  5, '0.9 cm (largeur anneau)',
  'Retirez avant de vous laver les mains. Évitez les températures extrêmes.',
  true, 'Bague Cosmos Étoilé | ISHYA', 'Bague en résine avec fleurs de cosmos naturelles. Bijou botanique unique fait main.')
RETURNING id INTO prod_cosmos;

-- ════════════════════════════════════════════════════════════════════════════
-- 4. VARIANTES DE PRODUITS
-- ════════════════════════════════════════════════════════════════════════════

-- Collier Pétale de Rose — longueurs
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_petale_rose, 'COL-PTR-38', NULL, NULL, NULL, NULL, 38, 12, 3, 8, true),
  (gen_random_uuid(), prod_petale_rose, 'COL-PTR-42', NULL, NULL, NULL, NULL, 42, 18, 3, 8, true),
  (gen_random_uuid(), prod_petale_rose, 'COL-PTR-45', NULL, NULL, NULL, NULL, 45, 15, 3, 9, true),
  (gen_random_uuid(), prod_petale_rose, 'COL-PTR-50', 48.00, NULL, NULL, NULL, 50, 8, 3, 9, true);

-- Sautoir Fleur d'Hortensia — longueurs
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_hortensia, 'COL-FLH-60', NULL, NULL, NULL, NULL, 60, 10, 3, 12, true),
  (gen_random_uuid(), prod_hortensia, 'COL-FLH-70', NULL, NULL, NULL, NULL, 70, 14, 3, 13, true),
  (gen_random_uuid(), prod_hortensia, 'COL-FLH-80', 56.00, NULL, NULL, NULL, 80, 7, 3, 14, true);

-- Pendentif Gypsophile — longueurs chaîne
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_pendentif_gypso, 'COL-GYP-38', NULL, NULL, NULL, NULL, 38, 20, 5, 6, true),
  (gen_random_uuid(), prod_pendentif_gypso, 'COL-GYP-42', NULL, NULL, NULL, NULL, 42, 25, 5, 6, true),
  (gen_random_uuid(), prod_pendentif_gypso, 'COL-GYP-45', NULL, NULL, NULL, NULL, 45, 22, 5, 7, true);

-- Bague Bouton d'Or — réglable, taille unique
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_bouton_or, 'BAG-BDO-TU', NULL, 'Taille unique (réglable)', NULL, NULL, NULL, 30, 5, 5, true);

-- Bague Fleur de Cerisier — tailles
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_cerisier, 'BAG-FDC-48', NULL, '48', NULL, NULL, NULL, 8, 2, 4, true),
  (gen_random_uuid(), prod_cerisier, 'BAG-FDC-50', NULL, '50', NULL, NULL, NULL, 12, 2, 4, true),
  (gen_random_uuid(), prod_cerisier, 'BAG-FDC-52', NULL, '52', NULL, NULL, NULL, 15, 2, 4, true),
  (gen_random_uuid(), prod_cerisier, 'BAG-FDC-54', NULL, '54', NULL, NULL, NULL, 14, 2, 4, true),
  (gen_random_uuid(), prod_cerisier, 'BAG-FDC-56', NULL, '56', NULL, NULL, NULL, 10, 2, 4, true),
  (gen_random_uuid(), prod_cerisier, 'BAG-FDC-58', NULL, '58', NULL, NULL, NULL, 6, 2, 4, true),
  (gen_random_uuid(), prod_cerisier, 'BAG-FDC-60', NULL, '60', NULL, NULL, NULL, 4, 2, 4, true);

-- Chevalière Fougère — tailles
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_chevaliere_foug, 'BAG-CHF-50', NULL, '50', NULL, NULL, NULL, 6, 2, 9, true),
  (gen_random_uuid(), prod_chevaliere_foug, 'BAG-CHF-52', NULL, '52', NULL, NULL, NULL, 8, 2, 9, true),
  (gen_random_uuid(), prod_chevaliere_foug, 'BAG-CHF-54', NULL, '54', NULL, NULL, NULL, 10, 2, 9, true),
  (gen_random_uuid(), prod_chevaliere_foug, 'BAG-CHF-56', NULL, '56', NULL, NULL, NULL, 9, 2, 9, true),
  (gen_random_uuid(), prod_chevaliere_foug, 'BAG-CHF-58', NULL, '58', NULL, NULL, NULL, 5, 2, 9, true);

-- Jonc Lavande — tailles S/M/L
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_jonc_lavande, 'BRA-JLV-S', NULL, 'S (6 cm)', NULL, NULL, NULL, 10, 3, 15, true),
  (gen_random_uuid(), prod_jonc_lavande, 'BRA-JLV-M', NULL, 'M (6.5 cm)', NULL, NULL, NULL, 18, 3, 15, true),
  (gen_random_uuid(), prod_jonc_lavande, 'BRA-JLV-L', NULL, 'L (7 cm)', NULL, NULL, NULL, 12, 3, 16, true);

-- Bracelet Chaîne Marguerite — longueurs
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_chaine_marg, 'BRA-CHM-16', NULL, NULL, NULL, NULL, 16, 14, 3, 6, true),
  (gen_random_uuid(), prod_chaine_marg, 'BRA-CHM-18', NULL, NULL, NULL, NULL, 18, 20, 3, 6, true),
  (gen_random_uuid(), prod_chaine_marg, 'BRA-CHM-20', NULL, NULL, NULL, NULL, 20, 12, 3, 7, true);

-- Manchette Pivoine — tailles S/M/L
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_manchette_piv, 'BRA-MNP-S', NULL, 'S (5.5 cm)', NULL, NULL, NULL, 5, 2, 27, true),
  (gen_random_uuid(), prod_manchette_piv, 'BRA-MNP-M', NULL, 'M (6 cm)', NULL, NULL, NULL, 8, 2, 28, true),
  (gen_random_uuid(), prod_manchette_piv, 'BRA-MNP-L', NULL, 'L (6.5 cm)', NULL, NULL, NULL, 6, 2, 29, true);

-- Puces Myosotis — taille unique
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_puces_myosotis, 'BO-PMY-TU', NULL, 'Taille unique', NULL, NULL, NULL, 35, 5, 2, true);

-- Créoles Jasmin — 2 diamètres
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_creoles_jasmin, 'BO-CRJ-25', NULL, '2.5 cm', NULL, NULL, NULL, 12, 3, 6, true),
  (gen_random_uuid(), prod_creoles_jasmin, 'BO-CRJ-35', 38.00, '3.5 cm', NULL, NULL, NULL, 10, 3, 8, true);

-- Pendantes Orchidée — taille unique
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_pendantes_orch, 'BO-POR-TU', NULL, 'Taille unique', NULL, NULL, NULL, 14, 3, 5, true);

-- Peigne Floral Gypsophile — taille unique
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_peigne_gypso, 'ACC-PGY-TU', NULL, 'Taille unique', NULL, NULL, NULL, 10, 2, 18, true);

-- Broche Camélia — taille unique
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_broche_camelia, 'ACC-BRC-TU', NULL, 'Taille unique', NULL, NULL, NULL, 22, 5, 8, true);

-- Pince Hortensia — couleurs
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_pince_hort, 'ACC-PHO-ROS', NULL, 'Rose', NULL, NULL, NULL, 15, 3, 6, true),
  (gen_random_uuid(), prod_pince_hort, 'ACC-PHO-BLE', NULL, 'Bleu', NULL, NULL, NULL, 12, 3, 6, true),
  (gen_random_uuid(), prod_pince_hort, 'ACC-PHO-MAU', NULL, 'Mauve', NULL, NULL, NULL, 10, 3, 6, true);

-- Parure Complète Gypsophile — taille unique
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_parure_gypso, 'PAC-PCG-TU', NULL, 'Taille unique', NULL, NULL, NULL, 8, 2, 16, true);

-- Duo Romantique Rose — taille unique
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_duo_rose, 'PAC-DRR-TU', NULL, 'Taille unique', NULL, NULL, NULL, 12, 3, 10, true);

-- Coffret Découverte — taille unique
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_coffret_decouv, 'PAC-CDV-TU', NULL, 'Taille unique', NULL, NULL, NULL, 20, 5, 14, true);

-- Collier Muguet — longueurs
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_muguet, 'COL-MUG-38', NULL, NULL, NULL, NULL, 38, 10, 3, 7, true),
  (gen_random_uuid(), prod_muguet, 'COL-MUG-42', NULL, NULL, NULL, NULL, 42, 16, 3, 7, true),
  (gen_random_uuid(), prod_muguet, 'COL-MUG-45', NULL, NULL, NULL, NULL, 45, 12, 3, 8, true);

-- Bague Cosmos Étoilé — tailles
INSERT INTO product_variants (id, product_id, sku, price_override, size, material_variant, stone, length_cm, stock_quantity, low_stock_threshold, weight_g, is_active) VALUES
  (gen_random_uuid(), prod_cosmos, 'BAG-COS-48', NULL, '48', NULL, NULL, NULL, 6, 2, 5, true),
  (gen_random_uuid(), prod_cosmos, 'BAG-COS-50', NULL, '50', NULL, NULL, NULL, 10, 2, 5, true),
  (gen_random_uuid(), prod_cosmos, 'BAG-COS-52', NULL, '52', NULL, NULL, NULL, 14, 2, 5, true),
  (gen_random_uuid(), prod_cosmos, 'BAG-COS-54', NULL, '54', NULL, NULL, NULL, 12, 2, 5, true),
  (gen_random_uuid(), prod_cosmos, 'BAG-COS-56', NULL, '56', NULL, NULL, NULL, 8, 2, 5, true),
  (gen_random_uuid(), prod_cosmos, 'BAG-COS-58', NULL, '58', NULL, NULL, NULL, 5, 2, 5, true);

-- ════════════════════════════════════════════════════════════════════════════
-- 5. MÉDIAS PRODUITS
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO product_media (id, product_id, url, alt_text, media_type, sort_order, is_primary) VALUES
  -- Collier Pétale de Rose
  (gen_random_uuid(), prod_petale_rose, '/images/products/collier-petale-rose-1.jpg', 'Collier Pétale de Rose — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_petale_rose, '/images/products/collier-petale-rose-2.jpg', 'Collier Pétale de Rose — détail pendentif', 'image', 2, false),
  (gen_random_uuid(), prod_petale_rose, '/images/products/collier-petale-rose-3.jpg', 'Collier Pétale de Rose — porté', 'image', 3, false),

  -- Sautoir Fleur d'Hortensia
  (gen_random_uuid(), prod_hortensia, '/images/products/sautoir-hortensia-1.jpg', 'Sautoir Fleur d''Hortensia — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_hortensia, '/images/products/sautoir-hortensia-2.jpg', 'Sautoir Fleur d''Hortensia — détail pendentif', 'image', 2, false),
  (gen_random_uuid(), prod_hortensia, '/images/products/sautoir-hortensia-3.jpg', 'Sautoir Fleur d''Hortensia — porté', 'image', 3, false),

  -- Pendentif Gypsophile
  (gen_random_uuid(), prod_pendentif_gypso, '/images/products/pendentif-gypsophile-1.jpg', 'Pendentif Gypsophile — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_pendentif_gypso, '/images/products/pendentif-gypsophile-2.jpg', 'Pendentif Gypsophile — détail résine', 'image', 2, false),

  -- Bague Bouton d'Or
  (gen_random_uuid(), prod_bouton_or, '/images/products/bague-bouton-or-1.jpg', 'Bague Bouton d''Or — vue de dessus', 'image', 1, true),
  (gen_random_uuid(), prod_bouton_or, '/images/products/bague-bouton-or-2.jpg', 'Bague Bouton d''Or — portée à la main', 'image', 2, false),

  -- Bague Fleur de Cerisier
  (gen_random_uuid(), prod_cerisier, '/images/products/bague-cerisier-1.jpg', 'Bague Fleur de Cerisier — vue de dessus', 'image', 1, true),
  (gen_random_uuid(), prod_cerisier, '/images/products/bague-cerisier-2.jpg', 'Bague Fleur de Cerisier — portée', 'image', 2, false),
  (gen_random_uuid(), prod_cerisier, '/images/products/bague-cerisier-3.jpg', 'Bague Fleur de Cerisier — détail pétales', 'image', 3, false),

  -- Chevalière Fougère
  (gen_random_uuid(), prod_chevaliere_foug, '/images/products/chevaliere-fougere-1.jpg', 'Chevalière Fougère — vue de dessus', 'image', 1, true),
  (gen_random_uuid(), prod_chevaliere_foug, '/images/products/chevaliere-fougere-2.jpg', 'Chevalière Fougère — portée', 'image', 2, false),

  -- Jonc Lavande
  (gen_random_uuid(), prod_jonc_lavande, '/images/products/jonc-lavande-1.jpg', 'Jonc Lavande — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_jonc_lavande, '/images/products/jonc-lavande-2.jpg', 'Jonc Lavande — détail brins de lavande', 'image', 2, false),
  (gen_random_uuid(), prod_jonc_lavande, '/images/products/jonc-lavande-3.jpg', 'Jonc Lavande — porté au poignet', 'image', 3, false),

  -- Bracelet Chaîne Marguerite
  (gen_random_uuid(), prod_chaine_marg, '/images/products/bracelet-marguerite-1.jpg', 'Bracelet Chaîne Marguerite — vue d''ensemble', 'image', 1, true),
  (gen_random_uuid(), prod_chaine_marg, '/images/products/bracelet-marguerite-2.jpg', 'Bracelet Chaîne Marguerite — détail médaillon', 'image', 2, false),

  -- Manchette Pivoine
  (gen_random_uuid(), prod_manchette_piv, '/images/products/manchette-pivoine-1.jpg', 'Manchette Pivoine — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_manchette_piv, '/images/products/manchette-pivoine-2.jpg', 'Manchette Pivoine — détail pétales', 'image', 2, false),
  (gen_random_uuid(), prod_manchette_piv, '/images/products/manchette-pivoine-3.jpg', 'Manchette Pivoine — portée', 'image', 3, false),

  -- Puces Myosotis
  (gen_random_uuid(), prod_puces_myosotis, '/images/products/puces-myosotis-1.jpg', 'Puces Myosotis — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_puces_myosotis, '/images/products/puces-myosotis-2.jpg', 'Puces Myosotis — portées', 'image', 2, false),

  -- Créoles Jasmin
  (gen_random_uuid(), prod_creoles_jasmin, '/images/products/creoles-jasmin-1.jpg', 'Créoles Jasmin — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_creoles_jasmin, '/images/products/creoles-jasmin-2.jpg', 'Créoles Jasmin — détail jasmin', 'image', 2, false),
  (gen_random_uuid(), prod_creoles_jasmin, '/images/products/creoles-jasmin-3.jpg', 'Créoles Jasmin — portées', 'image', 3, false),

  -- Pendantes Orchidée
  (gen_random_uuid(), prod_pendantes_orch, '/images/products/pendantes-orchidee-1.jpg', 'Pendantes Orchidée — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_pendantes_orch, '/images/products/pendantes-orchidee-2.jpg', 'Pendantes Orchidée — portées', 'image', 2, false),
  (gen_random_uuid(), prod_pendantes_orch, '/images/products/pendantes-orchidee-3.jpg', 'Pendantes Orchidée — détail pétale', 'image', 3, false),

  -- Peigne Floral Gypsophile
  (gen_random_uuid(), prod_peigne_gypso, '/images/products/peigne-gypsophile-1.jpg', 'Peigne Floral Gypsophile — vue d''ensemble', 'image', 1, true),
  (gen_random_uuid(), prod_peigne_gypso, '/images/products/peigne-gypsophile-2.jpg', 'Peigne Floral Gypsophile — dans une coiffure', 'image', 2, false),
  (gen_random_uuid(), prod_peigne_gypso, '/images/products/peigne-gypsophile-3.jpg', 'Peigne Floral Gypsophile — détail perles', 'image', 3, false),

  -- Broche Camélia
  (gen_random_uuid(), prod_broche_camelia, '/images/products/broche-camelia-1.jpg', 'Broche Camélia — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_broche_camelia, '/images/products/broche-camelia-2.jpg', 'Broche Camélia — sur un blazer', 'image', 2, false),

  -- Pince Hortensia
  (gen_random_uuid(), prod_pince_hort, '/images/products/pince-hortensia-1.jpg', 'Pince Hortensia — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_pince_hort, '/images/products/pince-hortensia-2.jpg', 'Pince Hortensia — dans les cheveux', 'image', 2, false),

  -- Parure Complète Gypsophile
  (gen_random_uuid(), prod_parure_gypso, '/images/products/parure-gypsophile-1.jpg', 'Parure Complète Gypsophile — coffret ouvert', 'image', 1, true),
  (gen_random_uuid(), prod_parure_gypso, '/images/products/parure-gypsophile-2.jpg', 'Parure Complète Gypsophile — les trois pièces', 'image', 2, false),
  (gen_random_uuid(), prod_parure_gypso, '/images/products/parure-gypsophile-3.jpg', 'Parure Complète Gypsophile — portée', 'image', 3, false),

  -- Duo Romantique Rose
  (gen_random_uuid(), prod_duo_rose, '/images/products/duo-rose-1.jpg', 'Duo Romantique Rose — dans l''écrin', 'image', 1, true),
  (gen_random_uuid(), prod_duo_rose, '/images/products/duo-rose-2.jpg', 'Duo Romantique Rose — les deux pièces', 'image', 2, false),

  -- Coffret Découverte
  (gen_random_uuid(), prod_coffret_decouv, '/images/products/coffret-decouverte-1.jpg', 'Coffret Découverte — boîte fermée', 'image', 1, true),
  (gen_random_uuid(), prod_coffret_decouv, '/images/products/coffret-decouverte-2.jpg', 'Coffret Découverte — contenu', 'image', 2, false),
  (gen_random_uuid(), prod_coffret_decouv, '/images/products/coffret-decouverte-3.jpg', 'Coffret Découverte — bijoux disposés', 'image', 3, false),

  -- Collier Muguet
  (gen_random_uuid(), prod_muguet, '/images/products/collier-muguet-1.jpg', 'Collier Muguet Porte-Bonheur — vue de face', 'image', 1, true),
  (gen_random_uuid(), prod_muguet, '/images/products/collier-muguet-2.jpg', 'Collier Muguet Porte-Bonheur — détail', 'image', 2, false),

  -- Bague Cosmos Étoilé
  (gen_random_uuid(), prod_cosmos, '/images/products/bague-cosmos-1.jpg', 'Bague Cosmos Étoilé — vue de dessus', 'image', 1, true),
  (gen_random_uuid(), prod_cosmos, '/images/products/bague-cosmos-2.jpg', 'Bague Cosmos Étoilé — portée', 'image', 2, false),
  (gen_random_uuid(), prod_cosmos, '/images/products/bague-cosmos-3.jpg', 'Bague Cosmos Étoilé — détail fleurs', 'image', 3, false);

-- ════════════════════════════════════════════════════════════════════════════
-- 6. FAQ ARTICLES
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO faq_articles (id, category, question, answer, sort_order) VALUES
  (gen_random_uuid(), 'Livraison', 'Quels sont les délais et frais de livraison ?',
   E'## Livraison en France métropolitaine\n\n- **Standard** (Colissimo) : 3 à 5 jours ouvrés — 4,90 €\n- **Express** (Chronopost) : 1 à 2 jours ouvrés — 9,90 €\n- **Point Relais** (Mondial Relay) : 4 à 6 jours ouvrés — 3,90 €\n- **Gratuite** dès 60 € d''achat (Standard)\n\n## DOM-TOM\n\nLivraison en 7 à 14 jours ouvrés — 12,90 €\n\n## Europe\n\nLivraison en 5 à 10 jours ouvrés — 8,90 €\n\nToutes les commandes sont préparées sous 1 à 2 jours ouvrés. Un numéro de suivi vous est envoyé par email dès l''expédition.',
   1),

  (gen_random_uuid(), 'Retours', 'Comment retourner un article ?',
   E'## Politique de retour\n\nVous disposez de **14 jours** après réception pour retourner un article.\n\n### Conditions\n\n- L''article doit être dans son état d''origine, non porté\n- L''emballage d''origine doit être conservé\n- Les articles personnalisés ne sont pas éligibles au retour\n\n### Procédure\n\n1. Connectez-vous à votre espace client\n2. Rendez-vous dans « Mes commandes »\n3. Sélectionnez l''article à retourner\n4. Imprimez l''étiquette de retour prépayée\n5. Déposez le colis en point relais\n\nLe remboursement est effectué sous 5 à 7 jours ouvrés après réception de votre retour.',
   2),

  (gen_random_uuid(), 'Tailles', 'Comment connaître ma taille de bague ?',
   E'## Guide des tailles de bagues\n\nPour déterminer votre taille de bague, vous pouvez :\n\n### Méthode 1 : Avec une bague existante\n\nMesurez le **diamètre intérieur** de l''une de vos bagues en millimètres.\n\n| Diamètre (mm) | Taille FR |\n|---|---|\n| 15.3 | 48 |\n| 15.9 | 50 |\n| 16.5 | 52 |\n| 17.2 | 54 |\n| 17.8 | 56 |\n| 18.4 | 58 |\n| 19.1 | 60 |\n\n### Méthode 2 : Avec un fil\n\nEnroulez un fil autour de votre doigt, marquez l''endroit où le fil se croise, puis mesurez la longueur en mm. Divisez par 3.14 pour obtenir le diamètre.\n\n> 💡 **Astuce** : Mesurez en fin de journée quand vos doigts sont légèrement plus gonflés. En cas de doute, choisissez la taille supérieure.',
   3),

  (gen_random_uuid(), 'Entretien', 'Comment entretenir mes bijoux en fleurs séchées ?',
   E'## Entretien de vos bijoux ISHYA\n\nNos bijoux sont conçus pour durer, mais la résine et les fleurs naturelles nécessitent quelques précautions :\n\n### À faire ✅\n\n- Rangez vos bijoux dans la pochette ou le coffret ISHYA fourni\n- Nettoyez avec un **chiffon doux et sec**\n- Retirez vos bijoux avant la douche, le bain ou le sport\n- Mettez vos bijoux **après** votre parfum et vos crèmes\n\n### À éviter ❌\n\n- Le contact prolongé avec l''eau\n- L''exposition directe au soleil pendant de longues heures\n- Les produits chimiques (parfum, chlore, produits ménagers)\n- Les chocs directs sur les parties en résine\n\n### Redonner de l''éclat\n\nSi la résine perd légèrement de son éclat, frottez doucement avec un chiffon microfibre légèrement humide, puis séchez immédiatement.',
   4),

  (gen_random_uuid(), 'Paiement', 'Quels moyens de paiement acceptez-vous ?',
   E'## Moyens de paiement\n\nNous acceptons les moyens de paiement suivants :\n\n- **Carte bancaire** : Visa, Mastercard, American Express\n- **Apple Pay** et **Google Pay**\n- **PayPal**\n- **Paiement en 3x sans frais** dès 50 € (via Alma)\n\nTous les paiements sont **100 % sécurisés** grâce à notre partenaire Stripe. Vos données bancaires ne sont jamais stockées sur nos serveurs.\n\n> 🔒 Paiement sécurisé SSL avec chiffrement 256 bits.',
   5),

  (gen_random_uuid(), 'Matériaux', 'Quels matériaux utilisez-vous ?',
   E'## Nos matériaux\n\n### Métaux\n\n- **Acier inoxydable 316L** plaqué or 18 carats : hypoallergénique, résistant à la corrosion\n- **Acier chirurgical** pour les tiges de boucles d''oreilles\n- Tous nos bijoux sont **sans nickel** (nickel-free)\n\n### Résine\n\n- Résine époxy transparente de qualité joaillerie\n- Protection UV intégrée pour préserver les couleurs des fleurs\n- Finition brillante et lisse\n\n### Fleurs\n\n- 100 % **fleurs naturelles** séchées et stabilisées\n- Cueillies à maturité pour des couleurs optimales\n- Variétés : rose, hortensia, gypsophile, jasmin, lavande, myosotis, muguet, orchidée, pivoine, fougère, cosmos, cerisier, marguerite, camélia\n\n> 🌿 Chaque bijou est unique car la disposition des fleurs varie naturellement.',
   6),

  (gen_random_uuid(), 'Personnalisation', 'Proposez-vous des bijoux personnalisés ?',
   E'## Personnalisation\n\nOui ! Nous proposons plusieurs options de personnalisation :\n\n### Gravure\n\nAjoutez une gravure (initiale, date, petit mot) au dos de certains pendentifs et médaillons. Option disponible pour **5 € supplémentaires**.\n\n### Choix de la fleur\n\nPour certains modèles, vous pouvez choisir la fleur ou la couleur de fleur de votre choix parmi notre sélection.\n\n### Sur-mesure\n\nVous avez un projet spécial (mariage, événement) ? Contactez-nous à **contact@ishya.fr** pour discuter de vos envies. Nous créons des pièces sur-mesure à partir de **80 €**.\n\n> Délai de fabrication pour les pièces personnalisées : 2 à 3 semaines.',
   7),

  (gen_random_uuid(), 'Programme fidélité', 'Comment fonctionne le programme de fidélité ?',
   E'## Programme de fidélité ISHYA\n\nRécompensez votre amour des fleurs !\n\n### Comment ça marche ?\n\n- Créez un compte ISHYA\n- Gagnez des points à chaque achat\n- Utilisez vos points pour obtenir des réductions\n\n### Les paliers\n\n| Palier | Points requis | Taux | Avantages |\n|---|---|---|---|\n| 🥉 Bronze | 0 | 1 pt/€ | Accès aux ventes privées |\n| 🥈 Argent | 200 pts | 1,5 pt/€ | -5 % permanent, livraison prioritaire |\n| 🥇 Or | 500 pts | 2 pts/€ | -10 % permanent, accès avant-premières |\n| 💎 Platine | 1 000 pts | 2,5 pts/€ | -15 % permanent, cadeau anniversaire, personal shopper |\n\n### Utiliser vos points\n\n- 100 points = 5 € de réduction\n- Les points sont valables 12 mois après leur obtention\n- Cumulables avec les codes promo (hors soldes)',
   8);

-- ════════════════════════════════════════════════════════════════════════════
-- 7. BLOG POSTS
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO blog_posts (id, title, slug, body, excerpt, cover_image_url, author_id, tags, seo_title, seo_description, is_published, published_at) VALUES
  (gen_random_uuid(),
   'Comment entretenir vos bijoux en fleurs séchées',
   'comment-entretenir-bijoux-fleurs-sechees',
   E'# Comment entretenir vos bijoux en fleurs séchées\n\nVos bijoux ISHYA sont de véritables petits trésors de la nature, capturés dans la résine pour l''éternité. Pour qu''ils conservent toute leur beauté au fil des années, voici nos conseils d''entretien.\n\n## Les gestes quotidiens\n\nLe secret d''un bijou floral qui dure ? **L''ordre dans lequel vous vous préparez.** Appliquez d''abord votre crème hydratante, votre parfum, puis enfilez vos bijoux en dernier. Cela évite que les produits chimiques n''entrent en contact direct avec la résine.\n\nRetirez systématiquement vos bijoux avant :\n- La douche ou le bain\n- La vaisselle\n- Le sport\n- Le ménage\n\n## Le rangement\n\nChaque bijou ISHYA est livré avec une pochette en velours ou un écrin. **Utilisez-les !** La résine peut se rayer au contact d''autres bijoux ou d''objets durs. Rangez chaque pièce séparément, à l''abri de la lumière directe du soleil.\n\n## Le nettoyage\n\nUn simple **chiffon doux et sec** suffit pour redonner de l''éclat à vos bijoux. Si nécessaire, vous pouvez légèrement humidifier le chiffon avec de l''eau tiède. Séchez immédiatement après.\n\n**N''utilisez jamais** de produit nettoyant, d''alcool ou de vinaigre sur la résine — cela pourrait la rendre opaque.\n\n## La résine et le soleil\n\nLa résine est traitée avec un filtre UV, mais une **exposition prolongée au soleil** (plusieurs heures d''affilée, jour après jour) peut progressivement jaunir la résine transparente. Pour les bijoux que vous portez au quotidien en été, alternez-les.\n\n## Que faire si la résine est rayée ?\n\nLes micro-rayures peuvent être atténuées en appliquant une **très fine couche de vernis à ongles transparent** sur la surface. Laissez sécher 24 heures. Pour les rayures plus profondes, contactez-nous : nous proposons un service de restauration.\n\n---\n\n*Prenez soin de vos bijoux, ils prendront soin de votre style. 🌸*',
   'Découvrez nos conseils pour préserver la beauté de vos bijoux floraux ISHYA au quotidien. Rangement, nettoyage et astuces pour des bijoux qui durent.',
   '/images/blog/entretien-bijoux-fleurs.jpg',
   NULL,
   ARRAY['entretien', 'conseils', 'résine', 'fleurs séchées', 'bijoux'],
   'Comment entretenir vos bijoux en fleurs séchées | ISHYA Blog',
   'Guide complet pour entretenir vos bijoux en fleurs séchées et résine. Conseils de rangement, nettoyage et astuces pour une durée de vie optimale.',
   true, '2026-02-15T10:00:00Z'),

  (gen_random_uuid(),
   'Guide : Choisir la bague parfaite',
   'guide-choisir-bague-parfaite',
   E'# Guide : Choisir la bague parfaite\n\nQu''il s''agisse d''un cadeau ou d''un plaisir personnel, choisir une bague peut sembler délicat. Taille, style, occasion... Voici notre guide complet pour trouver **la** bague qui vous ressemble.\n\n## Connaître sa taille\n\nC''est la première étape et la plus importante. Chez ISHYA, nous proposons des tailles françaises allant du **48 au 60**.\n\n### Notre astuce préférée\n\nPrenez une bague qui vous va bien, posez-la sur une feuille blanche, et tracez le cercle intérieur au crayon. Mesurez le diamètre avec une règle, et consultez notre guide des tailles.\n\n> En cas de doute entre deux tailles, choisissez toujours la taille supérieure.\n\n## Choisir selon l''occasion\n\n### Au quotidien\n\nPrivilégiez les modèles **réglables** ou les **bagues simples** à profil bas, comme la Bague Bouton d''Or. Elles sont confortables et ne gênent pas les gestes du quotidien.\n\n### Pour une soirée\n\nOsez les pièces plus affirmées comme la **Chevalière Fougère** ou la **Bague Cosmos Étoilé**. L''anneau large en résine capte la lumière de façon spectaculaire.\n\n### Pour offrir\n\nSi vous ne connaissez pas la taille, optez pour une **bague réglable**. C''est la valeur sûre, et notre Bague Bouton d''Or est notre best-seller cadeau.\n\n## Accumuler les bagues\n\nLa tendance est au « ring stacking » ! Mélangez les styles : une bague fine en résine, un anneau doré simple, et une chevalière pour un effet bohème chic. Jouez avec les doigts : majeur, index, auriculaire...\n\n## L''entretien spécifique des bagues\n\nLes bagues sont les bijoux les plus exposés aux chocs quotidiens. Pensez à retirer votre bague ISHYA pour :\n- Vous laver les mains\n- Cuisiner\n- Faire du sport\n\nRangez-la dans sa pochette dès que vous la retirez.\n\n---\n\n*Trouvez la bague qui raconte votre histoire. 🌿*',
   'Taille, style, occasion : notre guide complet pour choisir la bague en fleurs séchées qui vous correspond parfaitement.',
   '/images/blog/guide-bague-parfaite.jpg',
   NULL,
   ARRAY['bague', 'guide', 'taille', 'style', 'cadeau', 'choix'],
   'Guide : Choisir la bague parfaite en fleurs séchées | ISHYA Blog',
   'Comment choisir la bague parfaite ? Taille, style, occasion. Guide complet pour trouver la bague en fleurs séchées qui vous ressemble.',
   true, '2026-03-01T10:00:00Z'),

  (gen_random_uuid(),
   'Tendances bijoux floraux 2026',
   'tendances-bijoux-floraux-2026',
   E'# Tendances bijoux floraux 2026\n\nLes bijoux botaniques sont plus que jamais au cœur de la mode. En 2026, la tendance est à l''authenticité, au retour à la nature et à l''artisanat. Voici les grandes tendances que nous observons — et que nous incarnons chez ISHYA.\n\n## 1. Le « Quiet Luxury » botanique\n\nFini les bijoux tape-à-l''œil. En 2026, on mise sur des pièces **discrètes mais précieuses**. Un pendentif en résine avec une seule fleur, des puces d''oreilles minimalistes... La beauté est dans le détail. Notre collection **Minimaliste Pétale** incarne parfaitement cette tendance.\n\n## 2. Les tons terracotta et beige\n\nLes palettes de couleurs se font **chaudes et terreuses**. Terracotta, beige rosé, ivoire, sable... Ces teintes douces s''accordent à tous les tons de peau et toutes les garde-robes. Chez ISHYA, elles sont notre signature depuis le premier jour.\n\n## 3. Le bijou-souvenir\n\nEn 2026, le bijou raconte une **histoire**. Il capture un moment, un lieu, une émotion. Quoi de plus poétique qu''un bijou qui renferme une vraie fleur, cueillie dans un jardin, préservée pour toujours ? Nos clientes nous racontent souvent le lien émotionnel qu''elles créent avec leurs bijoux floraux.\n\n## 4. Le layering floral\n\nL''art de **superposer** les bijoux se décline en version florale. Un ras-de-cou + un sautoir + un pendentif, chacun avec une fleur différente. Ou plusieurs bagues fines sur la même main. Le layering permet de créer un look unique et personnel.\n\n## 5. Le mariage champêtre\n\nLes mariages en plein air continuent de dominer, et avec eux, la demande pour des **accessoires de mariage botaniques**. Peignes en gypsophile, boucles d''oreilles florales, broches pour les témoins... Notre collection **Mariage & Cérémonie** répond à cette tendance croissante.\n\n## 6. La mode éco-responsable\n\nLes consommateurs sont de plus en plus attentifs à l''**impact environnemental** de leurs achats. Les bijoux en fleurs séchées cochent toutes les cases : matériaux naturels, production artisanale, durabilité. Chez ISHYA, chaque bijou est fabriqué à la main en France.\n\n---\n\n*La nature est la plus belle des parures. Portez-la avec fierté. 🌺*',
   'Découvrez les 6 grandes tendances bijoux floraux de 2026 : quiet luxury, terracotta, bijou-souvenir, layering et mode éco-responsable.',
   '/images/blog/tendances-bijoux-floraux-2026.jpg',
   NULL,
   ARRAY['tendances', '2026', 'bijoux floraux', 'mode', 'quiet luxury', 'terracotta', 'mariage'],
   'Tendances bijoux floraux 2026 | ISHYA Blog',
   'Les 6 grandes tendances bijoux floraux de 2026 : quiet luxury botanique, tons terracotta, bijou-souvenir, layering floral et mode éco-responsable.',
   true, '2026-03-10T10:00:00Z');

-- ════════════════════════════════════════════════════════════════════════════
-- 8. ZONES & MÉTHODES D'EXPÉDITION
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO shipping_zones (id, name, countries, is_active)
VALUES (gen_random_uuid(), 'France métropolitaine', ARRAY['FR'], true)
RETURNING id INTO zone_france;

INSERT INTO shipping_zones (id, name, countries, is_active)
VALUES (gen_random_uuid(), 'DOM-TOM', ARRAY['GP', 'MQ', 'GF', 'RE', 'YT', 'PM', 'BL', 'MF', 'WF', 'PF', 'NC'], true)
RETURNING id INTO zone_domtom;

INSERT INTO shipping_zones (id, name, countries, is_active)
VALUES (gen_random_uuid(), 'Europe', ARRAY['DE', 'BE', 'LU', 'NL', 'IT', 'ES', 'PT', 'CH', 'AT', 'GB', 'IE', 'DK', 'SE', 'NO', 'FI', 'PL', 'CZ', 'GR', 'HR', 'RO', 'BG', 'HU', 'SK', 'SI', 'EE', 'LV', 'LT', 'MT', 'CY'], true)
RETURNING id INTO zone_europe;

-- France métropolitaine
INSERT INTO shipping_methods (id, zone_id, name, description, price, free_above, estimated_days_min, estimated_days_max, carrier, is_active, sort_order) VALUES
  (gen_random_uuid(), zone_france, 'Standard', 'Livraison à domicile en 3 à 5 jours ouvrés', 4.90, 60.00, 3, 5, 'Colissimo', true, 1),
  (gen_random_uuid(), zone_france, 'Express', 'Livraison express à domicile en 1 à 2 jours ouvrés', 9.90, NULL, 1, 2, 'Chronopost', true, 2),
  (gen_random_uuid(), zone_france, 'Point Relais', 'Livraison en point relais en 4 à 6 jours ouvrés', 3.90, 60.00, 4, 6, 'Mondial Relay', true, 3);

-- DOM-TOM
INSERT INTO shipping_methods (id, zone_id, name, description, price, free_above, estimated_days_min, estimated_days_max, carrier, is_active, sort_order) VALUES
  (gen_random_uuid(), zone_domtom, 'Standard DOM-TOM', 'Livraison en 7 à 14 jours ouvrés', 12.90, NULL, 7, 14, 'Colissimo International', true, 1);

-- Europe
INSERT INTO shipping_methods (id, zone_id, name, description, price, free_above, estimated_days_min, estimated_days_max, carrier, is_active, sort_order) VALUES
  (gen_random_uuid(), zone_europe, 'Standard Europe', 'Livraison en 5 à 10 jours ouvrés', 8.90, 100.00, 5, 10, 'Colissimo International', true, 1),
  (gen_random_uuid(), zone_europe, 'Express Europe', 'Livraison express en 3 à 5 jours ouvrés', 14.90, NULL, 3, 5, 'DHL Express', true, 2);

-- ════════════════════════════════════════════════════════════════════════════
-- 9. PALIERS DE FIDÉLITÉ
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO loyalty_tiers (id, name, min_points, points_multiplier, perks) VALUES
  (gen_random_uuid(), 'bronze', 0, 1.0,
   '["1 point par euro dépensé", "Accès aux ventes privées", "Newsletter exclusive"]'::jsonb),
  (gen_random_uuid(), 'silver', 200, 1.5,
   '["1,5 point par euro dépensé", "-5 % sur toutes les commandes", "Livraison prioritaire", "Accès aux ventes privées"]'::jsonb),
  (gen_random_uuid(), 'gold', 500, 2.0,
   '["2 points par euro dépensé", "-10 % sur toutes les commandes", "Accès avant-premières collections", "Livraison express offerte", "Emballage cadeau offert"]'::jsonb),
  (gen_random_uuid(), 'platinum', 1000, 2.5,
   '["2,5 points par euro dépensé", "-15 % sur toutes les commandes", "Cadeau surprise pour votre anniversaire", "Personal shopper dédié", "Invitations événements exclusifs", "Retours gratuits illimités"]'::jsonb);

-- ════════════════════════════════════════════════════════════════════════════
-- 10. CODES DE RÉDUCTION
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO discount_codes (id, code, discount_type, discount_value, minimum_order_amount, usage_limit, usage_count, starts_at, ends_at, applicable_category_ids, applicable_product_ids) VALUES
  (gen_random_uuid(), 'BIENVENUE10', 'percentage', 10, NULL, NULL, 0,
   '2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z', '{}', '{}'),
  (gen_random_uuid(), 'ISHYA20', 'fixed_amount', 20, 80, 500, 0,
   '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', '{}', '{}'),
  (gen_random_uuid(), 'LIVGRATUITE', 'free_shipping', 0, NULL, 1000, 0,
   '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', '{}', '{}');

END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- 11. BANNIÈRES (hors DO block — pas de dépendances UUID)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO banners (id, title, subtitle, image_url, link_url, placement, sort_order, is_active, starts_at, ends_at) VALUES
  (gen_random_uuid(),
   'La nature se porte en bijou',
   'Découvrez notre nouvelle collection Printemps Éternel — des fleurs vraies préservées pour toujours.',
   '/images/banners/hero-printemps-eternel.jpg',
   '/collections/printemps-eternel',
   'hero', 1, true, '2026-03-01T00:00:00Z', NULL),

  (gen_random_uuid(),
   'Livraison offerte dès 60 €',
   'En France métropolitaine • Expédition sous 24-48h',
   NULL,
   NULL,
   'announcement_bar', 2, true, NULL, NULL),

  (gen_random_uuid(),
   'Sublimez votre jour J',
   'Peignes, boucles, parures… Nos bijoux de mariage en fleurs séchées pour une cérémonie poétique.',
   '/images/banners/hero-mariage.jpg',
   '/collections/mariage-ceremonie',
   'hero', 3, true, NULL, NULL);

-- ════════════════════════════════════════════════════════════════════════════
-- 12. PAGES CMS
-- ════════════════════════════════════════════════════════════════════════════

-- Pages CMS éditables par l'admin (/p/[slug]).
-- Note : les pages "À propos", "CGV", "Mentions légales", "Confidentialité"
-- et "Retours" sont déjà servies par des routes React dédiées
-- (/a-propos, /cgv, /mentions-legales, /confidentialite, /retours), donc on
-- ne les seed pas ici pour éviter le doublon. L'admin peut créer ses propres
-- pages CMS via /admin/pages — exemples laissés volontairement vides.
