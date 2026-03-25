'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Copy, X, Percent, Tag, Truck } from 'lucide-react'
import { cn, formatPrice, formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  percent: { label: 'Pourcentage', icon: Percent, color: 'text-terracotta' },
  fixed: { label: 'Montant fixe', icon: Tag, color: 'text-blue-600' },
  free_shipping: { label: 'Livraison offerte', icon: Truck, color: 'text-emerald-600' },
}

const demoCodes = [
  { id: '1', code: 'BIENVENUE15', type: 'percent' as const, value: 15, minOrder: 30, maxUses: 500, usedCount: 187, validFrom: '2025-01-01', validUntil: '2026-12-31', active: true },
  { id: '2', code: 'PRINTEMPS10', type: 'percent' as const, value: 10, minOrder: null, maxUses: 200, usedCount: 89, validFrom: '2026-03-01', validUntil: '2026-05-31', active: true },
  { id: '3', code: 'LIVRAISON', type: 'free_shipping' as const, value: 0, minOrder: 40, maxUses: null, usedCount: 342, validFrom: '2025-06-01', validUntil: null, active: true },
  { id: '4', code: 'FLASH20', type: 'percent' as const, value: 20, minOrder: 50, maxUses: 100, usedCount: 100, validFrom: '2026-02-01', validUntil: '2026-02-14', active: false },
  { id: '5', code: 'NOEL5', type: 'fixed' as const, value: 5, minOrder: 25, maxUses: 300, usedCount: 245, validFrom: '2025-12-01', validUntil: '2025-12-31', active: false },
  { id: '6', code: 'FIDELITE25', type: 'percent' as const, value: 25, minOrder: 80, maxUses: 50, usedCount: 12, validFrom: '2026-01-01', validUntil: '2026-06-30', active: true },
  { id: '7', code: 'ETE2026', type: 'percent' as const, value: 15, minOrder: null, maxUses: 150, usedCount: 0, validFrom: '2026-06-01', validUntil: '2026-08-31', active: true },
]

export default function PromotionsPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Codes promotionnels</h2>
          <p className="text-sm text-gray-500">{demoCodes.length} codes · {demoCodes.filter((c) => c.active).length} actifs</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors">
          <Plus className="w-4 h-4" /> Nouveau code
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Nouveau code promo</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" placeholder="Code (ex: ETE2026)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta">
              <option value="percent">Pourcentage</option>
              <option value="fixed">Montant fixe</option>
              <option value="free_shipping">Livraison offerte</option>
            </select>
            <input type="number" placeholder="Valeur (% ou €)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="number" placeholder="Commande min (€)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
            <input type="number" placeholder="Utilisations max" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
            <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          </div>
          <button className="px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">Créer le code</button>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Valeur</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisations</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Validité</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {demoCodes.map((promo) => {
                const tc = typeConfig[promo.type]
                const Icon = tc.icon
                return (
                  <tr key={promo.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">{promo.code}</span>
                        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 text-sm', tc.color)}>
                        <Icon className="w-3.5 h-3.5" /> {tc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {promo.type === 'percent' ? `${promo.value}%` : promo.type === 'fixed' ? formatPrice(promo.value) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-600">{promo.usedCount}</span>
                      {promo.maxUses && <span className="text-gray-400">/{promo.maxUses}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(promo.validFrom)}
                      {promo.validUntil ? ` → ${formatDate(promo.validUntil)}` : ' → ∞'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', promo.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
                        {promo.active ? 'Actif' : 'Expiré'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors"><Edit className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
