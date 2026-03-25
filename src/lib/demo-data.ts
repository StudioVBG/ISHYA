import type {
  Category,
  Collection,
  Product,
  ProductVariant,
  ProductMedia,
  Review,
} from "@/types/database";
import type { ProductCardProduct } from "@/components/product/ProductCard";

// ─── Categories ──────────────────────────────────────────────────────────────

export const demoCategories: Category[] = [
  {
    id: "cat-001",
    parent_id: null,
    name: "Colliers",
    slug: "colliers",
    description:
      "Nos colliers artisanaux en fleurs séchées et résine, chaque pièce unique capture la beauté éternelle de la nature.",
    image_url:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
    position: 1,
    is_active: true,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "cat-002",
    parent_id: null,
    name: "Bagues",
    slug: "bagues",
    description:
      "Des bagues uniques ornées de véritables fleurs séchées emprisonnées dans la résine, pour un style naturel et raffiné.",
    image_url:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop",
    position: 2,
    is_active: true,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "cat-003",
    parent_id: null,
    name: "Bracelets",
    slug: "bracelets",
    description:
      "Bracelets délicats mêlant métal précieux et résine florale, pour une touche de poésie à votre poignet.",
    image_url:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
    position: 3,
    is_active: true,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "cat-004",
    parent_id: null,
    name: "Boucles d'oreilles",
    slug: "boucles-d-oreilles",
    description:
      "Boucles d'oreilles artisanales capturant la grâce des fleurs séchées dans des créations légères et élégantes.",
    image_url:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop",
    position: 4,
    is_active: true,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "cat-005",
    parent_id: null,
    name: "Accessoires",
    slug: "accessoires",
    description:
      "Accessoires floraux pour sublimer votre coiffure et votre tenue au quotidien.",
    image_url:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=600&fit=crop",
    position: 5,
    is_active: true,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "cat-006",
    parent_id: null,
    name: "Packs & Parures",
    slug: "packs-parures",
    description:
      "Ensembles assortis pour un look harmonieux et une idée cadeau parfaite.",
    image_url:
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&h=600&fit=crop",
    position: 6,
    is_active: true,
    created_at: "2025-01-15T10:00:00Z",
  },
];

// ─── Collections ─────────────────────────────────────────────────────────────

export const demoCollections: Collection[] = [
  {
    id: "col-001",
    name: "Printemps Éternel",
    slug: "printemps-eternel",
    description:
      "Une collection qui capture l'essence du renouveau printanier. Fleurs immortalisées dans la résine, couleurs pastel et éclats dorés pour une élégance intemporelle.",
    image_url:
      "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&h=600&fit=crop",
    is_active: true,
    start_date: "2025-03-01",
    end_date: null,
    created_at: "2025-01-10T10:00:00Z",
  },
  {
    id: "col-002",
    name: "Rose Sauvage",
    slug: "rose-sauvage",
    description:
      "Inspirée par la beauté brute des roses sauvages. Cette collection allie délicatesse et caractère avec des teintes terracotta et des formes organiques.",
    image_url:
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&h=600&fit=crop",
    is_active: true,
    start_date: "2025-02-14",
    end_date: null,
    created_at: "2025-01-10T10:00:00Z",
  },
  {
    id: "col-003",
    name: "Jardin Secret",
    slug: "jardin-secret",
    description:
      "Des pièces mystérieuses et poétiques évoquant un jardin caché. Fleurs rares, résine teintée et finitions dorées pour un style unique.",
    image_url:
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&h=600&fit=crop",
    is_active: true,
    start_date: "2025-04-01",
    end_date: null,
    created_at: "2025-01-10T10:00:00Z",
  },
  {
    id: "col-004",
    name: "Fleur de Lune",
    slug: "fleur-de-lune",
    description:
      "Une collection nocturne et romantique où les fleurs séchées brillent sous la lumière de la lune. Tons nacrés, argent et bleu nuit.",
    image_url:
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&h=600&fit=crop",
    is_active: true,
    start_date: "2025-05-01",
    end_date: null,
    created_at: "2025-01-10T10:00:00Z",
  },
  {
    id: "col-005",
    name: "Terre & Fleur",
    slug: "terre-et-fleur",
    description:
      "Un hommage à la connexion entre la terre nourricière et les fleurs qu'elle fait naître. Matières brutes, tons chauds et résine ambrée.",
    image_url:
      "https://images.unsplash.com/photo-1501004318855-b174af8a00fe?w=800&h=600&fit=crop",
    is_active: true,
    start_date: "2025-06-01",
    end_date: null,
    created_at: "2025-01-10T10:00:00Z",
  },
];

// ─── Products ────────────────────────────────────────────────────────────────

const now = "2026-03-01T10:00:00Z";

