# Audit complet — Structure du site ISHYA

> Date : 2026-05-07
> Branche : `claude/audit-site-structure-SQ5G4`
> Périmètre : routes, composants, liens, données (Supabase / server actions / RLS), CTA, lacunes UX

---

## TL;DR (lecture en 30 secondes)

- **102 pages**, **24 layouts**, **14 routes API**, **54 tables** Supabase, **36 server actions** : la couverture fonctionnelle est très large.
- **1 seul lien réellement cassé** dans tout le code : `Link href="/aide/retours"` dans `src/app/(storefront)/retours/page.tsx:334` → la page `/aide/retours` n'existe pas (devrait être `/retours` ou supprimé).
- **~15 pages publiques existent mais ne sont pas atteignables depuis Header/Footer** (orphelines fonctionnelles) : `/equipe`, `/mediation`, `/accessibilite`, `/desinscription`, `/newsletter/confirme`, `/styleguide`, `/presse`, `/recrutement`, `/suivi`, `/p/[slug]` (CMS), `/pack/[slug]`, `/compte/paiement`, `/compte/notifications`, `/compte/tailles`, `/compte/avis`.
- **Le blog charge bien depuis Supabase** (`getPublishedBlogPosts`) — les images cassées vues à l'écran (alt visible sur fond beige) sont des `cover_image_url` vides ou en 404.
- **2 composants orphelins** : `Fr.tsx`, `product/AnimatedProductGrid.tsx` (jamais importés).
- **Lacune UI majeure** : pas de système de design pour les inputs de formulaire (`Input`, `Select`, `Checkbox`, `Textarea`, `Modal` générique, `Accordion`, `Tabs`, `Breadcrumb`, `Pagination`, `Skeleton`, `Star Rating`).
- **RLS activée sur les 54 tables** ; service_role bien isolé. Mais **validation Zod inégale** sur les server actions et **`src/types/database.ts` désynchronisé** avec le schéma réel.

---

## 1. Cartographie des routes

### 1.1 Storefront — pages publiques (`src/app/(storefront)`)

Layout commun : `Header` + `Footer` + `CartDrawer` + `WishlistHydrator` + `CustomCursor` + `PageTransition`.

| URL | Fichier | Cache | Données | Métadonnées |
|---|---|---|---|---|
| `/` | `page.tsx` | revalidate 300 | DB (best-sellers, hero) | `generateMetadata`, OG/Twitter |
| `/boutique` | `page.tsx` | revalidate 300 | DB (filtres facets) | dynamique |
| `/produit/[slug]` | `page.tsx` | revalidate 300 | DB | `generateMetadata` + `generateStaticParams` |
| `/pack/[slug]` | `page.tsx` | revalidate 300 | DB | `generateMetadata` + `generateStaticParams` |
| `/blog` | `page.tsx` | revalidate 300 | DB (`blog_posts`) | static |
| `/blog/[slug]` | `page.tsx` | revalidate 300 | DB | `generateMetadata` + `generateStaticParams` |
| `/p/[slug]` (CMS pages) | `page.tsx` | revalidate 300 | DB (`cms_pages`) | `generateMetadata` + `generateStaticParams` |
| `/aide` | `page.tsx` | revalidate 300 | DB (FAQ) | static |
| `/a-propos`, `/atelier`, `/equipe`, `/materiaux` | `page.tsx` | static | hardcodé / DB ? | static |
| `/contact`, `/livraison`, `/retours`, `/garantie`, `/entretien`, `/guide-des-tailles`, `/cgv`, `/confidentialite`, `/mentions-legales`, `/cookies`, `/mediation`, `/accessibilite` | `page.tsx` | static | hardcodé | static |
| `/carte-cadeau`, `/programme-fidelite`, `/parrainage`, `/sur-mesure`, `/presse`, `/recrutement` | `page.tsx` | static | hardcodé | static |
| `/suivi`, `/desinscription`, `/newsletter/confirme`, `/styleguide` | `page.tsx` | static | mixte | static |

**Total storefront** : 30 pages statiques + 4 pages dynamiques (`produit`, `pack`, `blog`, `p`).

### 1.2 Auth — `src/app/(auth)`

Layout dédié à 2 colonnes, `robots: { index: false }` partout.

