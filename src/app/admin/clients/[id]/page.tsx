'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft, User, Mail, Phone, MapPin, ShoppingCart,
  Star, Calendar, Award, Clock, Package,
} from 'lucide-react'
import { cn, formatPrice, formatDate } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

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

const statusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: 'Payée', className: 'bg-emerald-50 text-emerald-700' },
  delivered: { label: 'Livrée', className: 'bg-green-50 text-green-700' },
  processing: { label: 'En préparation', className: 'bg-blue-50 text-blue-700' },
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>()
  const [notes, setNotes] = useState('')

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <Link href="/admin/clients" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
          <p className="text-sm text-gray-500">Client depuis {formatDate(client.createdAt)}</p>
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
            <motion.div key={kpi.label} variants={staggerItem} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile + Addresses */}
        <div className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><User className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{client.name}</span></div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{client.email}</span></div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{client.phone}</span></div>
              <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-gray-700">Inscrit le {formatDate(client.createdAt)}</span></div>
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-gray-400" />
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium bg-gold/20 text-gold-dark')}>{client.loyaltyTier}</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Adresses</h3>
            <div className="space-y-3">
              {client.addresses.map((addr, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium text-gray-900">{addr.label}</span>
                    {addr.isDefault && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded">Par défaut</span>}
                  </div>
                  <p className="text-gray-600 ml-5.5">{addr.line1}, {addr.postal} {addr.city}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Notes internes</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ajouter une note..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          </motion.div>
        </div>

        {/* Center: Orders + Reviews */}
        <div className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Historique des commandes</h3>
            <div className="space-y-2">
              {client.orders.map((order) => {
                const s = statusConfig[order.status] || { label: order.status, className: 'bg-gray-100 text-gray-600' }
                return (
                  <Link key={order.id} href={`/admin/commandes/${order.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-mono text-xs text-terracotta">{order.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-gray-900">{formatPrice(order.amount)}</p>
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', s.className)}>{s.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Avis laissés</h3>
            <div className="space-y-3">
              {client.reviews.map((review, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{review.product}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={cn('w-3.5 h-3.5', s < review.rating ? 'text-gold fill-gold' : 'text-gray-200')} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(review.date)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Activity */}
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-4">
            {client.activity.map((event, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-terracotta mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">{event.event}</p>
                  <p className="text-xs text-gray-400">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
