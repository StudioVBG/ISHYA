'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Truck, CreditCard, RefreshCw, Printer, Package, MapPin,
  User, Clock, MessageSquare,
} from 'lucide-react'
import { cn, formatPrice, formatDate } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-gray-100 text-gray-700' },
  paid: { label: 'Payée', className: 'bg-emerald-50 text-emerald-700' },
  processing: { label: 'En préparation', className: 'bg-blue-50 text-blue-700' },
  shipped: { label: 'Expédiée', className: 'bg-purple-50 text-purple-700' },
  delivered: { label: 'Livrée', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Annulée', className: 'bg-red-50 text-red-700' },
  refunded: { label: 'Remboursée', className: 'bg-orange-50 text-orange-700' },
}

const order = {
  id: 'ISH-7X2K-A9B3',
  status: 'paid',
  date: '2026-03-20T14:32:00Z',
  customer: { name: 'Marie Dupont', email: 'marie.dupont@email.com', phone: '+33 6 12 34 56 78', loyaltyTier: 'Gold' },
  shippingAddress: { line1: '15 rue des Fleurs', line2: 'Apt 3B', city: 'Paris', postal: '75004', country: 'France' },
  items: [
    { id: '1', name: 'Collier Fleur d\'Oranger', sku: 'COL-FO-M-OR', variant: 'Taille M / Or', qty: 1, price: 45, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=60&h=60&fit=crop' },
    { id: '2', name: 'Boucles Pluie de Pétales', sku: 'BO-PP-001', variant: 'Standard', qty: 1, price: 39, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=60&h=60&fit=crop' },
    { id: '3', name: 'Bracelet Chaîne Florale', sku: 'BRA-CF-18', variant: '18cm', qty: 1, price: 35, image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=60&h=60&fit=crop' },
  ],
  subtotal: 119,
  shipping: 0,
  discount: 0,
  tax: 8,
  total: 127,
  payment: { method: 'Carte bancaire', last4: '4242', brand: 'Visa' },
  tracking: { carrier: 'Colissimo', number: '6A12345678901', status: 'En attente d\'expédition' },
  timeline: [
    { date: '20/03/2026 14:32', event: 'Commande créée', icon: Package },
    { date: '20/03/2026 14:33', event: 'Paiement confirmé (Visa ****4242)', icon: CreditCard },
    { date: '20/03/2026 15:00', event: 'Commande en préparation', icon: Clock },
  ],
  notes: '',
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const [currentStatus, setCurrentStatus] = useState(order.status)
  const [notes, setNotes] = useState(order.notes)

  const s = statusConfig[currentStatus]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/commandes" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Commande {params.id}</h2>
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', s.className)}>{s.label}</span>
            </div>
            <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          >
            {Object.entries(statusConfig).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div variants={staggerItem} className="flex flex-wrap gap-2">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
          <Truck className="w-4 h-4" /> Marquer expédié
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Rembourser
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Printer className="w-4 h-4" /> Imprimer facture
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Articles commandés</h3></div>
            <table className="w-full text-sm">
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.sku} · {item.variant}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">×{item.qty}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50/50">
                <tr className="border-t border-gray-200">
                  <td colSpan={2} className="px-4 py-2 text-right text-gray-500">Sous-total</td>
                  <td className="px-4 py-2 text-right">{formatPrice(order.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-right text-gray-500">Livraison</td>
                  <td className="px-4 py-2 text-right">{order.shipping === 0 ? 'Gratuite' : formatPrice(order.shipping)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-right text-gray-500">TVA</td>
                  <td className="px-4 py-2 text-right">{formatPrice(order.tax)}</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td colSpan={2} className="px-4 py-3 text-right font-semibold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-lg text-gray-900">{formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Historique</h3>
            <div className="space-y-4">
              {order.timeline.map((event, i) => {
                const Icon = event.icon
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{event.event}</p>
                      <p className="text-xs text-gray-400">{event.date}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Notes internes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter une note interne..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
            <button className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Enregistrer
            </button>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Client</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.customer.name}</p>
              <p className="text-gray-500">{order.customer.email}</p>
              <p className="text-gray-500">{order.customer.phone}</p>
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold-dark">
                {order.customer.loyaltyTier}
              </span>
            </div>
          </motion.div>

          {/* Shipping */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Livraison</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.postal} {order.shippingAddress.city}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
              <p className="text-gray-500">Transporteur: <span className="text-gray-900 font-medium">{order.tracking.carrier}</span></p>
              <p className="text-gray-500 mt-1">N° suivi: <span className="font-mono text-xs text-terracotta">{order.tracking.number}</span></p>
              <p className="text-gray-500 mt-1">Statut: {order.tracking.status}</p>
            </div>
          </motion.div>

          {/* Payment */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Paiement</h3>
            </div>
            <div className="text-sm space-y-1">
              <p className="text-gray-600">{order.payment.method}</p>
              <p className="text-gray-500">{order.payment.brand} ****{order.payment.last4}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
