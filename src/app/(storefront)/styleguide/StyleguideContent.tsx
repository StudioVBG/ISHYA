"use client";

import {
  ShoppingBag,
  Heart,
  ArrowRight,
  Plus,
  Trash2,
  Mail,
  Package,
  Award,
  Star,
  Euro,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KPICard } from "@/components/ui/KPICard";

// ─── Palette « Atelier Noir » (mai 2026, OKLCH wide-gamut P3) ───
const colorTokens: { name: string; varName: string; usage: string }[] = [
  // Signature Atelier Noir
  { name: "Ink", varName: "--ink", usage: "Onyx anti-warm, fond sombre + texte" },
  { name: "Bone", varName: "--bone", usage: "Blanc os anti-cream, fond clair" },
  { name: "Bone soft", varName: "--bone-soft", usage: "Bone discret, cards/PLP" },
  { name: "Leather", varName: "--leather", usage: "Cuir tabac propriétaire" },
  { name: "Ember", varName: "--ember", usage: "Cuivre patiné — accent CTA unique" },
  { name: "Ember bright", varName: "--ember-bright", usage: "Ember hover/focus" },
  { name: "Steel", varName: "--steel", usage: "Gris froid pour métadonnées/SKU" },
  { name: "Steel soft", varName: "--steel-soft", usage: "Steel clair, dividers" },
  { name: "Mist", varName: "--mist", usage: "Fog cards désactivées" },
  // Statuts (admin / orders)
  { name: "Success", varName: "--success", usage: "Statut livré, validé" },
  { name: "Info", varName: "--info", usage: "Statut payée, info" },
  { name: "Warning", varName: "--warning", usage: "Préparation, alerte" },
  { name: "Destructive", varName: "--destructive", usage: "Annulation, erreur" },
  { name: "Accent purple", varName: "--accent-purple", usage: "Statut expédiée" },
  // Alias rétrocompat (anciens noms remappés sur la nouvelle palette)
  { name: "Terracotta (alias → ember)", varName: "--terracotta", usage: "Legacy — pointe sur ember" },
  { name: "Gold (alias → ember)", varName: "--gold", usage: "Legacy — pointe sur ember" },
  { name: "Beige nude (alias → surface)", varName: "--beige-nude", usage: "Legacy — pointe sur bone-soft" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <h2 className="font-display text-2xl md:text-3xl mb-2">{title}</h2>
      {description && <p className="text-muted text-sm mb-6">{description}</p>}
      <div className="bg-white rounded-xl border border-border p-6 md:p-8">
        {children}
      </div>
    </section>
  );
}

function CodeTag({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted-soft text-muted">
      {children}
    </code>
  );
}