| URL | Rôle |
|---|---|
| `/connexion` | Connexion (magic link / mot de passe) |
| `/inscription` | Création compte |
| `/mot-de-passe-oublie` | Demande reset |
| `/reset-password` | Callback reset |
| `/verification` | Étape de vérification email |

Callback réel : **`src/app/auth/callback/route.ts`** (GET) — échange code Supabase, redirige `/admin` si `profile.role === "admin"`, sinon `/compte`.

### 1.3 Checkout — `src/app/(checkout)`

Layout `CheckoutShell` (client), `robots: false`.

| URL | Étape |
|---|---|
| `/panier` | Vue panier |
| `/checkout/identification` | Step 1 : email + auth |
| `/checkout/livraison` | Step 2 : adresse + méthode |
| `/checkout/paiement` | Step 3 : Stripe Elements |
| `/checkout/confirmation/[orderId]` | Confirmation post-paiement |

### 1.4 Compte client — `src/app/compte`

Layout `CompteShell` (force-dynamic, redirect si non connecté).

`/compte`, `/compte/profil`, `/compte/adresses`, `/compte/paiement`, `/compte/commandes`, `/compte/commandes/[id]`, `/compte/commandes/[id]/suivi`, `/compte/retours`, `/compte/retours/nouveau/[orderId]`, `/compte/avis`, `/compte/favoris`, `/compte/fidelite`, `/compte/notifications`, `/compte/tailles`, `/compte/tickets`, `/compte/tickets/[id]`, `/compte/tickets/nouveau`.

**Total compte** : 17 pages.

### 1.5 Admin — `src/app/admin`

Layout `AdminShell` (force-dynamic, vérifie `role === "admin"`).

41 pages organisées en :

- **Dashboard / KPIs** : `/admin`, `/admin/rapports`, `/admin/audit`
- **Catalogue** : `/admin/produits` (+ `/nouveau`, `/[id]`), `/admin/packs` (+ `/[id]`), `/admin/categories` (+ `/[id]`), `/admin/collections` (+ `/[id]`), `/admin/stocks`
- **CMS / contenu** : `/admin/blog` (+ `/nouveau`, `/[id]`), `/admin/pages` (+ `/nouveau`, `/[id]`), `/admin/faq` (+ `/nouveau`, `/[id]`), `/admin/bannieres`, `/admin/seo`, `/admin/reseaux-sociaux`
- **Ventes** : `/admin/commandes` (+ `/[id]`), `/admin/clients` (+ `/[id]`), `/admin/retours`, `/admin/paniers-abandonnes`, `/admin/promotions`, `/admin/cartes-cadeaux`
- **Support** : `/admin/tickets` (+ `/[id]`), `/admin/messages`, `/admin/avis`
- **Marketing / config** : `/admin/newsletter`, `/admin/livraison`, `/admin/equipe`, `/admin/parametres`

### 1.6 API — `src/app/api`

| Route | Méthode | Auth | Rôle |
|---|---|---|---|
| `/api/auth/callback` (route file `src/app/auth/callback/route.ts`) | GET | none | Échange code Supabase |
| `/api/cart/sync` | POST | optionnelle | Sync panier local → DB |
| `/api/cart/merge` | POST | requise | Fusion panier anon → user |
| `/api/stripe/create-payment-intent` | POST | requise | PaymentIntent Stripe |
| `/api/stripe/gift-card` | POST | optionnelle | Achat carte cadeau |
| `/api/stripe/webhooks` | POST | signature Stripe | Events paiement |
| `/api/webhooks/resend` | POST | signature Resend | Bounces / livraison email |
| `/api/newsletter/confirm` | GET | token URL | Double opt-in |
| `/api/admin/notifications/counts` | GET | admin | Badges sidebar |
| `/api/admin/products/search` | GET | admin | Autocomplete catalog |
| `/api/compte/factures/[orderNumber]` | GET | requise | PDF facture |
| `/api/cron/abandoned-carts` | GET | `CRON_SECRET` | Job emails |
| `/api/cron/birthdays` | GET | `CRON_SECRET` | Job anniversaires |
| `/api/cron/expire-gift-cards` | GET | `CRON_SECRET` | Job expirations |

### 1.7 Fallbacks globaux

