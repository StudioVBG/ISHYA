---
name: admin-guide
description: Documentation détaillée du back-office admin ISHYA (Next.js + Supabase). À utiliser dès qu'on travaille sur une page sous /admin, qu'on touche à un actions.ts admin, qu'on ajoute une entrée à la sidebar (AdminShell), qu'on modifie une table Supabase liée (products, orders, returns, tickets, etc.), ou que l'utilisateur pose une question du type "que fait la page X de l'admin", "où est gérée la modération des avis", "comment ajouter une nouvelle section admin".
---

# Back-office Admin ISHYA

Stack : **Next.js (App Router) + Supabase + TanStack Table + Framer Motion + Sonner**.
Toutes les pages sont en `force-dynamic` (pas de cache statique) et protégées par double vérification de rôle (middleware + layout).

---

## 0. Architecture globale

### Sécurité
- **`src/lib/supabase/middleware.ts`** : valide la session Supabase, redirige vers `/connexion?redirect_to=/admin` si non connecté, vers `/` si rôle ≠ `admin`.
- **`src/app/admin/layout.tsx`** : revérifie via `supabase.auth.getUser()` + lecture `profiles.role`. Affiche `AdminShell` qui contient sidebar + header + main.
- **`src/lib/auth/require-admin.ts`** : helper `requireAdminRole(allowed = ["admin"])` utilisé en tête de chaque server action et chaque route API admin. Retourne `{ ok, userId, role } | { ok:false, error }`.