export const demoProducts: Product[] = [
  {
    id: "prod-001",
    name: "Collier Fleur d'Oranger",
    slug: "collier-fleur-d-oranger",
    description_short:
      "Pendentif délicat en résine avec de véritables fleurs d'oranger séchées sur chaîne dorée.",
    description_long:
      "Ce collier artisanal capture la beauté des fleurs d'oranger dans un pendentif en résine cristalline. Chaque pièce est unique, fabriquée à la main dans notre atelier.\n\nLa chaîne en plaqué or 18 carats s'ajuste parfaitement à tous les décolletés. Les fleurs d'oranger sont soigneusement sélectionnées et séchées avant d'être délicatement encapsulées dans la résine.",
    base_price: 45,
    compare_at_price: null,
    sku_prefix: "COL-FO",
    is_active: true,
    is_featured: true,
    category_id: "cat-001",
    collection_ids: ["col-001", "col-005"],
    material: "Plaqué or 18K, Résine",
    weight_g: 12,
    dimensions: "Pendentif: 2×1.5cm, Chaîne: 45cm+5cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie. Nettoyer avec un chiffon doux.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2026-02-15T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-002",
    name: "Collier Pétale de Rose",
    slug: "collier-petale-de-rose",
    description_short:
      "Collier fin avec un véritable pétale de rose préservé dans un médaillon en résine transparente.",
    description_long:
      "Un pétale de rose éternisé dans un médaillon de résine, suspendu à une chaîne en argent 925. Ce collier incarne la romance et la délicatesse. Idéal pour un cadeau sentimental ou pour se faire plaisir.",
    base_price: 52,
    compare_at_price: null,
    sku_prefix: "COL-PR",
    is_active: true,
    is_featured: false,
    category_id: "cat-001",
    collection_ids: ["col-002"],
    material: "Argent 925, Résine",
    weight_g: 10,
    dimensions: "Pendentif: 1.8cm ø, Chaîne: 42cm+5cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2026-03-01T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-003",
    name: "Collier Éclat Doré",
    slug: "collier-eclat-dore",
    description_short:
      "Collier statement avec pendentif géométrique en résine dorée et fleurs de gypsophile.",
    description_long:
      "Un pendentif géométrique audacieux mêlant résine dorée et délicates fleurs de gypsophile. La chaîne en plaqué or est réglable pour s'adapter à tous les styles. Une pièce maîtresse pour vos tenues.",
    base_price: 68,
    compare_at_price: null,
    sku_prefix: "COL-ED",
    is_active: true,
    is_featured: false,
    category_id: "cat-001",
    collection_ids: ["col-001"],
    material: "Plaqué or 18K, Résine, Feuille d'or",
    weight_g: 18,
    dimensions: "Pendentif: 3×2cm, Chaîne: 50cm+5cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-004",
    name: "Bague Bouton de Pivoine",
    slug: "bague-bouton-de-pivoine",
    description_short:
      "Bague réglable avec un bouton de pivoine miniature préservé dans un cabochon de résine.",
    description_long:
      "Cette bague ajustable présente un cabochon de résine abritant un véritable bouton de pivoine séché. L'anneau en acier inoxydable doré est hypoallergénique et résistant. Un bijou délicat qui attire tous les regards.",
    base_price: 32,
    compare_at_price: null,
    sku_prefix: "BAG-BP",
    is_active: true,
    is_featured: true,
    category_id: "cat-002",
    collection_ids: ["col-001", "col-003"],
    material: "Acier inoxydable doré, Résine",
    weight_g: 8,
    dimensions: "Cabochon: 1.2cm ø, Taille ajustable",
    care_instructions:
      "Éviter le contact prolongé avec l'eau. Nettoyer avec un chiffon doux.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-11-15T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-005",
    name: "Bague Cercle Fleuri",
    slug: "bague-cercle-fleuri",
    description_short:
      "Bague minimaliste avec anneau fin et petit cabochon rond de fleurs séchées multicolores.",
    description_long: null,
    base_price: 28,
    compare_at_price: null,
    sku_prefix: "BAG-CF",
    is_active: true,
    is_featured: false,
    category_id: "cat-002",
    collection_ids: ["col-003"],
    material: "Plaqué or, Résine",
    weight_g: 5,
    dimensions: "Cabochon: 0.8cm ø",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-10-20T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-006",
    name: "Bague Résine d'Automne",
    slug: "bague-resine-d-automne",
    description_short:
      "Bague large en résine ambrée avec feuilles d'automne miniatures et paillettes dorées.",
    description_long: null,
    base_price: 35,
    compare_at_price: 45,
    sku_prefix: "BAG-RA",
    is_active: true,
    is_featured: false,
    category_id: "cat-002",
    collection_ids: ["col-005"],
    material: "Résine, Paillettes d'or",
    weight_g: 10,
    dimensions: "Largeur: 1.5cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-09-01T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-007",
    name: "Bracelet Jardin Secret",
    slug: "bracelet-jardin-secret",
    description_short:
      "Bracelet chaîne avec trois charms en résine contenant des micro-fleurs de différentes couleurs.",
    description_long:
      "Trois petits charms en résine abritant chacun une variété de micro-fleur différente, suspendus à une chaîne délicate en plaqué or. Ce bracelet raconte une histoire florale unique à chaque poignet.",
    base_price: 38,
    compare_at_price: null,
    sku_prefix: "BRA-JS",
    is_active: true,
    is_featured: true,
    category_id: "cat-003",
    collection_ids: ["col-003"],
    material: "Plaqué or 18K, Résine",
    weight_g: 14,
    dimensions: "Longueur: 16cm+3cm, Charms: 0.8cm ø",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-11-01T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-008",
    name: "Bracelet Chaîne Florale",
    slug: "bracelet-chaine-florale",
    description_short:
      "Bracelet chaîne fine avec un médaillon ovale en résine emprisonnant un brin de lavande.",
    description_long: null,
    base_price: 42,
    compare_at_price: null,
    sku_prefix: "BRA-CF",
    is_active: true,
    is_featured: false,
    category_id: "cat-003",
    collection_ids: ["col-001"],
    material: "Argent 925, Résine",
    weight_g: 11,
    dimensions: "Longueur: 17cm+3cm, Médaillon: 1.5×1cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2026-02-20T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-009",
    name: "Bracelet Jonc Pétale",
    slug: "bracelet-jonc-petale",
    description_short:
      "Jonc ouvert en métal doré avec incrustation de pétales de rose dans la résine.",
    description_long: null,
    base_price: 55,
    compare_at_price: null,
    sku_prefix: "BRA-JP",
    is_active: true,
    is_featured: false,
    category_id: "cat-003",
    collection_ids: ["col-002"],
    material: "Laiton doré, Résine",
    weight_g: 22,
    dimensions: "Diamètre: 6cm, Largeur résine: 2cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-10-15T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-010",
    name: "Boucles Goutte de Rosée",
    slug: "boucles-goutte-de-rosee",
    description_short:
      "Boucles d'oreilles pendantes en forme de goutte avec fleurs de myosotis en résine.",
    description_long:
      "Ces boucles d'oreilles pendantes capturent de délicates fleurs de myosotis dans des gouttes de résine cristalline. Les crochets en argent 925 sont hypoallergéniques. Un bijou léger et poétique.",
    base_price: 36,
    compare_at_price: null,
    sku_prefix: "BOU-GR",
    is_active: true,
    is_featured: true,
    category_id: "cat-004",
    collection_ids: ["col-001", "col-004"],
    material: "Argent 925, Résine",
    weight_g: 6,
    dimensions: "Goutte: 2×1cm, Longueur totale: 4cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-11-20T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-011",
    name: "Boucles Pétale Suspendu",
    slug: "boucles-petale-suspendu",
    description_short:
      "Puces d'oreilles avec un mini pétale de fleur séchée dans un cercle de résine.",
    description_long: null,
    base_price: 29,
    compare_at_price: null,
    sku_prefix: "BOU-PS",
    is_active: true,
    is_featured: false,
    category_id: "cat-004",
    collection_ids: ["col-002"],
    material: "Acier inoxydable, Résine",
    weight_g: 4,
    dimensions: "Diamètre: 1cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-10-05T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-012",
    name: "Boucles Créoles Florales",
    slug: "boucles-creoles-florales",
    description_short:
      "Créoles dorées ornées de petites fleurs séchées incrustées dans la résine tout autour.",
    description_long: null,
    base_price: 44,
    compare_at_price: null,
    sku_prefix: "BOU-CFL",
    is_active: true,
    is_featured: false,
    category_id: "cat-004",
    collection_ids: ["col-003"],
    material: "Plaqué or 18K, Résine",
    weight_g: 9,
    dimensions: "Diamètre: 3cm, Épaisseur résine: 0.4cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2026-03-05T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-013",
    name: "Serre-tête Couronne de Fleurs",
    slug: "serre-tete-couronne-de-fleurs",
    description_short:
      "Serre-tête doré décoré de mini fleurs séchées et de perles, parfait pour une occasion spéciale.",
    description_long: null,
    base_price: 48,
    compare_at_price: null,
    sku_prefix: "ACC-SC",
    is_active: true,
    is_featured: false,
    category_id: "cat-005",
    collection_ids: ["col-001"],
    material: "Métal doré, Fleurs séchées, Perles",
    weight_g: 35,
    dimensions: "Largeur: 1.5cm",
    care_instructions:
      "Manipuler avec délicatesse. Ranger à plat dans sa boîte.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-12-10T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-014",
    name: "Broche Bouquet Sauvage",
    slug: "broche-bouquet-sauvage",
    description_short:
      "Broche artisanale avec un bouquet de fleurs séchées miniatures sous dôme de résine.",
    description_long: null,
    base_price: 22,
    compare_at_price: null,
    sku_prefix: "ACC-BB",
    is_active: true,
    is_featured: false,
    category_id: "cat-005",
    collection_ids: ["col-005"],
    material: "Laiton doré, Résine",
    weight_g: 12,
    dimensions: "3×2cm",
    care_instructions:
      "Éviter le contact avec l'eau. Manipuler avec soin.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-08-15T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-015",
    name: "Barrette Fleur de Cerisier",
    slug: "barrette-fleur-de-cerisier",
    description_short:
      "Barrette dorée ornée de fleurs de cerisier séchées encapsulées dans la résine.",
    description_long: null,
    base_price: 18,
    compare_at_price: null,
    sku_prefix: "ACC-BFC",
    is_active: true,
    is_featured: false,
    category_id: "cat-005",
    collection_ids: ["col-004"],
    material: "Métal doré, Résine",
    weight_g: 8,
    dimensions: "7×1.5cm",
    care_instructions:
      "Éviter le contact avec l'eau. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-09-20T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-016",
    name: "Pack Duo Floral",
    slug: "pack-duo-floral",
    description_short:
      "Ensemble collier + boucles d'oreilles assorties avec fleurs de lavande en résine.",
    description_long:
      "Ce duo harmonieux associe un collier pendentif et des boucles d'oreilles assorties, tous deux ornés de véritables fleurs de lavande séchées dans la résine. Un ensemble parfait pour offrir ou se faire plaisir. Livré dans un coffret cadeau ISHYA.",
    base_price: 72,
    compare_at_price: 81,
    sku_prefix: "PAC-DF",
    is_active: true,
    is_featured: true,
    category_id: "cat-006",
    collection_ids: ["col-001", "col-003"],
    material: "Plaqué or 18K, Résine",
    weight_g: 18,
    dimensions: "Collier: 45cm+5cm, Boucles: 3cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans le coffret fourni.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-12-20T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-017",
    name: "Parure Jardin Enchanté",
    slug: "parure-jardin-enchante",
    description_short:
      "Parure complète : collier, bracelet et boucles d'oreilles avec fleurs variées en résine.",
    description_long:
      "La parure Jardin Enchanté réunit trois pièces assorties ornées de fleurs séchées variées. Chaque bijou de l'ensemble est unique tout en conservant une harmonie de couleurs et de formes. Livrée dans un coffret cadeau luxueux ISHYA.",
    base_price: 95,
    compare_at_price: 120,
    sku_prefix: "PAC-JE",
    is_active: true,
    is_featured: false,
    category_id: "cat-006",
    collection_ids: ["col-003"],
    material: "Argent 925, Plaqué or, Résine",
    weight_g: 32,
    dimensions: "Collier: 45cm, Bracelet: 17cm, Boucles: 3cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans le coffret fourni.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-11-25T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-018",
    name: "Collier Ras-de-cou Lavande",
    slug: "collier-ras-de-cou-lavande",
    description_short:
      "Ras-de-cou élégant avec barre de résine transparente emprisonnant des brins de lavande.",
    description_long: null,
    base_price: 39,
    compare_at_price: null,
    sku_prefix: "COL-RL",
    is_active: true,
    is_featured: false,
    category_id: "cat-001",
    collection_ids: ["col-004"],
    material: "Acier inoxydable, Résine",
    weight_g: 15,
    dimensions: "Barre: 4×0.5cm, Tour de cou: 38cm+5cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-019",
    name: "Bague Fleur de Lune",
    slug: "bague-fleur-de-lune",
    description_short:
      "Bague en argent avec cabochon rond de résine nacrée et micro-fleurs blanches.",
    description_long: null,
    base_price: 34,
    compare_at_price: null,
    sku_prefix: "BAG-FL",
    is_active: true,
    is_featured: true,
    category_id: "cat-002",
    collection_ids: ["col-004"],
    material: "Argent 925, Résine nacrée",
    weight_g: 7,
    dimensions: "Cabochon: 1cm ø",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: now,
  },
  {
    id: "prod-020",
    name: "Bracelet Perle & Résine",
    slug: "bracelet-perle-et-resine",
    description_short:
      "Bracelet alternant perles d'eau douce et perles de résine contenant des fleurs séchées.",
    description_long: null,
    base_price: 46,
    compare_at_price: 58,
    sku_prefix: "BRA-PR",
    is_active: true,
    is_featured: false,
    category_id: "cat-003",
    collection_ids: ["col-005"],
    material: "Perles d'eau douce, Résine, Plaqué or",
    weight_g: 16,
    dimensions: "Longueur: 17cm+3cm",
    care_instructions:
      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie.",
    is_nickel_free: true,
    seo_title: null,
    seo_description: null,
    created_at: "2025-10-25T10:00:00Z",
    updated_at: now,
  },
];

