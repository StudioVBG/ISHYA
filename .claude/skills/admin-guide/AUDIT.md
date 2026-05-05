# 🔎 Audit Admin ISHYA — Existant, Manquants, Connexions

> Comparaison code admin (`src/app/admin/*`, `src/lib/queries/admin*`) vs schéma SQL (`supabase/migrations/*`).

---

## 1. Vue d'ensemble

| Indicateur | Avant | Après Sprints 1-5 |
|---|---|---|
| Tables dans la base | 52 | **50** (admin_users + admin_roles supprimées) |
| Tables réellement utilisées par l'admin | 24 | **39** |
| Tables existantes mais sans UI admin | 19 ❌ | **9** ⚠️ (les restantes sont consultatives/techniques) |
| Pages admin existantes | 21 | **26** (+ messages, newsletter, cartes-cadeaux, livraison, paniers-abandonnés) |
| Manques fonctionnels critiques | 5 ❌ | **0** ✅ |
| Audit logs écrits | 0 fichiers | **10 fichiers** d'actions |

---

## 2. ✅ Connexions code ↔ DB conformes

| Page admin | Tables | OK |
|---|---|---|
| Dashboard | orders, order_items, products, product_variants, profiles, returns, tickets | ✅ |
| Produits | products, product_variants, product_media, product_categories, product_collections | ✅ |
| Catégories | categories, product_categories | ✅ |
| Collections | collections, product_collections | ✅ |
| Packs | packs, pack_items | ✅ |
| Stocks | product_variants, inventory | ✅ |
| Commandes | orders, order_items, shipments, payments | ✅ |
| Retours | returns, orders, profiles | ✅ |
| Clients | profiles, addresses, orders, reviews | ✅ |
| Promotions | discount_codes | ✅ (champs) |
| Bannières | banners | ✅ |
| Blog | blog_posts, profiles | ✅ |
| Pages CMS | cms_pages | ✅ |
| FAQ | faq_articles | ✅ |
| SEO | settings | ✅ |
| Avis | reviews, products, profiles | ✅ partiel |
| Tickets | tickets, ticket_messages | ✅ |
| Équipe | profiles | ✅ (admin_users / admin_roles supprimées — migration 007) |
| Rapports | orders, order_items, products, categories | ✅ |
| Audit | audit_logs | ⚠️ (lit mais rien n'écrit) |
| Paramètres | settings | ✅ |

---

## 3. ❌ Tables existantes sans UI admin (19)

Ces tables sont créées en base mais **aucune page admin** ne les gère.

### Fonctionnalités business fantômes (priorité haute)

| Table | Usage prévu | Priorité | Action |
|---|---|---|---|
| `newsletter_subscribers` | Inscriptions newsletter (form public l'écrit) | 🔴 Haute | Créer `/admin/newsletter` (liste, export, désabonnement) |
| `contact_messages` | Messages formulaire de contact | 🔴 Haute | Créer `/admin/messages` (boîte de réception) |
| `gift_cards` | Cartes cadeaux Stripe | 🔴 Haute | Créer `/admin/cartes-cadeaux` (liste, statut, génération manuelle) |
| `abandoned_carts` | Paniers abandonnés à relancer | 🟠 Moyenne | Créer `/admin/paniers-abandonnes` + relance email |
| `email_campaigns` | Campagnes emailing | 🟠 Moyenne | Créer `/admin/campagnes` |
| `email_logs` | Journal des emails envoyés (idempotence) | 🟠 Moyenne | Onglet dans `/admin/audit` ou page dédiée |

### Configuration logistique (priorité haute)

| Table | Usage prévu | Priorité | Action |
|---|---|---|---|
| `shipping_zones` | Zones d'expédition par pays | 🔴 Haute | À ajouter dans `/admin/parametres` ou nouvelle page |
| `shipping_methods` | Méthodes/tarifs de livraison | 🔴 Haute | Idem |
| `tracking_events` | Événements de suivi colis | 🟡 Basse | Webhook transporteur, pas urgent UI |

### Fidélité (priorité moyenne)

| Table | Usage prévu | Priorité | Action |
|---|---|---|---|
| `loyalty_tiers` | Paliers fidélité (Bronze/Argent/Or/Platine) | 🟠 Moyenne | Page `/admin/fidelite` (config paliers) |
| `loyalty_transactions` | Historique points par client | 🟠 Moyenne | Onglet dans détail client |

### Catalogue avancé

| Table | Usage prévu | Priorité | Action |
|---|---|---|---|
| `product_attributes` | Attributs clé/valeur du produit | 🟡 Basse | Section dans `ProductForm.tsx` |
| `product_relations` | Cross-sell, upsell, parures, similaires | 🟠 Moyenne | Onglet dans `/admin/produits/[id]` |
| `product_tags` | Tags produit | 🟡 Basse | Champ tags dans le form |
| `review_responses` | **Réponse de l'admin aux avis** | 🔴 Haute | Bouton "Répondre" dans `/admin/avis` |
| `pack_variant_options` | Options de variantes par pack | 🟡 Basse | Détail pack |

### Données client (consultation seulement)

| Table | Usage prévu | Priorité | Action |
|---|---|---|---|
| `wishlists` | Favoris clients | 🟡 Basse | Onglet dans détail client |
| `notification_preferences` | Préférences emails | 🟡 Basse | Onglet dans détail client |
| `saved_sizes` | Tailles sauvegardées | 🟡 Basse | Onglet dans détail client |
| `applied_discounts` | Promos appliquées par commande | 🟡 Basse | Bloc dans détail commande |

---

## 4. 🔴 Manques fonctionnels critiques

### 4.1 Audit logs ne sont pas écrits
- Table `audit_logs` existe et est lue par `/admin/audit`
- **Aucun trigger / aucun appel d'insertion** dans le code admin
- Conséquence : la page Audit affiche probablement une table **vide** en production
- **Fix** : soit ajouter un trigger SQL générique sur les tables sensibles (`AFTER INSERT/UPDATE/DELETE`), soit logger explicitement dans chaque server action via un helper `logAuditEvent()`

### 4.2 ✅ `admin_users` / `admin_roles` supprimées (migration 007)
- Le contrôle d'accès se fait sur `profiles.role = 'admin'` uniquement
- Tables `admin_users` / `admin_roles` étaient **jamais lues ni écrites** par le code
- **Décision retenue** (Sprint 5, option A) : suppression pour simplifier le schéma
- Si on a besoin un jour de permissions granulaires (super_admin, support, editor), repartir d'une nouvelle migration

### 4.3 RPC `decrement_variant_stock` non utilisée
- Fonction atomique présente en base
- Code admin fait `UPDATE product_variants SET stock_quantity = ?` non-atomique
- **Risque** : conditions de course en multi-utilisateur sur `/admin/stocks`
- **Fix** : remplacer les UPDATE manuels par `.rpc("decrement_variant_stock", ...)`

### 4.4 Réponse aux avis impossible
- Table `review_responses` existe
- `/admin/avis` ne propose qu'approuver / rejeter / supprimer
- **Fix** : ajouter un champ "Répondre" qui crée une `review_response`

### 4.5 Pas de gestion de la livraison
- `shipping_zones` / `shipping_methods` vides côté admin = **les méthodes affichées au checkout sont en dur** ou injectées via seed
- **Fix** : créer une UI minimale pour CRUD ces 2 tables

---

## 5. ⚠️ Champs SQL ignorés par l'UI admin

| Table.Colonne | Statut UI | Impact |
|---|---|---|
| `discount_codes.applicable_product_ids[]` | Non exposé | Impossible de cibler une promo sur certains produits |
| `discount_codes.applicable_category_ids[]` | Non exposé | Impossible de cibler par catégorie |
| `discount_codes.usage_count` | Non affiché | L'admin ne voit pas combien de fois un code a été utilisé |
| `discount_codes.buy_x_get_y` | Type accepté mais pas de config X/Y | Inutilisable en l'état |
| `categories.seo_title`, `seo_description` | Non vérifié — à confirmer dans le form catégorie | SEO catégories perdu |
| `products.is_nickel_free`, `is_featured`, `is_new` | Présents dans `ProductForm.tsx` | ✅ OK |
| `orders.idempotency_key` | Géré côté webhook Stripe | ✅ OK |
| `audit_logs.old_data / new_data` | Affichés en colonne mais aucun diff visuel | UX faible |

---

## 6. ⚙️ Storage & connexions

### Bucket `products-media`
- Utilisé en upload via `ImageUploader.tsx` ✅
- **Risque** : la suppression d'un `product_media` supprime la ligne SQL mais **ne supprime pas le fichier** dans le bucket. La colonne `product_media.storage_path` (migration 003) est prévue pour le nettoyage mais pas branchée.
- **Fix** : ajouter dans `deleteMedia()` un `admin.storage.from("products-media").remove([row.storage_path])`

### Service role bypass
- Toutes les server actions utilisent `createAdminClient()` (service_role key) → bypass RLS
- ✅ OK pour les actions admin
- ⚠️ Les policies RLS "admin only" sur `audit_logs`, `settings`, etc. sont décoratives (jamais évaluées via service_role)

---

## 7. 🧩 Cohérence des connexions inter-tables

| Relation attendue | État | Note |
|---|---|---|
| Produit ↔ Catégories (n:n) | ✅ via `product_categories` | OK |
| Produit ↔ Collections (n:n) | ✅ via `product_collections` | OK |
| Variantes ↔ Inventaire | ✅ trigger auto-création | OK |
| Commande ↔ Articles ↔ Variantes | ✅ FK propres + snapshots | OK (résilient à la suppression produit) |
| Commande ↔ Retours | ✅ via `returns.order_id` | OK |
| Ticket ↔ Commande ↔ Client | ✅ FK propres | OK |
| Pack ↔ Items ↔ Variantes | ✅ via `pack_items` + `pack_variant_options` | UI partielle (pas de gestion options variantes) |
| Avis ↔ Réponse | ❌ `review_responses` non utilisée | À implémenter |
| Commande ↔ Expédition ↔ Tracking | ⚠️ shipments OK, tracking_events vide | Webhook transporteur manquant |
| Client ↔ Fidélité | ❌ `loyalty_transactions` non écrit | Système de points non alimenté |

---

## 8. 📋 Plan d'action recommandé (ordonné)

### Sprint 1 — Combler les trous critiques (1–2 j)
1. **Logger les actions admin** dans `audit_logs` (helper + trigger)
2. **Page `/admin/messages`** (contact_messages)
3. **Page `/admin/newsletter`** (newsletter_subscribers, désabo, export)
4. **Page `/admin/cartes-cadeaux`** (gift_cards)

### Sprint 2 — Configuration logistique (2–3 j)
5. **Onglet Livraison dans `/admin/parametres`** (shipping_zones, shipping_methods)
6. **Réponses aux avis** (review_responses) dans `/admin/avis`

### Sprint 3 — Optimisation & marketing (3–5 j)
7. **Atomiciser le décrémentation stock** (RPC)
8. **Page `/admin/paniers-abandonnes`** (abandoned_carts + relance email)
9. **Champs `applicable_product_ids/categories` + `usage_count`** dans `/admin/promotions`
10. **Cross-sell / parures** dans la fiche produit (product_relations)

### Sprint 4 — Onglets contextuels (2 j)
11. Détail client : Wishlist, Préférences notif, Tailles, Points fidélité
12. Détail commande : Promos appliquées, Tracking événements
13. **Cleanup storage** (supprimer fichier au `deleteMedia`)

### ✅ Sprint 5 — Décision admin_users (terminé)
14. **Choix retenu** : suppression de `admin_users` / `admin_roles` via la migration `007_drop_admin_users_admin_roles.sql`
15. `profiles.role` reste l'unique source d'autorisation admin

---

## 9. 🛡️ Points de sécurité à valider

- ✅ Double check d'auth (middleware + layout)
- ✅ `requireAdminRole()` en tête de chaque server action
- ⚠️ Aucune écriture d'audit → impossible de tracer "qui a fait quoi"
- ⚠️ Pas de rate-limiting sur les actions admin
- ⚠️ Pas de 2FA pour les comptes admin
- ⚠️ Pas de tracking `last_login_at` admin dédié (à brancher sur `profiles.last_login_at` si besoin)
