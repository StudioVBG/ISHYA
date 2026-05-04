'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft, User, Mail, Phone, MapPin, ShoppingCart,
  Star, Calendar, Award, Package,
} from 'lucide-react'
import { cn, formatPrice, formatDate } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'
import { StatusBadge, type StatusVariant } from '@/components/ui/StatusBadge'

const client = {
  id: 'usr-001',
  name: 'Marie Dupont',
  email: 'marie.dupont@email.com',
  phone: '+33 6 12 34 56 78',
  createdAt: '2025-06-15T10:00:00Z',
  loyaltyTier: 'Gold',
  loyaltyPoints: 856,
  totalSpent: 856.50,
  orderCount: 12,
  avgOrderValue: 71.37,
  addresses: [
    { label: 'Domicile', line1: '15 rue des Fleurs', city: 'Paris', postal: '75004', country: 'France', isDefault: true },
    { label: 'Bureau', line1: '42 avenue Montaigne', city: 'Paris', postal: '75008', country: 'France', isDefault: false },
  ],
  orders: [
    { id: 'ISH-7X2K-A9B3', date: '2026-03-20', status: 'paid', amount: 127 },
    { id: 'ISH-6W1K-B2C4', date: '2026-02-14', status: 'delivered', amount: 89.50 },
    { id: 'ISH-5V0J-D4E6', date: '2026-01-10', status: 'delivered', amount: 156 },
    { id: 'ISH-4U9I-F6G8', date: '2025-12-24', status: 'delivered', amount: 210 },
    { id: 'ISH-3T8H-H8I0', date: '2025-11-15', status: 'delivered', amount: 68 },
  ],
  reviews: [
    { product: 'Collier Fleur d\'Oranger', rating: 5, date: '2026-02-20', content: 'Magnifique collier, les fleurs sont sublimes !' },
    { product: 'Boucles Pluie de Pétales', rating: 4, date: '2026-01-15', content: 'Très jolies, un peu fragiles.' },
  ],
  activity: [
    { date: '20/03/2026 14:32', event: 'Commande ISH-7X2K-A9B3 passée' },
    { date: '20/03/2026 14:30', event: 'Connexion au compte' },
    { date: '14/02/2026 11:00', event: 'Commande ISH-6W1K-B2C4 passée' },
    { date: '10/02/2026 09:15', event: 'Avis laissé sur Collier Fleur d\'Oranger' },
    { date: '10/01/2026 16:42', event: 'Commande ISH-5V0J-D4E6 passée' },
  ],
}

const orderStatusConfig: Record<string, { label: string; variant: StatusVariant }> = {
  paid: { label: 'Payée', variant: 'info' },
  delivered: { label: 'Livrée', variant: 'success' },
  processing: { label: 'En préparation', variant: 'warning' },
}

export default function ClientDetailPage() {
  const [notes, setNotes] = useState('')

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <Link href="/admin/clients" className="p-2 rounded-lg hover:bg-muted-soft transition-colors" aria-label="Retour">
          <ChevronLeft className="w-5 h-5 text-muted" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-foreground">{client.name}</h2>
          <p className="text-sm text-muted">Client depuis {formatDate(client.createdAt)}</p>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'CA total', value: formatPrice(client.totalSpent), icon: ShoppingCart },
          { label: 'Commandes', value: `${client.orderCount}`, icon: Package },
          { label: 'Panier moyen', value: formatPrice(client.avgOrderValue), icon: Star },
          { label: 'Points fidélité', value: `${client.loyaltyPoints} pts`, icon: Award },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <motion.div key={kpi.label} variants={staggerItem} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-muted" />
                <span className="text-sm text-muted">{kpi.label}</span>
              </div>
              <p className="text-xl font-semibold text-foreground tabular-nums">{kpi.value}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile + Addresses */}
        <div className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><User className="w-4 h-4 text-muted" /><span className="text-foreground">{client.name}</span></div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-muted" /><span className="text-foreground">{client.email}</span></div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-muted" /><span className="text-foreground">{client.phone}</span></div>
              <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-muted" /><span className="text-foreground">Inscrit le {formatDate(client.createdAt)}</span></div>
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-muted" />
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gold/15 text-gold-dark">{client.loyaltyTier}</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">Adresses</h3>
            <div className="space-y-3">
              {client.addresses.map((addr, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/60 text-sm">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-muted" />
                    <span className="font-medium text-foreground">{addr.label}</span>
                    {addr.isDefault && (
                      <StatusBadge variant="success" size="sm">
                        Par défaut
                      </StatusBadge>
                    )}
                  </div>
                  <p className="text-muted ml-5.5">{addr.line1}, {addr.postal} {addr.city}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3">Notes internes</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ajouter une note..." className="w-full px-3 py-2 border border-border rounded-lg text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          </motion.div>
        </div>

        {/* Center: Orders + Reviews */}
        <div className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">Historique des commandes</h3>
            <div className="space-y-2">
              {client.orders.map((order) => {
                const s = orderStatusConfig[order.status] ?? { label: order.status, variant: 'neutral' as StatusVariant }
                return (
                  <Link key={order.id} href={`/admin/commandes/${order.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-ivory/60 transition-colors">
                    <div>
                      <p className="font-mono text-xs text-terracotta">{order.id}</p>
                      <p className="text-xs text-muted-light mt-0.5">{formatDate(order.date)}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="font-medium text-sm text-foreground tabular-nums">{formatPrice(order.amount)}</p>
                      <StatusBadge variant={s.variant} size="sm">{s.label}</StatusBadge>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">Avis laissés</h3>
            <div className="space-y-3">
              {client.reviews.map((review, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{review.product}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={cn('w-3.5 h-3.5', s < review.rating ? 'text-gold fill-gold' : 'text-border')} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted">{review.content}</p>
                  <p className="text-xs text-muted-light mt-1">{formatDate(review.date)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Activity */}
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Activité récente</h3>
          <div className="space-y-4">
            {client.activity.map((event, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-terracotta mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-foreground">{event.event}</p>
                  <p className="text-xs text-muted-light">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