- `src/app/error.tsx` (client, digest)
- `src/app/not-found.tsx` (avec Header/Footer/CartDrawer)
- `src/app/loading.tsx` (spinner)
- `src/app/(storefront)/not-found.tsx` (404 contextuel storefront avec liens utiles)

---

## 2. Composants UI

### 2.1 Inventaire (26 fichiers)

| Dossier | Composants | Usage |
|---|---|---|
| **racine** | `ConsentBanner` | Bannière cookies, utilisée |
| | `Fr` | Wrapper typo française — **ORPHELIN** (jamais importé) |
| **layout** | `Header`, `Footer`, `SearchModal` | Tous utilisés (storefront + compte + 404) |
| **cart** | `CartDrawer` | Panier off-canvas (`/checkout/identification` cible) |
| **home** | `BestSellersCarousel` | Page d'accueil |
| **product** | `ProductCard`, `AddToCartButton`, `ProductGallery`, `RelatedCarousel` | Page produit + boutique + carousels |
| | `AnimatedProductGrid` | **ORPHELIN** (la boutique fait `products.map` directement) |
| **wishlist** | `WishlistHydrator` | Hydrate Zustand store côté client |
| **seo** | `JsonLd` | Schema.org sur produit + blog |
| **ui** | `Button`, `KPICard`, `StatusBadge`, `CustomCursor`, `PageTransition` | Design system minimal |
| **admin** | `ConfirmDialog`, `ImageUploader`, `SingleImageUploader`, `RichTextEditor` (TipTap), `DraftRestoreBanner`, `SortableProductRow` | Tous utilisés intensivement |

### 2.2 Composants manquants (système de design)

Ce qu'on attendrait dans une boutique e-commerce de cette taille et qui **n'existe pas** :