### Tables de rôle
- `profiles.role` (enum `user_role` : customer / support / editor / admin / super_admin)
- `admin_users` (FK vers `admin_roles`, métadonnées : last_login_at, is_active)
- `admin_roles` (permissions JSONB — préparé pour contrôle granulaire futur, non utilisé en UI aujourd'hui)
- `audit_logs` (user_id, action, table_name, record_id, old_data/new_data JSONB, ip_address)

### Sidebar (`src/app/admin/AdminShell.tsx`)
7 groupes — toutes les entrées sont visibles pour tous les admins (pas de filtrage par permission côté UI).

| Groupe | Entrée | Route | Icône lucide |
|---|---|---|---|
| Principal | Dashboard | `/admin` | LayoutDashboard |
| Catalogue | Produits / Catégories / Collections / Packs | `/admin/produits` etc. | Package, FolderTree, Layers, Gift |
| Ventes | Commandes / Clients / Stocks / Promotions | `/admin/commandes` etc. | ShoppingCart, Users, Warehouse, Percent |
| Support | Retours / Tickets / FAQ / Avis | `/admin/retours` etc. | RotateCcw, Headphones, HelpCircle, Star |
| Contenu | Blog / Pages / Bannières / SEO | `/admin/blog` etc. | FileText, LayoutTemplate, Image, Search |
| Analyse | Rapports | `/admin/rapports` | BarChart3 |
| Système | Paramètres / Équipe / Audit | `/admin/parametres` etc. | Settings, UserCog, Shield |

Footer sidebar : "Voir la boutique" + "Déconnexion" (server action `adminSignOut` dans `src/app/admin/actions.ts`).

### Patterns transverses
- **Server actions** : un fichier `actions.ts` par route, chaque action commence par `requireAdminRole()` puis `revalidatePath()` sur les chemins concernés (storefront + admin).
- **Tables** : TanStack React Table (tri / filtre / pagination).
- **Modales** : Framer Motion + portails.
- **Toasts** : `sonner`.
- **Upload images** : `src/components/admin/ImageUploader.tsx` — gère HEIC iPhone, compression, drag & drop, bucket Supabase Storage `products-media`, photo primaire, réordonnancement.
- **API admin** : `src/app/api/admin/products/search/route.ts` — recherche produits protégée par `requireAdminRole`.
- **Notifications** : `NotificationBell.tsx` dans le header → 4 compteurs temps réel (commandes pending, retours requested, tickets ouverts, avis non modérés). Source : `src/lib/queries/admin-notifications.ts`.

---

## 1. Dashboard — `/admin` (`page.tsx` + `DashboardView.tsx`)

**Rôle** : vue synthétique d'ouverture du back-office.

**UI** :
- 4 cartes KPI : CA du jour, Commandes du jour, Panier moyen, Total clients.
- Graphique **Recharts** linéaire : CA des 30 derniers jours.
- Tableau Top 5 produits (image · nom · qté vendue · revenu).
- Panel **Alertes** : ruptures de stock (3 max), retours en attente, tickets ouverts.
- Tableau 8 dernières commandes → clic vers `/admin/commandes/[id]`.

**Données** : `getAdminDashboardStats()`, `getAdminOrders(limit:8)`, `getAdminLowStock(limit:3)` dans `src/lib/queries/admin*`.

**Tables Supabase** : `orders`, `order_items`, `products`, `product_variants`, `inventory`, `returns`, `support_tickets`, `profiles`.

---

## 2. Produits — `/admin/produits`

**Rôle** : CRUD complet du catalogue (variantes, médias, propriétés, SEO).

**UI liste** (`ProduitsView.tsx`) :
- Recherche + filtres catégorie & statut (Actif / Brouillon).
- Sélection multi (cases à cocher) → suppression groupée.
- Bouton **Nouveau produit** → `/admin/produits/nouveau`.
- Colonnes : Image · Nom · SKU · Prix · Stock total · Catégorie · Statut · Actions (éditer / supprimer).

**UI form** (`ProductForm.tsx`, utilisé pour create + edit) — sections :
1. **Infos générales** : name, slug (auto), shortDescription, description, basePrice, comparePrice, isActive.
2. **Propriétés** : material, weight, dimensions, careInstructions, isNickelFree, isFeatured, isNew.
3. **SEO** : metaTitle, metaDescription, metaKeywords.
4. **Variantes** : tableau dynamique (sku, attributes JSON, price, stock_quantity, low_stock_threshold).
5. **Médias** : drag & drop via `ImageUploader`, photo primaire, ordre.
6. **Catégories & Collections** : sélection multi.

**Server actions** (`actions.ts`) :
- `createProduct`, `updateProduct`, `deleteProduct`
- `upsertVariant`, `deleteVariant`, `replaceVariants`
- `upsertMedia`, `deleteMedia`, `replaceMedia`

**Tables** : `products`, `product_variants`, `product_media`, `product_categories`, `product_collections`, `inventory`.

**Liens** : Catégories, Collections, Stocks, Avis (avis affichés sur la fiche produit).

---

## 3. Catégories — `/admin/categories`

**Rôle** : arborescence parent/enfant pour la navigation boutique.

**UI** : tableau (Nom · Slug · Parent · Nb produits · Ordre · Statut · Actions). Modales create/edit. Page `[id]` liste les produits de la catégorie.

**Champs form** : name, slug (auto-généré), description, imageUrl, parentId, sortOrder, isActive.

**Actions** : `createCategory`, `updateCategory`, `deleteCategory`.

**Table** : `categories` (avec `parent_id` self-reference). Triggers de revalidation storefront.

---

## 4. Collections — `/admin/collections`

**Rôle** : regroupements thématiques **temporaires** (Noël, soldes, nouveautés).

Différence avec les catégories : les collections ont des **dates de début/fin** (`startsAt`, `endsAt`) et servent au merchandising temporel.

**UI** : tableau (Nom · Slug · Période · Nb produits · Statut). Modale avec datetime-local. Page `[id]` liste les produits.

**Champs** : name, slug, description, imageUrl, startsAt, endsAt, sortOrder, isActive.

**Table** : `collections` + jointure `product_collections`.

---

## 5. Packs — `/admin/packs`

**Rôle** : offres promotionnelles produits (différentes des codes promo qui sont au checkout).

**Types** : `percentage`, `fixed_amount`, `free_shipping`, `buy_x_get_y`.

**UI** : tableau (Nom · Type · Valeur · Période · Statut). Modale create/edit, conditions d'accès (panier min, produits inclus). Page `[id]` détaille les produits du pack.

**Table** : `packs`.

---

## 6. Stocks — `/admin/stocks`

**Rôle** : niveau d'inventaire par variante + alertes.

**UI** :
- Tableau : Produit · Variante · SKU · Quantité (édition inline) · Seuil bas · Statut (badge OK / Stock bas / Rupture).
- Filtres OK / Bas / Rupture, recherche produit ou SKU, compteurs en haut de page.

**Action** : `updateVariantStock(variantId, quantity)` — synchronise `product_variants.stock_quantity` ↔ `inventory`.

**Tables** : `product_variants`, `inventory`.

**Liens** : alimente l'alerte rupture du Dashboard.

---

## 7. Commandes — `/admin/commandes`

**Rôle** : suivi de bout en bout du cycle de vie commande.

**UI liste** (`CommandesView.tsx`) :
- Tableau : N° · Client · Date · Statut (badge) · Montant.
- Recherche (n°, email, nom).
- Filtre statut : pending, paid, processing, shipped, delivered, cancelled, refunded, partial_refund, on_hold, failed.
- Bouton **Export CSV**.

**UI détail** `[id]/OrderDetailView.tsx` :
- Adresses livraison & facturation.
- Lignes article : produit, variante, qté, prix, miniatures.
- Statut commande + boutons de transition (pending → confirmed → processing → shipped → delivered).
- Notes internes & timeline d'événements.
- Lien client, lien retour si applicable.

**Tables** : `orders`, `order_items`, `order_addresses`.

**Liens** : Clients, Retours, Tickets.

---

## 8. Retours — `/admin/retours`

**Rôle** : workflow de demande de retour produit.

**Cycle** : `requested → approved | rejected → shipped_back → received → inspected → refunded | exchanged | closed`.

**UI** :
- Tableau : Commande · Client · Produit · Raison · Statut · Montant.
- Boutons de transition inline : Approuver / Refuser / Marquer reçu / Inspecter / Rembourser.
- Badges raison : wrong_size, defective, not_as_described, changed_mind, arrived_late, wrong_item, other.

**Action** : `updateReturnStatus(returnId, newStatus, refundAmount?)` — pose le timestamp correspondant (`approvedAt`, `receivedAt`, `refundedAt`).

**Table** : `returns` (ou `product_returns` selon migration).

**Liens** : commande parente, client, ticket SAV éventuel.

---

## 9. Clients — `/admin/clients`

**Rôle** : annuaire CRM + fiche client.

**UI liste** (`ClientsView.tsx`) :
- Tableau : Nom · Email · Téléphone · Niveau fidélité (Bronze/Argent/Or/Platine) · Nb commandes · Total dépensé · Dernier achat.
- Recherche, filtre fidélité, bouton **Export CSV**.

**UI détail** `[id]/ClientDetailView.tsx` :
- Profil : nom, email, téléphone, adresses.
- Historique commandes (lien vers chaque commande).
- Total dépensé, nombre de commandes, points et niveau de fidélité.

**Tables** : `profiles`, `orders`, `addresses`.

---

## 10. Promotions — `/admin/promotions`

**Rôle** : codes promo applicables au checkout (≠ packs qui sont au niveau produit).

**UI** : tableau (Code · Type · Valeur · Période · Utilisations · Statut). Modale 11 champs.

**Champs** : code (UPPERCASE), discountType (`percentage` | `fixed_amount` | `free_shipping` | `buy_x_get_y`), value, minOrderAmount, maxDiscount, perUserLimit, totalLimit, startsAt, endsAt, isActive.

**Table** : `discount_codes`.

---

## 11. Bannières — `/admin/bannieres`

**Rôle** : visuels promotionnels du site.

**Placements** : `hero`, `category`, `sidebar`, `popup`, `footer`, `announcement`.

**UI** : grille de cartes 1/2/3 colonnes selon écran, image 2:1 + titre + statut + placement. Modale create/edit.

**Champs** : title, subtitle, imageUrl, linkUrl, placement, sortOrder, startsAt, endsAt, isActive.

**Table** : `banners`.

---

## 12. Blog — `/admin/blog`

**Rôle** : articles publiés sur le blog public.

**Routes** : `/admin/blog` (liste) · `/nouveau` (création) · `/[id]` (édition).

**UI liste** (`BlogList.tsx`) : aperçu image 80×56, titre, slug, statut, tags, auteur/date. Recherche + filtres Tous/Publiés/Brouillons + compteurs.

**Form** (`BlogPostForm.tsx`) : title, slug, coverImage, content, tags[], isPublished, publishedAt, authorId.

**Table** : `blog_posts`.

---

## 13. Pages CMS — `/admin/pages`

**Rôle** : pages statiques accessibles via `/p/{slug}` (CGV, mentions légales, pages perso).

**Routes** : `/admin/pages` · `/nouveau` · `/[id]`.

**UI** : liste avec icône + titre + slug + statut + date màj + lien "Voir la page publique" si publiée.

**Form** : title, slug, content, isPublished.

**Table** : `cms_pages`.

---

## 14. FAQ — `/admin/faq`

**Rôle** : FAQ publique sur `/aide`, regroupée par catégorie.

**Routes** : `/admin/faq` · `/nouveau` · `/[id]`.

**UI** : recherche, questions groupées par catégorie, par ligne : toggle visibilité (Eye/EyeOff), édition, suppression.

**Form** : question, answer, category, isActive.

**Table** : `faq_articles`.

---

## 15. SEO — `/admin/seo`

**Rôle** : config référencement global (les SEO par produit/page sont sur leur fiche respective).

**UI** — 3 sections :
1. **Page d'accueil** : metaTitle (70c), metaDescription (160c), ogImageUrl (1200×630), defaultKeywords.
2. **Réseaux sociaux** : Twitter handle (@…).
3. **Vérifications** : Google Search Console token, Bing Webmaster token.

**Stockage** : table `settings` avec préfixe de clé `seo.*`.

---

## 16. Avis — `/admin/avis`

**Rôle** : modération des avis clients avant publication storefront.

**UI** : recherche (produit / auteur / contenu), filtres Tous / En attente / Approuvés. Cartes avis avec note étoiles, titre, contenu, badge "achat vérifié", boutons. Bordure jaune si pending, verte si approved.

**Actions** : approuver / désapprouver / supprimer.

**Table** : `reviews`.

**Liens** : fiche produit `/produit/{slug}`.

---

## 17. Tickets / SAV — `/admin/tickets`

**Rôle** : gestion du support client.

**Routes** : `/admin/tickets` · `/[id]` (avec `TicketConversation.tsx`).

**UI liste** :
- Recherche (sujet, client, n° commande).
- Filtres statut : `open`, `in_progress`, `waiting_customer`, `waiting_internal`, `resolved`, `closed`.
- Filtres priorité : `low`, `medium`, `high`, `urgent`.
- Cartes ticket avec dropdowns inline statut/priorité + bouton **M'assigner**.

**UI détail** : conversation complète, ajout messages, lien commande/client.

**Données** : sujet, catégorie (`order_issue`, `product_question`, `shipping`, `return_exchange`, `payment`, `account`, `complaint`, `other`), client, commande liée, assignedTo, channel.

**Tables** : `support_tickets`, `support_messages`.

---

## 18. Équipe — `/admin/equipe`

**Rôle** : gérer les utilisateurs admin.

**UI** : tableau Membre (nom + email) · Rôle (dropdown) · Inscription · Dernière connexion · Statut · Actions. Indicateur "Vous" pour la ligne courante. Garde-fou : impossible de retirer son propre rôle admin.

**Actions** : changer rôle (admin ↔ customer), activer/désactiver compte.

**Tables** : `auth.users` + `profiles.role` + `admin_users` / `admin_roles`.

---

## 19. Rapports — `/admin/rapports`

**Rôle** : analytics business 30j vs 30j précédents.

**UI** :
- 4 cartes KPI **avec deltas %** : CA, Commandes, Panier moyen, Nouveaux clients.
- Bar chart : Top 10 produits (30j) — revenu + quantité.
- Bar chart : CA par catégorie (30j).
- Grille répartition statuts commandes (toutes périodes).

**Tables** : `orders`, `order_items`, `products`, `categories`, `profiles`.

---

## 20. Audit — `/admin/audit`

**Rôle** : journal des actions admin pour traçabilité.

**UI** : recherche (action / table / user / id), dropdown filtre par table, tableau Date · Action (badge couleur : insert vert / update bleu / delete rouge / login violet / logout gris) · Table · ID (8 premiers car.) · Utilisateur · IP. Limite 200 dernières entrées.

**Table** : `audit_logs` (avec `old_data` / `new_data` JSONB pour diff).

---

## 21. Paramètres — `/admin/parametres`

**Rôle** : config globale clé / valeur JSON.

**UI** : liste paramètres (clé monospace · description · aperçu valeur · date màj). Modale create/edit. Warning "Modifiez avec précaution". Clé non modifiable après création.

**Exemples de clés** : `contact_email`, `business_hours`, `site_name`, `seo.*`.

**Table** : `settings` (key UNIQUE, value JSONB, updated_by FK auth.users).

---

## 22. NotificationBell (header)

Composant `src/app/admin/NotificationBell.tsx`.

**UI** : icône cloche avec badge rouge (terracotta), total max "99+". Dropdown animé Framer Motion.

**4 alertes** :
| Compteur | Source | Lien |
|---|---|---|
| Commandes en attente | `orders.status = 'pending'` | `/admin/commandes?status=pending` |
| Retours à traiter | `returns.status = 'requested'` | `/admin/retours` |
| Tickets ouverts | `support_tickets.status IN (open, in_progress, waiting_internal)` | `/admin/tickets` |
| Avis à modérer | `reviews.is_approved = false` | `/admin/avis` |

Source : `src/lib/queries/admin-notifications.ts` → `getAdminNotificationCounts()` (4 count en parallèle via `Promise.all`).

---

## 23. Carte des relations

```
Produit ─┬─► Catégories (n:n via product_categories)
         ├─► Collections (n:n via product_collections)
         ├─► Packs
         ├─► Variantes ─► Stocks/Inventaire
         ├─► Médias
         └─► Avis

Commande ─┬─► Client (profiles)
          ├─► OrderItems ─► Produits / Variantes
          ├─► Adresses
          ├─► Retours
          └─► Tickets SAV

Promotion (discount_codes) ─► Commandes
Bannières / Blog / Pages / FAQ / SEO ─► Storefront public
Settings / Équipe / Audit ─► Système
```

---

## 24. Quand ajouter une nouvelle section admin — checklist

1. Créer `src/app/admin/<nom>/page.tsx` + `<Nom>View.tsx` + `actions.ts`.
2. Mettre `export const dynamic = "force-dynamic"` dans `page.tsx`.
3. Premier appel de chaque server action : `await requireAdminRole()`.
4. Après mutation : `revalidatePath("/admin/<nom>")` + chemins storefront concernés.
5. Ajouter l'entrée dans `AdminShell.tsx` (groupe + icône lucide).
6. Si table Supabase nouvelle : migration dans `supabase/migrations/` + RLS policies + trigger d'audit.
7. Si compteur urgent → ajouter à `getAdminNotificationCounts` et à `NotificationBell`.
8. Tester avec un compte non-admin pour vérifier la redirection.
