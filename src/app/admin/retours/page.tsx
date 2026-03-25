'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Check, X, Eye } from 'lucide-react'
import { cn, formatPrice, formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

const statusConfig: Record<string, { label: string; className: string }> = {
  requested: { label: 'Demandé', className: 'bg-yellow-50 text-yellow-700' },
  approved: { label: 'Approuvé', className: 'bg-blue-50 text-blue-700' },
  shipped_back: { label: 'Renvoyé', className: 'bg-purple-50 text-purple-700' },
  received: { label: 'Reçu', className: 'bg-indigo-50 text-indigo-700' },
  refunded: { label: 'Remboursé', className: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rejeté', className: 'bg-red-50 text-red-700' },
}

const demoReturns = [
  { id: 'RET-001', orderId: 'ISH-7X2H-E7F2', client: 'Camille Bernard', reason: 'Taille non conforme', detail: 'Le collier est plus petit que prévu', status: 'requested', date: '2026-03-19T14:00:00Z', amount: 45 },
  { id: 'RET-002', orderId: 'ISH-7X1C-O9P6', client: 'Alice Robert', reason: 'Article endommagé', detail: 'La résine présente une fissure', status: 'approved', date: '2026-03-18T11:30:00Z', amount: 52 },
  { id: 'RET-003', orderId: 'ISH-6W1K-B2C4', client: 'Léa Martin', reason: 'Ne correspond pas à la photo', detail: 'Couleur différente de la photo du site', status: 'shipped_back', date: '2026-03-15T09:00:00Z', amount: 39 },
  { id: 'RET-004', orderId: 'ISH-5V0J-D4E6', client: 'Marie Dupont', reason: 'Changement d\'avis', detail: null, status: 'refunded', date: '2026-03-10T16:00:00Z', amount: 68 },
  { id: 'RET-005', orderId: 'ISH-4U9I-F6G8', client: 'Emma Petit', reason: 'Article endommagé', detail: 'Fermoir cassé à la réception', status: 'received', date: '2026-03-08T10:00:00Z', amount: 35 },
  { id: 'RET-006', orderId: 'ISH-3T8H-H8I0', client: 'Sarah Leroy', reason: 'Doublon de commande', detail: 'J\'ai commandé deux fois par erreur', status: 'rejected', date: '2026-03-05T08:00:00Z', amount: 95 },
]

export default function RetoursPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const filtered = demoReturns.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false
    if (search && !r.id.toLowerCase().includes(search.toLowerCase()) && !r.client.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-gray-900">Retours</h2>
        <p className="text-sm text-gray-500">{demoReturns.length} retours · {demoReturns.filter((r) => r.status === 'requested').length} en attente</p>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta">
            <option value="">Tous statuts</option>
            {Object.entries(statusConfig).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
          </select>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">N° Retour</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Commande</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Motif</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ret) => {
                const s = statusConfig[ret.status]
                return (
                  <tr key={ret.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{ret.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-terracotta">{ret.orderId}</td>
                    <td className="px-4 py-3 text-gray-900">{ret.client}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{ret.reason}</p>
                      {ret.detail && <p className="text-xs text-gray-400 mt-0.5">{ret.detail}</p>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', s.className)}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPrice(ret.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(ret.date)}</td>
                    <td className="px-4 py-3">
                      {ret.status === 'requested' ? (
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Approuver"><Check className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Rejeter"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><Eye className="w-4 h-4" /></button>
                      )}
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