- `Input`, `Select`, `Textarea`, `Checkbox`, `Radio` réutilisables (admin et compte font du HTML brut → look incohérent, validation manuelle)
- `Modal` générique (seul `ConfirmDialog` destructif existe)
- `Accordion` (utile FAQ, fiche produit, guide des tailles)
- `Tabs` (description / avis / spécifications sur fiche produit)
- `Breadcrumb` (parcours catégorie → produit)
- `Pagination` (la boutique n'en a pas — soit infinite scroll non implémenté, soit limite implicite)
- `Skeleton` (placeholder image / liste — actuellement aucun)
- `StarRating` (les avis existent en BDD mais aucun composant d'affichage)
- `Tooltip`, `Dropdown`, `Empty state` génériques

---

## 3. Liens et CTA

### 3.1 Header (desktop)

```
Logo → /
Colliers          → /boutique?categorie=colliers
Bagues            → /boutique?categorie=bagues
Bracelets         → /boutique?categorie=bracelets
Boucles d'oreilles → /boutique?categorie=boucles-d-oreilles
Accessoires       → /boutique?categorie=accessoires
Packs             → /boutique?type=pack
Promos            → /boutique?badge=promo

🔍 Recherche      → SearchModal (5 tendances pré-définies)
👤 Compte/Admin   → /connexion (anon) / /admin (admin) / /compte (user)
❤️ Favoris        → /compte/favoris (avec redirect_to si non auth)
🛍 Panier         → CartDrawer
```

### 3.2 Footer

4 colonnes : **Boutique** (6 liens), **La marque** (6 liens), **Aide** (8 liens), **Mon compte** (6 liens) + barre légale (5 liens) + newsletter (action serveur `subscribeNewsletter`) + 5 réseaux sociaux + email.

### 3.3 CTAs principaux

| CTA | Source | Destination |
|---|---|---|
| Ajouter au panier (carte) | `ProductCard.handleQuickAdd` | Zustand `cart-store` + toast |
| Ajouter au panier (page produit) | `AddToCartButton` | Zustand + flying heart |
| Voir mon panier | `CartDrawer:221` | `/panier` |
| **Commander** | `CartDrawer:228` | `/checkout/identification` |
| Continuer mon shopping | `CartDrawer:89` | `/boutique` |
| Se connecter | `Header` | `/connexion` |
| Newsletter | `Footer` | server action `subscribeNewsletter({ source: "footer" })` |
| Favoris (carte) | `ProductCard` | Zustand `wishlist-store` (avec persistance DB si auth) |
| Recherche | `Header` → `SearchModal` | `/boutique?q=...` |
| Contact | `Footer` | `/contact` |

---

## 4. Données : qui voit quoi

### 4.1 Architecture

- **3 clients Supabase** : navigateur (`anon key`), serveur SSR (`anon key + cookies`), service role (`SUPABASE_SERVICE_ROLE_KEY`, jamais exposé client).
- **Auth** : Supabase Auth, magic link + password. Trigger SQL `handle_new_user()` crée la ligne `profiles`.
- **Identification admin** : colonne `profiles.role` (enum `customer | support | editor | admin | super_admin`). Vérifiée via helper `requireAdminRole()` côté server action et via `AdminShell` côté layout.
- **Stores Zustand** : `cart-store` (sync vers `/api/cart/sync` debounced 800ms), `wishlist-store`.

### 4.2 Tables Supabase (54)

Domaines :

- **Catalogue** (8) : `categories`, `collections`, `products`, `product_variants`, `product_media`, `product_attributes`, `product_relations`, `product_tags`
- **Packs** (3) : `packs`, `pack_items`, `pack_variant_options`
- **Avis** (2) : `reviews`, `review_responses`
- **Utilisateurs** (5) : `profiles`, `addresses`, `wishlists`, `notification_preferences`, `saved_sizes`
- **Panier** (2) : `carts`, `cart_items`
- **Commandes** (8) : `orders`, `order_items`, `payments`, `invoices`, `applied_discounts`, `shipments`, `shipment_items`, `tracking_events`
- **SAV** (4) : `tickets`, `ticket_messages`, `returns`, `return_items`
- **Loyauté** (2) : `loyalty_tiers`, `loyalty_transactions`
- **Logistique** (2) : `shipping_zones`, `shipping_methods`
- **Promotions** (1) : `discount_codes`
- **Inventaire** (1) : `inventory`
- **Contenu** (4) : `faq_articles`, `blog_posts`, `cms_pages`, `banners`
- **Marketing** (3) : `email_campaigns`, `abandoned_carts`, `email_logs`
- **Système** (3) : `audit_logs`, `settings`, `contact_messages`

RLS : **activée sur les 54 tables**. `service_role` a `FOR ALL USING (true)` partout.

### 4.3 Matrice d'accès

| Ressource | Visiteur anonyme | Client connecté | Admin |
|---|---|---|---|
| Catalogue (produits, packs, catégories, médias) | R (`is_active=true`) | R | R/W via service_role |
| Avis | R (`is_approved=true`) | R + C (own) | Modération R/W |
| Profil, adresses, favoris, tailles, prefs notif | ✗ | CRUD (own) | R/W (service_role) |
| Panier | R/W via `session_id` | R/W via `user_id` | R via service_role |
| Commandes, paiements, factures, expéditions | ✗ | R (own) | R/W |
| Tickets, retours | ✗ | C + R (own) | R/W (assignation, statut) |
| Blog, pages CMS, FAQ, bannières | R (publié) | R (publié) | R/W |
| Newsletter, contact | C (form) | C | R |
| Loyalty, shipping, codes promo | R (actifs) | R (actifs) | R/W |
| Audit logs, settings, email logs | ✗ | ✗ | R (W via service_role) |
| Inventory | ✗ | ✗ | R (via service_role) |

### 4.4 Server actions (36)

Conventions :
- Mutations client → server : fichier `actions.ts` colocalisé avec la page (`src/app/.../actions.ts`).
- Helpers transverses : `src/lib/actions/*.ts` (cart, newsletter, contact).
- Toutes les actions admin commencent par `await requireAdminRole()`.
- Toutes les actions compte commencent par `await requireAuth()` (à confirmer sur chacune).

Validation : **inégale** — certaines utilisent Zod (`fetchCartCrossSell`), d'autres font de la validation inline (`updateProfile` : `.trim().length < 2`), et quelques-unes n'en ont pas du tout. À standardiser.

### 4.5 Variables d'environnement

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.

Services externes : Supabase, Stripe, Resend, Sentry, Vercel (Analytics + Speed Insights + Cron).

---

## 5. Pages isolées / orphelines / cassées

### 5.1 Liens cassés (1)

| Lien | Source | Problème |
|---|---|---|
| `/aide/retours` | `src/app/(storefront)/retours/page.tsx:334` | La page n'existe pas. Devrait pointer vers `/retours` (boucle) ou `/aide` ou être supprimé. |

### 5.2 Pages publiques existantes mais non linkées depuis Header/Footer

| Page | Existe | Linkée | Sévérité |
|---|---|---|---|
| `/equipe` | ✓ | ✗ | Moyenne — on s'attend à un lien depuis `/a-propos` |
| `/mediation` | ✓ | ✗ depuis Footer (pourtant prévu) | Moyenne (obligation légale) — **à vérifier dans Footer** |
| `/accessibilite` | ✓ | Footer (mini-bar) | OK |
| `/desinscription` | ✓ | Email uniquement | OK (intentionnel) |
| `/newsletter/confirme` | ✓ | Email uniquement | OK (intentionnel) |
| `/styleguide` | ✓ | ✗ | OK (page interne dev) |
| `/presse` | ✓ | ✗ | Faible — peut être ajouté à `/a-propos` |
| `/recrutement` | ✓ | ✗ | Faible |
| `/suivi` | ✓ | ✗ direct (accédé via `/compte/commandes/[id]/suivi`) | OK |
| `/p/[slug]` (CMS pages) | ✓ | ✗ | **À vérifier** : si l'admin crée des pages CMS, comment les rend-on découvrables ? Pas de menu CMS dans Header/Footer. |
| `/pack/[slug]` | ✓ | indirect via `/boutique?type=pack` | OK |
| `/compte/paiement` | ✓ | sidebar compte ? | À vérifier |
| `/compte/notifications` | ✓ | sidebar compte ? | À vérifier |
| `/compte/tailles` | ✓ | sidebar compte ? | À vérifier |
| `/compte/avis` | ✓ | sidebar compte ? | À vérifier |

### 5.3 Composants orphelins

- `src/components/Fr.tsx` — typographie française. **0 import**. Choix : intégrer ou supprimer.
- `src/components/product/AnimatedProductGrid.tsx` — grille produit animée. **0 import**. La boutique fait `products.map(...)` à la place.

### 5.4 Anomalies de contenu (visibles dans la screenshot)

- **Cartes blog : images cassées**. Le composant `BlogList` lit `coverImageUrl`. Sur les 3 articles affichés, l'attribut `alt` apparaît à la place de l'image (« Tendances bijoux floraux 2026 », etc.) → soit la colonne `cover_image_url` est `null` côté Supabase, soit l'URL stockée pointe vers un asset 404. **Action** : ouvrir l'admin `/admin/blog` et redéfinir les visuels, ou fixer le fallback dans `BlogList`.

---

## 6. Points forts

1. **Architecture Next.js 16 propre** — route groups bien exploités (`(auth)`, `(storefront)`, `(checkout)`), layouts hiérarchisés.
2. **Cache strategy granulaire** — `revalidate: 300` storefront, `60` admin, `30` ventes/stocks, `force-dynamic` zones sensibles.
3. **SEO** — `generateMetadata` + `generateStaticParams` sur les 4 routes dynamiques publiques (`produit`, `pack`, `blog`, `p`), JSON-LD via composant `JsonLd`, sitemap exhaustif (37 statiques + dynamiques).
4. **Fallbacks UX** — `error.tsx`, `not-found.tsx` (global + storefront), `loading.tsx`.
5. **Sécurité données** — RLS activée sur toutes les tables, service_role isolé côté serveur, magic link auth, signatures webhooks Stripe/Resend, Bearer `CRON_SECRET` sur les jobs.
6. **Back-office complet** — 41 pages admin couvrant catalogue, ventes, support, contenu, marketing, paramètres. RichTextEditor TipTap, ImageUploader avec compression HEIC/JPG, drag-and-drop dnd-kit.
7. **Couverture fonctionnelle e-commerce** — toutes les pages clés présentes : auth, panier, checkout 3 étapes, confirmation, compte (17 sous-pages), retours, tickets, fidélité, parrainage, gift card, sur-mesure, blog, FAQ, pages légales (CGV, mentions, RGPD, cookies, médiation, accessibilité).
8. **Stripe + Resend + Sentry** intégrés.

---

## 7. Points faibles

| # | Catégorie | Problème |
|---|---|---|
| 1 | **Lien cassé** | `/aide/retours` (1 occurrence) |
| 2 | **Composants orphelins** | `Fr.tsx`, `AnimatedProductGrid.tsx` |
| 3 | **UI / Design system incomplet** | Pas de `Input`, `Select`, `Modal`, `Accordion`, `Tabs`, `Breadcrumb`, `Pagination`, `Skeleton`, `StarRating` réutilisables → cohérence visuelle dépendante de chaque page |
| 4 | **Validation server actions inégale** | Mélange Zod / inline / aucune. À standardiser sur Zod (cf. `cart.ts` comme modèle). |
| 5 | **Types désynchronisés** | `src/types/database.ts` (manuel, 414 lignes) divergent de `src/types/supabase.ts` (généré). Le manuel n'inclut pas `gift_cards`, ni les rôles `support` / `editor` / `super_admin`. Risque d'erreurs runtime. |
| 6 | **Pas de pagination boutique** | `/boutique` ne semble pas paginer ni infinite-scroller. Limite implicite ? À auditer pour catalogue volumineux. |
| 7 | **Pas d'affichage des avis** | La table `reviews` existe, server action `createReview` existe, mais aucun composant d'affichage (`StarRating`, distribution, liste) → la feature est invisible côté front. |
| 8 | **Blog : images de couverture manquantes** | Fallback inexistant côté UI quand `cover_image_url` est null/cassée. |
| 9 | **CMS pages non découvrables** | `/p/[slug]` rend les pages CMS, mais aucun menu Header/Footer n'expose ces pages — l'admin doit linker à la main depuis du contenu. |
| 10 | **Pas de field-level RLS** | Un client connecté peut potentiellement modifier des champs sensibles de ses propres tickets/retours (priority, assigned_to, status) car la policy update est par ligne, pas par colonne. À blinder côté server action. |
| 11 | **Soft-delete absent** | Les `DELETE` SQL retirent vraiment les lignes — incompatible avec un audit trail e-commerce strict (retours, factures). |
| 12 | **Pas de field-level Zod sur `reviews.rating`** | RLS ne contraint pas la valeur (1–5) ; à valider côté server action. |
| 13 | **Newsletter exposée au seul Footer** | Pas d'incentive contextuel (popup -10 %, capture exit-intent, blocs newsletter sur produit/blog) → conversion sous-optimale. |
| 14 | **Pas de breadcrumb sur produit/catégorie** | UX et SEO (BreadcrumbList JSON-LD manquant). |
| 15 | **Cron secret silencieux** | Si `CRON_SECRET` est vide en prod, les jobs renvoient probablement 503 — absence de monitoring d'alerte. |

---

## 8. Ce qui manque (vraiment manquant, pas juste « à améliorer »)

| Manque | Impact |
|---|---|
| **Page de recherche** dédiée (`/recherche?q=...`) | `SearchModal` redirige vers `/boutique?q=...` → la boutique gère la recherche. OK fonctionnellement, mais pas de page autonome avec « 0 résultat / suggestions ». À auditer dans `BoutiqueContent`. |
| **Affichage des avis** côté front (étoiles + distribution + liste sur fiche produit) | Feature invisible pour le client. |
| **Affichage de la fidélité** dans le tunnel (« vous gagnerez X points ») | Le programme existe en BDD mais reste abstrait. |
| **Bandeau d'urgence / promo sitewide** | Le composant `banners` existe en admin mais sa surface d'affichage côté storefront n'est pas évidente. À vérifier si un composant `<Banners />` est rendu dans le `Header` ou `Footer`. |
| **Page « Suivre ma commande sans compte »** | `/suivi` existe mais sans UI claire (saisie n° commande + email) : à valider. |
| **Composant pagination + filtres avancés sur boutique** | Pour scaler le catalogue. |
| **Bandeau popup newsletter (exit-intent ou page-load avec fréquence)** | Aujourd'hui uniquement dans le Footer. |
| **Page erreur paiement / commande échouée** | `/checkout/confirmation/[orderId]` couvre le succès, mais pas l'échec explicite. |
| **Carte du site (HTML)** publique | `sitemap.ts` est XML (SEO) ; un sitemap HTML aiderait découvrabilité interne. |
| **Régénération automatique des types Supabase** | Aucune CI visible pour `supabase gen types typescript`. |

---

## 9. Plan d'action priorisé

### P0 — Correctifs immédiats (< 1h)

1. **Corriger le lien cassé** `src/app/(storefront)/retours/page.tsx:334` : remplacer `/aide/retours` par `/aide` ou supprimer le bouton.
2. **Supprimer ou intégrer les 2 composants orphelins** (`Fr.tsx`, `AnimatedProductGrid.tsx`).
3. **Vérifier les `cover_image_url`** dans `blog_posts` côté Supabase et ajouter un placeholder par défaut dans `BlogList` quand l'image est absente/erronée.

### P1 — Découvrabilité / cohérence UX (1-2 jours)

4. Ajouter dans `Footer` (ou `Header` selon design) les liens vers `/equipe`, `/presse`, `/recrutement` (depuis « La marque ») et `/mediation` (mini-bar légale).
5. Ajouter un **`Breadcrumb`** sur `/produit/[slug]` et `/boutique` (avec JSON-LD `BreadcrumbList`).
6. Construire un **`StarRating` + bloc avis** sur `/produit/[slug]`.
7. Vérifier que `BoutiqueContent` gère bien la pagination/infinite scroll ; sinon implémenter.

### P2 — Qualité code (3-5 jours)

8. **Standardiser la validation** : Zod systématique sur toutes les server actions, helper `safeAction()` partagé.
9. **Régénérer les types Supabase** (`supabase gen types`) et **supprimer `src/types/database.ts`** si redondant, ou le garder uniquement comme façade typée.
10. **Composants de design system manquants** : `Input`, `Select`, `Textarea`, `Checkbox`, `Modal`, `Accordion`, `Tabs`, `Skeleton` dans `src/components/ui/`. Migrer admin et compte progressivement.
11. **Field-level guard** sur server actions tickets/retours (ne pas laisser l'utilisateur modifier `priority`, `assigned_to`, `status`).

### P3 — Marketing / conversion (1-2 semaines)

12. **Popup newsletter** (exit-intent ou délai) avec règle de fréquence (cookie / localStorage).
13. **Bandeau promo sitewide** branché sur `banners` (admin → site).
14. **Page « Suivre ma commande sans compte »** réelle.
15. **Affichage fidélité** dans le tunnel checkout et fiche produit.

---

## Annexes

### A. Inventaire des liens internes (40 cibles distinctes)

```
/admin, /admin/blog, /admin/blog/nouveau, /admin/categories, /admin/clients,
/admin/collections, /admin/commandes, /admin/faq, /admin/faq/nouveau,
/admin/packs, /admin/pages, /admin/pages/nouveau, /admin/produits,
/admin/produits/nouveau, /admin/tickets, /aide, /aide/retours (CASSÉ),
/atelier, /blog, /boutique, /cgv, /checkout/identification,
/compte/commandes, /compte/fidelite, /compte/profil, /compte/retours,
/compte/tickets, /compte/tickets/nouveau, /confidentialite, /connexion,
/contact, /cookies, /garantie, /guide-des-tailles, /inscription,
/mentions-legales, /mot-de-passe-oublie, /panier, /recrutement, /suivi
```

### B. Fichiers/lignes clés à modifier pour P0

- `src/app/(storefront)/retours/page.tsx:334` → corriger l'URL.
- `src/components/Fr.tsx` → supprimer ou intégrer.
- `src/components/product/AnimatedProductGrid.tsx` → supprimer ou intégrer dans `BoutiqueContent`.
- `src/app/(storefront)/blog/BlogList.tsx` → ajouter fallback image.

### C. Statistiques

| Indicateur | Valeur |
|---|---|
| Pages | 102 |
| Layouts | 24 |
| API routes | 14 |
| Tables Supabase | 54 |
| Server actions | ~36 |
| Composants UI | 26 (24 utilisés, 2 orphelins) |
| Liens internes uniques | 40 |
| Liens cassés | 1 |
| Pages publiques non linkées (effectivement orphelines) | ~11 |