// ─── Product Media ───────────────────────────────────────────────────────────

export const demoProductMedia: ProductMedia[] = [
  { id: "m-001a", product_id: "prod-001", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop", alt_text: "Collier Fleur d'Oranger - vue principale", type: "image", position: 1, is_primary: true },
  { id: "m-001b", product_id: "prod-001", url: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=800&fit=crop", alt_text: "Collier Fleur d'Oranger - porté", type: "image", position: 2, is_primary: false },
  { id: "m-001c", product_id: "prod-001", url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&h=800&fit=crop", alt_text: "Collier Fleur d'Oranger - détail", type: "image", position: 3, is_primary: false },
  { id: "m-002a", product_id: "prod-002", url: "https://images.unsplash.com/photo-1515562141589-67f0d569b6fc?w=600&h=800&fit=crop", alt_text: "Collier Pétale de Rose", type: "image", position: 1, is_primary: true },
  { id: "m-002b", product_id: "prod-002", url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop", alt_text: "Collier Pétale de Rose - détail", type: "image", position: 2, is_primary: false },
  { id: "m-003a", product_id: "prod-003", url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop", alt_text: "Collier Éclat Doré", type: "image", position: 1, is_primary: true },
  { id: "m-003b", product_id: "prod-003", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop", alt_text: "Collier Éclat Doré - porté", type: "image", position: 2, is_primary: false },
  { id: "m-004a", product_id: "prod-004", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop", alt_text: "Bague Bouton de Pivoine", type: "image", position: 1, is_primary: true },
  { id: "m-004b", product_id: "prod-004", url: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=800&fit=crop", alt_text: "Bague Bouton de Pivoine - détail", type: "image", position: 2, is_primary: false },
  { id: "m-005a", product_id: "prod-005", url: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=800&fit=crop", alt_text: "Bague Cercle Fleuri", type: "image", position: 1, is_primary: true },
  { id: "m-006a", product_id: "prod-006", url: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=800&fit=crop", alt_text: "Bague Résine d'Automne", type: "image", position: 1, is_primary: true },
  { id: "m-006b", product_id: "prod-006", url: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=800&fit=crop", alt_text: "Bague Résine d'Automne - détail", type: "image", position: 2, is_primary: false },
  { id: "m-007a", product_id: "prod-007", url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop", alt_text: "Bracelet Jardin Secret", type: "image", position: 1, is_primary: true },
  { id: "m-007b", product_id: "prod-007", url: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=800&fit=crop", alt_text: "Bracelet Jardin Secret - porté", type: "image", position: 2, is_primary: false },
  { id: "m-008a", product_id: "prod-008", url: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=800&fit=crop", alt_text: "Bracelet Chaîne Florale", type: "image", position: 1, is_primary: true },
  { id: "m-009a", product_id: "prod-009", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop", alt_text: "Bracelet Jonc Pétale", type: "image", position: 1, is_primary: true },
  { id: "m-010a", product_id: "prod-010", url: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&h=800&fit=crop", alt_text: "Boucles Goutte de Rosée", type: "image", position: 1, is_primary: true },
  { id: "m-010b", product_id: "prod-010", url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&h=800&fit=crop", alt_text: "Boucles Goutte de Rosée - porté", type: "image", position: 2, is_primary: false },
  { id: "m-011a", product_id: "prod-011", url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&h=800&fit=crop", alt_text: "Boucles Pétale Suspendu", type: "image", position: 1, is_primary: true },
  { id: "m-012a", product_id: "prod-012", url: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=800&fit=crop", alt_text: "Boucles Créoles Florales", type: "image", position: 1, is_primary: true },
  { id: "m-013a", product_id: "prod-013", url: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=800&fit=crop", alt_text: "Serre-tête Couronne", type: "image", position: 1, is_primary: true },
  { id: "m-014a", product_id: "prod-014", url: "https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=600&h=800&fit=crop", alt_text: "Broche Bouquet Sauvage", type: "image", position: 1, is_primary: true },
  { id: "m-015a", product_id: "prod-015", url: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=600&h=800&fit=crop", alt_text: "Barrette Fleur de Cerisier", type: "image", position: 1, is_primary: true },
  { id: "m-016a", product_id: "prod-016", url: "https://images.unsplash.com/photo-1601821765780-754fa98637c1?w=600&h=800&fit=crop", alt_text: "Pack Duo Floral", type: "image", position: 1, is_primary: true },
  { id: "m-016b", product_id: "prod-016", url: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&h=800&fit=crop", alt_text: "Pack Duo Floral - contenu", type: "image", position: 2, is_primary: false },
  { id: "m-017a", product_id: "prod-017", url: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&h=800&fit=crop", alt_text: "Parure Jardin Enchanté", type: "image", position: 1, is_primary: true },
  { id: "m-017b", product_id: "prod-017", url: "https://images.unsplash.com/photo-1601821765780-754fa98637c1?w=600&h=800&fit=crop", alt_text: "Parure Jardin Enchanté - coffret", type: "image", position: 2, is_primary: false },
  { id: "m-018a", product_id: "prod-018", url: "https://images.unsplash.com/photo-1599459183200-59c3e1e5a9b6?w=600&h=800&fit=crop", alt_text: "Collier Ras-de-cou Lavande", type: "image", position: 1, is_primary: true },
  { id: "m-019a", product_id: "prod-019", url: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=800&fit=crop", alt_text: "Bague Fleur de Lune", type: "image", position: 1, is_primary: true },
  { id: "m-020a", product_id: "prod-020", url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop", alt_text: "Bracelet Perle & Résine", type: "image", position: 1, is_primary: true },
];

// ─── Product Variants ────────────────────────────────────────────────────────

export const demoProductVariants: ProductVariant[] = [
  { id: "v-001a", product_id: "prod-001", sku: "COL-FO-45", price_override: null, size: "45cm", material_variant: "Or", stone: null, length_cm: 45, stock_quantity: 12, low_stock_threshold: 3, weight_g: 12, is_active: true },
  { id: "v-001b", product_id: "prod-001", sku: "COL-FO-50", price_override: null, size: "50cm", material_variant: "Or", stone: null, length_cm: 50, stock_quantity: 8, low_stock_threshold: 3, weight_g: 12, is_active: true },
  { id: "v-002a", product_id: "prod-002", sku: "COL-PR-42", price_override: null, size: "42cm", material_variant: "Argent", stone: null, length_cm: 42, stock_quantity: 6, low_stock_threshold: 3, weight_g: 10, is_active: true },
  { id: "v-003a", product_id: "prod-003", sku: "COL-ED-50", price_override: null, size: "50cm", material_variant: "Or", stone: null, length_cm: 50, stock_quantity: 4, low_stock_threshold: 3, weight_g: 18, is_active: true },
  { id: "v-004a", product_id: "prod-004", sku: "BAG-BP-ADJ", price_override: null, size: "Ajustable", material_variant: "Or", stone: null, length_cm: null, stock_quantity: 15, low_stock_threshold: 5, weight_g: 8, is_active: true },
  { id: "v-005a", product_id: "prod-005", sku: "BAG-CF-52", price_override: null, size: "52", material_variant: "Or", stone: null, length_cm: null, stock_quantity: 10, low_stock_threshold: 3, weight_g: 5, is_active: true },
  { id: "v-005b", product_id: "prod-005", sku: "BAG-CF-54", price_override: null, size: "54", material_variant: "Or", stone: null, length_cm: null, stock_quantity: 7, low_stock_threshold: 3, weight_g: 5, is_active: true },
  { id: "v-006a", product_id: "prod-006", sku: "BAG-RA-54", price_override: null, size: "54", material_variant: null, stone: null, length_cm: null, stock_quantity: 3, low_stock_threshold: 3, weight_g: 10, is_active: true },
  { id: "v-007a", product_id: "prod-007", sku: "BRA-JS-16", price_override: null, size: "16cm", material_variant: "Or", stone: null, length_cm: 16, stock_quantity: 9, low_stock_threshold: 3, weight_g: 14, is_active: true },
  { id: "v-008a", product_id: "prod-008", sku: "BRA-CF-17", price_override: null, size: "17cm", material_variant: "Argent", stone: null, length_cm: 17, stock_quantity: 5, low_stock_threshold: 3, weight_g: 11, is_active: true },
  { id: "v-009a", product_id: "prod-009", sku: "BRA-JP-UNI", price_override: null, size: "Universel", material_variant: "Or", stone: null, length_cm: null, stock_quantity: 7, low_stock_threshold: 3, weight_g: 22, is_active: true },
  { id: "v-010a", product_id: "prod-010", sku: "BOU-GR-UNI", price_override: null, size: "Unique", material_variant: "Argent", stone: null, length_cm: null, stock_quantity: 11, low_stock_threshold: 3, weight_g: 6, is_active: true },
  { id: "v-011a", product_id: "prod-011", sku: "BOU-PS-UNI", price_override: null, size: "Unique", material_variant: "Acier", stone: null, length_cm: null, stock_quantity: 14, low_stock_threshold: 5, weight_g: 4, is_active: true },
  { id: "v-012a", product_id: "prod-012", sku: "BOU-CFL-UNI", price_override: null, size: "Unique", material_variant: "Or", stone: null, length_cm: null, stock_quantity: 6, low_stock_threshold: 3, weight_g: 9, is_active: true },
  { id: "v-013a", product_id: "prod-013", sku: "ACC-SC-UNI", price_override: null, size: "Unique", material_variant: "Or", stone: null, length_cm: null, stock_quantity: 4, low_stock_threshold: 2, weight_g: 35, is_active: true },
  { id: "v-014a", product_id: "prod-014", sku: "ACC-BB-UNI", price_override: null, size: "Unique", material_variant: "Or", stone: null, length_cm: null, stock_quantity: 18, low_stock_threshold: 5, weight_g: 12, is_active: true },
  { id: "v-015a", product_id: "prod-015", sku: "ACC-BFC-UNI", price_override: null, size: "Unique", material_variant: "Or", stone: null, length_cm: null, stock_quantity: 20, low_stock_threshold: 5, weight_g: 8, is_active: true },
  { id: "v-016a", product_id: "prod-016", sku: "PAC-DF-UNI", price_override: null, size: "Unique", material_variant: "Or", stone: null, length_cm: null, stock_quantity: 8, low_stock_threshold: 3, weight_g: 18, is_active: true },
  { id: "v-017a", product_id: "prod-017", sku: "PAC-JE-UNI", price_override: null, size: "Unique", material_variant: "Or/Argent", stone: null, length_cm: null, stock_quantity: 2, low_stock_threshold: 2, weight_g: 32, is_active: true },
  { id: "v-018a", product_id: "prod-018", sku: "COL-RL-38", price_override: null, size: "38cm", material_variant: "Acier", stone: null, length_cm: 38, stock_quantity: 9, low_stock_threshold: 3, weight_g: 15, is_active: true },
  { id: "v-019a", product_id: "prod-019", sku: "BAG-FL-52", price_override: null, size: "52", material_variant: "Argent", stone: null, length_cm: null, stock_quantity: 11, low_stock_threshold: 3, weight_g: 7, is_active: true },
  { id: "v-020a", product_id: "prod-020", sku: "BRA-PR-17", price_override: null, size: "17cm", material_variant: "Or", stone: null, length_cm: 17, stock_quantity: 5, low_stock_threshold: 3, weight_g: 16, is_active: true },
];

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const demoReviews: Review[] = [
  {
    id: "rev-001", product_id: "prod-001", user_id: "u-1", rating: 5,
    title: "Magnifique !",
    content: "Ce collier est absolument sublime. Les fleurs sont parfaitement conservées et le rendu est très lumineux. Je le porte tous les jours et je reçois énormément de compliments. Livraison rapide et emballage soigné.",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 12, created_at: "2026-02-20T14:30:00Z",
  },
  {
    id: "rev-002", product_id: "prod-001", user_id: "u-2", rating: 5,
    title: "Un cadeau parfait",
    content: "Offert à ma mère pour son anniversaire, elle a été très émue. La qualité est remarquable et le bijou est encore plus beau en vrai que sur les photos.",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 8, created_at: "2026-01-15T09:00:00Z",
  },
  {
    id: "rev-003", product_id: "prod-004", user_id: "u-3", rating: 5,
    title: "Coup de cœur",
    content: "Cette bague est devenue mon bijou fétiche. La pivoine est si délicate, on dirait qu'elle vient d'être cueillie. Bravo pour ce travail artisanal !",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 15, created_at: "2026-02-10T16:00:00Z",
  },
  {
    id: "rev-004", product_id: "prod-010", user_id: "u-4", rating: 4,
    title: "Très jolies boucles",
    content: "Les boucles sont légères et élégantes. Seul petit bémol : j'aurais aimé qu'elles soient un peu plus longues. Mais la qualité est irréprochable.",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 5, created_at: "2026-01-28T11:00:00Z",
  },
  {
    id: "rev-005", product_id: "prod-007", user_id: "u-5", rating: 5,
    title: "Original et raffiné",
    content: "Ce bracelet est une vraie petite merveille. Les trois charms floraux sont tous différents, c'est ce qui fait son charme. Je recommande à 100% !",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 9, created_at: "2026-02-05T13:30:00Z",
  },
  {
    id: "rev-006", product_id: "prod-016", user_id: "u-6", rating: 5,
    title: "Ensemble harmonieux",
    content: "Le pack duo est une excellente idée. Les deux pièces s'accordent parfaitement. Le coffret cadeau est très élégant. Rapport qualité-prix imbattable.",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 7, created_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "rev-007", product_id: "prod-002", user_id: "u-7", rating: 4,
    title: "Délicat et romantique",
    content: "Le pétale de rose est magnifique dans la résine. Le collier est très fin et délicat, parfait pour un look romantique. J'adore !",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 4, created_at: "2026-03-10T15:00:00Z",
  },
  {
    id: "rev-008", product_id: "prod-012", user_id: "u-8", rating: 5,
    title: "Mes créoles préférées",
    content: "Des créoles uniques que je n'ai vues nulle part ailleurs. Les petites fleurs incrustées sont d'une finesse incroyable. Un vrai bijou d'artisan.",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 11, created_at: "2026-03-12T17:30:00Z",
  },
  {
    id: "rev-009", product_id: "prod-009", user_id: "u-9", rating: 5,
    title: "Jonc magnifique",
    content: "Le jonc est solide et les pétales de rose dans la résine donnent un effet saisissant. Je ne m'en lasse pas. Merci ISHYA pour ces créations !",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 6, created_at: "2026-02-18T12:00:00Z",
  },
  {
    id: "rev-010", product_id: "prod-017", user_id: "u-10", rating: 4,
    title: "Belle parure",
    content: "L'ensemble est très joli et les trois pièces se complètent bien. Le coffret fait très luxueux. Petit bémol sur le fermoir du bracelet, un peu difficile à fermer seule.",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 3, created_at: "2026-01-05T08:30:00Z",
  },
  {
    id: "rev-011", product_id: "prod-019", user_id: "u-11", rating: 5,
    title: "Poétique",
    content: "La bague Fleur de Lune porte bien son nom. L'effet nacré est sublime et les micro-fleurs blanches sont parfaitement visibles. Un bijou féérique.",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 10, created_at: "2026-02-28T14:00:00Z",
  },
  {
    id: "rev-012", product_id: "prod-003", user_id: "u-12", rating: 5,
    title: "Statement piece",
    content: "Ce collier attire tous les regards. Le pendentif géométrique doré est original et élégant. Les fleurs de gypsophile à l'intérieur sont un détail charmant.",
    photos: [], is_verified_purchase: true, is_approved: true, helpful_count: 8, created_at: "2026-03-05T11:00:00Z",
  },
];

// ─── Helper: convert Product to ProductCardProduct ───────────────────────────

function getCategoryForProduct(product: Product) {
  const cat = demoCategories.find((c) => c.id === product.category_id);
  return cat ? { name: cat.name, slug: cat.slug } : undefined;
}

function getMediaForProduct(productId: string) {
  return demoProductMedia
    .filter((m) => m.product_id === productId)
    .map(({ url, alt_text, position, is_primary }) => ({
      url,
      alt_text,
      position,
      is_primary,
    }));
}

function getVariantsForProduct(productId: string) {
  return demoProductVariants
    .filter((v) => v.product_id === productId)
    .map(({ stock_quantity }) => ({ stock_quantity }));
}

function getBadgesForProduct(product: Product): string[] {
  const badges: string[] = [];
  const isNew =
    new Date(product.created_at).getTime() >
    Date.now() - 60 * 24 * 60 * 60 * 1000;
  if (isNew) badges.push("nouveau");
  if (product.is_featured) badges.push("best-seller");
  if (
    product.compare_at_price &&
    product.compare_at_price > product.base_price
  )
    badges.push("promo");
  return badges;
}

export function toCardProduct(product: Product): ProductCardProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    base_price: product.base_price,
    compare_at_price: product.compare_at_price,
    is_featured: product.is_featured,
    media: getMediaForProduct(product.id),
    category: getCategoryForProduct(product),
    variants: getVariantsForProduct(product.id),
    badges: getBadgesForProduct(product),
  };
}

// ─── Query Helpers ───────────────────────────────────────────────────────────

export function getAllCardProducts(): ProductCardProduct[] {
  return demoProducts.filter((p) => p.is_active).map(toCardProduct);
}

export function getProductsByCategory(slug: string): ProductCardProduct[] {
  const cat = demoCategories.find((c) => c.slug === slug);
  if (!cat) return [];
  return demoProducts
    .filter((p) => p.is_active && p.category_id === cat.id)
    .map(toCardProduct);
}

export function getProductBySlug(slug: string) {
  const product = demoProducts.find((p) => p.slug === slug && p.is_active);
  if (!product) return null;
  return {
    product,
    media: demoProductMedia.filter((m) => m.product_id === product.id),
    variants: demoProductVariants.filter((v) => v.product_id === product.id),
    reviews: demoReviews.filter((r) => r.product_id === product.id),
  };
}

export function getFeaturedProducts(): ProductCardProduct[] {
  return demoProducts
    .filter((p) => p.is_active && p.is_featured)
    .map(toCardProduct);
}

export function getNewProducts(): ProductCardProduct[] {
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return demoProducts
    .filter(
      (p) => p.is_active && new Date(p.created_at).getTime() > cutoff
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .map(toCardProduct);
}

export function getBestSellers(): ProductCardProduct[] {
  return demoProducts
    .filter((p) => p.is_active && p.is_featured)
    .map(toCardProduct);
}

export function getPromotionProducts(): ProductCardProduct[] {
  return demoProducts
    .filter(
      (p) =>
        p.is_active &&
        p.compare_at_price !== null &&
        p.compare_at_price > p.base_price
    )
    .map(toCardProduct);
}

export function getProductsByCollection(slug: string): ProductCardProduct[] {
  const col = demoCollections.find((c) => c.slug === slug);
  if (!col) return [];
  return demoProducts
    .filter((p) => p.is_active && p.collection_ids.includes(col.id))
    .map(toCardProduct);
}

export function getProductsByBudget(
  min: number,
  max: number
): ProductCardProduct[] {
  return demoProducts
    .filter(
      (p) => p.is_active && p.base_price >= min && p.base_price <= max
    )
    .map(toCardProduct);
}

export function searchProducts(query: string): ProductCardProduct[] {
  const q = query.toLowerCase();
  return demoProducts
    .filter(
      (p) =>
        p.is_active &&
        (p.name.toLowerCase().includes(q) ||
          p.description_short.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q))
    )
    .map(toCardProduct);
}

export function getRelatedProducts(
  productId: string,
  limit = 4
): ProductCardProduct[] {
  const product = demoProducts.find((p) => p.id === productId);
  if (!product) return [];
  return demoProducts
    .filter(
      (p) =>
        p.is_active &&
        p.id !== productId &&
        (p.category_id === product.category_id ||
          p.collection_ids.some((c) => product.collection_ids.includes(c)))
    )
    .slice(0, limit)
    .map(toCardProduct);
}

// Review display names for demo
export const reviewAuthors: Record<string, string> = {
  "u-1": "Marie L.",
  "u-2": "Sophie D.",
  "u-3": "Camille R.",
  "u-4": "Léa M.",
  "u-5": "Julie B.",
  "u-6": "Emma P.",
  "u-7": "Chloé V.",
  "u-8": "Manon G.",
  "u-9": "Clara T.",
  "u-10": "Inès K.",
  "u-11": "Zoé F.",
  "u-12": "Lina A.",
};
