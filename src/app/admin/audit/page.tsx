'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Shield, User, Calendar } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

const actionConfig: Record<string, { label: string; className: string }> = {
  create: { label: 'Création', className: 'bg-emerald-50 text-emerald-700' },
  update: { label: 'Modification', className: 'bg-blue-50 text-blue-700' },
  delete: { label: 'Suppression', className: 'bg-red-50 text-red-700' },
  login: { label: 'Connexion', className: 'bg-gray-100 text-gray-700' },
  export: { label: 'Export', className: 'bg-purple-50 text-purple-700' },
  status_change: { label: 'Changement statut', className: 'bg-orange-50 text-orange-700' },
}

const demoAuditLog = [
  { id: '1', date: '2026-03-20T14:32:00Z', user: 'Sophie Andrieu', action: 'status_change', details: 'Commande ISH-7X2K-A9B3 : statut → "Payée"', ip: '192.168.1.42' },
  { id: '2', date: '2026-03-20T14:15:00Z', user: 'Sophie Andrieu', action: 'update', details: 'Produit "Collier Fleur d\'Oranger" : prix modifié 42€ → 45€', ip: '192.168.1.42' },
  { id: '3', date: '2026-03-20T13:50:00Z', user: 'Camille Lefort', action: 'create', details: 'Nouveau code promo "ETE2026" créé', ip: '192.168.1.55' },
  { id: '4', date: '2026-03-20T12:30:00Z', user: 'Lucas Moreau', action: 'update', details: 'Article blog "Tendances printemps 2026" modifié', ip: '192.168.1.78' },
  { id: '5', date: '2026-03-20T11:00:00Z', user: 'Manon Girard', action: 'status_change', details: 'Ticket TIC-003 : statut → "En cours"', ip: '192.168.1.33' },
  { id: '6', date: '2026-03-20T10:15:00Z', user: 'Camille Lefort', action: 'login', details: 'Connexion depuis Chrome / macOS', ip: '192.168.1.55' },
  { id: '7', date: '2026-03-20T09:45:00Z', user: 'Sophie Andrieu', action: 'export', details: 'Export CSV des commandes (Mars 2026)', ip: '192.168.1.42' },
  { id: '8', date: '2026-03-20T09:00:00Z', user: 'Manon Girard', action: 'login', details: 'Connexion depuis Firefox / Windows', ip: '192.168.1.33' },
  { id: '9', date: '2026-03-19T17:30:00Z', user: 'Sophie Andrieu', action: 'delete', details: 'Bannière "Black Friday 2025" supprimée', ip: '192.168.1.42' },
  { id: '10', date: '2026-03-19T16:45:00Z', user: 'Lucas Moreau', action: 'create', details: 'Nouvel article blog "Guide cadeau" créé (brouillon)', ip: '192.168.1.78' },
  { id: '11', date: '2026-03-19T15:20:00Z', user: 'Sophie Andrieu', action: 'update', details: 'Stock variant COL-FO-L-OR ajusté : 6 → 2', ip: '192.168.1.42' },
  { id: '12', date: '2026-03-19T14:00:00Z', user: 'Camille Lefort', action: 'status_change', details: 'Retour RET-002 : statut → "Approuvé"', ip: '192.168.1.55' },
  { id: '13', date: '2026-03-19T11:30:00Z', user: 'Thomas Petit', action: 'update', details: 'Ticket TIC-002 : réponse envoyée', ip: '192.168.1.67' },
  { id: '14', date: '2026-03-19T10:00:00Z', user: 'Sophie Andrieu', action: 'create', details: 'Nouvelle collection "Éclats d\'Hiver" créée', ip: '192.168.1.42' },
  { id: '15', date: '2026-03-18T16:30:00Z', user: 'Sophie Andrieu', action: 'update', details: 'Paramètres livraison : seuil gratuit 50€ → 60€', ip: '192.168.1.42' },
]

export default function AuditPage() {
  const [userFilter, setUserFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [search, setSearch] = useState('')

  const users = [...new Set(demoAuditLog.map((l) => l.user))]

  const filtered = demoAuditLog.filter((l) => {
    if (userFilter && l.user !== userFilter) return false
    if (actionFilter && l.action !== actionFilter) return false
    if (search && !l.details.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-gray-900">Journal d&apos;audit</h2>
        <p className="text-sm text-gray-500">Historique complet des actions administratives</p>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher dans les détails..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          </div>
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta">
            <option value="">Tous les utilisateurs</option>
            {users.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta">
            <option value="">Toutes actions</option>
            {Object.entries(actionConfig).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
          </select>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Détails</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const a = actionConfig[log.action]
                return (
                  <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(log.date)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <User className="w-3.5 h-3.5 text-gray-400" />{log.user}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', a.className)}>{a.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-md">{log.details}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-400">{log.ip}</td>
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