export function StyleguideContent() {
  return (
    <div className="container py-12 md:py-16 px-4">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-10 bg-ember" aria-hidden />
          <span className="eyebrow">Design system · Atelier Noir 2026</span>
        </div>
        <h1
          className="font-display text-ink mb-4"
          style={{
            fontSize: "var(--text-h1)",
            fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
            fontWeight: 400,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          Styleguide ISHYA
        </h1>
        <p className="text-steel max-w-2xl text-base md:text-lg">
          Référence interne des tokens, composants et patterns. Direction
          artistique « Atelier Noir » — palette OKLCH P3 wide-gamut, typographie
          variable Fraunces + Bricolage Grotesque + Geist Mono, spacing fluide
          clamp().
        </p>
      </header>

      {/* ─── Couleurs ─────────────────────────────────────────── */}
      <Section
        title="Couleurs"
        description="Tokens définis dans globals.css. Toujours préférer les classes Tailwind générées (bg-terracotta, text-muted, …) plutôt que des valeurs en dur."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {colorTokens.map((c) => (
            <div
              key={c.varName}
              className="rounded-lg border border-border overflow-hidden bg-white"
            >
              <div
                className="h-20 w-full"
                style={{ background: `var(${c.varName})` }}
              />
              <div className="p-3">
                <p className="text-sm font-medium">{c.name}</p>
                <CodeTag>{c.varName}</CodeTag>
                <p className="text-xs text-muted mt-1.5">{c.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Typographie ──────────────────────────────────────── */}
      <Section
        title="Typographie"
        description="Fraunces (variable, axes opsz/SOFT/WONK) pour les titres, Bricolage Grotesque pour le corps, Geist Mono pour les données techniques. Échelle fluide via clamp()."
      >
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-5xl md:text-6xl">Aa Display 6xl</h1>
            <CodeTag>font-display text-5xl md:text-6xl</CodeTag>
          </div>
          <div>
            <h2 className="font-display text-3xl md:text-4xl">
              Aa Heading 4xl
            </h2>
            <CodeTag>font-display text-3xl md:text-4xl</CodeTag>
          </div>
          <div>
            <h3 className="font-display text-xl md:text-2xl">
              Aa Subheading 2xl
            </h3>
            <CodeTag>font-display text-xl md:text-2xl</CodeTag>
          </div>
          <div>
            <p className="text-base">
              Aa Body — DM Sans, regular, line-height confortable. Utilisé pour
              les paragraphes courants, les descriptions produit, les libellés.
            </p>
            <CodeTag>text-base</CodeTag>
          </div>
          <div>
            <p className="text-sm text-muted">
              Aa Small / muted — texte secondaire, métadonnées.
            </p>
            <CodeTag>text-sm text-muted</CodeTag>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Aa Eyebrow
            </p>
            <CodeTag>text-xs uppercase tracking-[0.2em] text-muted</CodeTag>
          </div>
        </div>
      </Section>

      {/* ─── Boutons ──────────────────────────────────────────── */}
      <Section
        title="Boutons"
        description={`<Button variant size icon iconPosition fullWidth loading href />`}
      >
        <div className="space-y-8">
          <div>
            <p className="text-sm font-medium mb-3">Variants</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="gold">Gold</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link button</Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Tailles</p>
            <div className="flex flex-wrap items-end gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="icon" icon={Heart} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Avec icônes</p>
            <div className="flex flex-wrap gap-3">
              <Button icon={ShoppingBag}>Ajouter au panier</Button>
              <Button icon={ArrowRight} iconPosition="right" variant="secondary">
                Découvrir
              </Button>
              <Button icon={Mail} variant="gold">
                S&apos;abonner
              </Button>
              <Button icon={Trash2} variant="destructive">
                Supprimer
              </Button>
              <Button icon={Plus} variant="ghost" size="sm">
                Ajouter
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">États</p>
            <div className="flex flex-wrap gap-3">
              <Button disabled>Désactivé</Button>
              <Button loading>Chargement</Button>
              <Button fullWidth className="max-w-md">
                Full width
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">En lien</p>
            <Button href="/boutique" variant="primary" icon={ArrowRight} iconPosition="right">
              Aller à la boutique
            </Button>
          </div>
        </div>
      </Section>

      {/* ─── StatusBadge ──────────────────────────────────────── */}
      <Section
        title="StatusBadge"
        description={`<StatusBadge variant size status>. status= mappe automatiquement les statuts de commande.`}
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3">Variants</p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge variant="neutral">Neutral</StatusBadge>
              <StatusBadge variant="info">Info</StatusBadge>
              <StatusBadge variant="success">Success</StatusBadge>
              <StatusBadge variant="warning">Warning</StatusBadge>
              <StatusBadge variant="destructive">Destructive</StatusBadge>
              <StatusBadge variant="accent">Accent</StatusBadge>
              <StatusBadge variant="brand">Brand</StatusBadge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Statuts de commande (auto)</p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="pending" />
              <StatusBadge status="confirmed" />
              <StatusBadge status="processing" />
              <StatusBadge status="shipped" />
              <StatusBadge status="delivered" />
              <StatusBadge status="cancelled" />
              <StatusBadge status="refunded" />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Tailles</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant="info" size="sm">
                Small
              </StatusBadge>
              <StatusBadge variant="info" size="md">
                Medium
              </StatusBadge>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── KPICard ──────────────────────────────────────────── */}
      <Section
        title="KPICard"
        description={`<KPICard label value detail icon variant href />`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Commandes"
            value="24"
            detail="Aujourd'hui"
            icon={Package}
            variant="brand"
          />
          <KPICard
            label="CA du jour"
            value="1 240 €"
            detail="+12% vs hier"
            icon={Euro}
            variant="success"
          />
          <KPICard
            label="Points fidélité"
            value="850 pts"
            detail="Niveau Or"
            icon={Award}
            variant="gold"
          />
          <KPICard
            label="Avis"
            value="4,8"
            detail="Sur 312 avis"
            icon={Star}
            variant="warning"
          />
        </div>
      </Section>

      {/* ─── Espacements & rayons ─────────────────────────────── */}
      <Section
        title="Espacements & rayons"
        description="Échelle Tailwind native. Rayons recommandés ci-dessous."
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3">Border radius</p>
            <div className="flex flex-wrap gap-4">
              {(["rounded", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full"] as const).map(
                (r) => (
                  <div key={r} className="flex flex-col items-center gap-2">
                    <div className={`w-16 h-16 bg-terracotta/15 ${r}`} />
                    <CodeTag>{r}</CodeTag>
                  </div>
                ),
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Spacings (rythme vertical)</p>
            <ul className="text-sm space-y-2">
              <li>
                <CodeTag>py-8</CodeTag>{" "}
                <span className="text-muted">— bloc compact / sous-section</span>
              </li>
              <li>
                <CodeTag>py-12</CodeTag>{" "}
                <span className="text-muted">— section standard mobile</span>
              </li>
              <li>
                <CodeTag>py-16</CodeTag>{" "}
                <span className="text-muted">— section principale</span>
              </li>
              <li>
                <CodeTag>py-20</CodeTag>{" "}
                <span className="text-muted">— section spacieuse desktop</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ─── Règles ───────────────────────────────────────────── */}
      <Section
        title="Règles d'usage"
        description="À respecter pour préserver la cohérence."
      >
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="text-success">✓</span>
            <span>
              <strong>Toujours utiliser les tokens</strong> :{" "}
              <CodeTag>bg-terracotta</CodeTag>, <CodeTag>text-muted</CodeTag>,{" "}
              <CodeTag>border-border</CodeTag>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-destructive">✗</span>
            <span>
              <strong>Pas de couleurs en dur</strong> :{" "}
              <CodeTag>bg-[#F8F6F2]</CodeTag>,{" "}
              <CodeTag>text-[#1a1a1a]</CodeTag>,{" "}
              <CodeTag>bg-emerald-50</CodeTag>, <CodeTag>text-foreground</CodeTag>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-success">✓</span>
            <span>
              <strong>Boutons via &lt;Button&gt;</strong> sauf cas très
              spécifique (icône seule, ajout panier animé).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-success">✓</span>
            <span>
              <strong>Statuts via &lt;StatusBadge&gt;</strong> avec{" "}
              <CodeTag>status=</CodeTag> pour les commandes.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-success">✓</span>
            <span>
              <strong>Cibles tactiles ≥ 44 px</strong> sur mobile (boutons
              icône, contrôles quantité, fermeture modal).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-success">✓</span>
            <span>
              <strong>Prix avec tabular-nums</strong> pour alignement et
              lisibilité.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-success">✓</span>
            <span>
              <strong>Animations</strong> : utiliser les variants partagés{" "}
              <CodeTag>fadeInUp</CodeTag>, <CodeTag>staggerContainer</CodeTag>,
              easings <CodeTag>easeOutQuart</CodeTag>. Respect{" "}
              <CodeTag>prefers-reduced-motion</CodeTag>.
            </span>
          </li>
        </ul>
      </Section>
    </div>
  );
}
