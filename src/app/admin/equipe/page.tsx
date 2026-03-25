'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Mail, Clock, Shield, X } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

const roleConfig: Record<string, { label: string; className: string }> = {
  super_admin: { label: 'Super Admin', className: 'bg-purple-100 text-purple-700' },
  admin: { label: 'Admin', className: 'bg-terracotta/10 text-terracotta-dark' },
  editor: { label: 'Éditeur', className: 'bg-blue-50 text-blue-700' },
  support: { label: 'Support', className: 'bg-emerald-50 text-emerald-700' },
}

const demoMembers = [
  { id: '1', name: 'Sophie Andrieu', email: 'sophie@ishya.fr', role: 'super_admin', avatar: 'SA', lastLogin: '2026-03-20T14:30:00Z', active: true },
  { id: '2', name: 'Camille Lefort', email: 'camille@ishya.fr', role: 'admin', avatar: 'CL', lastLogin: '2026-03-20T10:15:00Z', active: true },
  { id: '3', name: 'Lucas Moreau', email: 'lucas@ishya.fr', role: 'editor', avatar: 'LM', lastLogin: '2026-03-19T16:45:00Z', active: true },
  { id: '4', name: 'Manon Girard', email: 'manon@ishya.fr', role: 'support', avatar: 'MG', lastLogin: '2026-03-20T09:00:00Z', active: true },
  { id: '5', name: 'Thomas Petit', email: 'thomas@ishya.fr', role: 'support', avatar: 'TP', lastLogin: '2026-03-18T11:30:00Z', active: true },
  { id: '6', name: 'Julie Renard', email: 'julie@ishya.fr', role: 'editor', avatar: 'JR', lastLogin: '2026-02-28T14:00:00Z', active: false },
]

export default function EquipePage() {
  const [showInvite, setShowInvite] = useState(false)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Équipe</h2>
          <p className="text-sm text-gray-500">{demoMembers.length} membres · {demoMembers.filter((m) => m.active).length} actifs</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors">
          <Plus className="w-4 h-4" /> Inviter
        </button>
      </motion.div>

      {showInvite && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Inviter un membre</h3>
            <button onClick={() => setShowInvite(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="email" placeholder="Adresse email" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta">
              <option value="">Sélectionner un rôle</option>
              {Object.entries(roleConfig).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
            <button className="px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
              Envoyer l&apos;invitation
            </button>
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Membre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dernière connexion</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {demoMembers.map((member) => {
                const r = roleConfig[member.role]
                return (
                  <tr key={member.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-terracotta">{member.avatar}</span>
                        </div>
                        <span className="font-medium text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-gray-600"><Mail className="w-3.5 h-3.5" />{member.email}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', r.className)}>{r.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-gray-500 text-xs"><Clock className="w-3.5 h-3.5" />{formatDate(member.lastLogin)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', member.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
                        {member.active ? 'Actif' : 'Inactif'}
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
