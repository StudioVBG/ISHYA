'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, X, Image as ImageIcon } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

const positionLabels: Record<string, string> = {
  hero: 'Hero (Accueil)',
  promo_bar: 'Bandeau promo',
  category_header: 'Header catégorie',
  sidebar: 'Sidebar',
  checkout: 'Checkout',
}

const demoBanners = [
  { id: '1', title: 'Nouvelle collection Printemps', position: 'hero', image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=300&h=120&fit=crop', text: 'Découvrez Printemps Éternel', link: '/collections/printemps-eternel', active: true, startDate: '2026-03-01', endDate: null },
  { id: '2', title: 'Livraison offerte dès 60€', position: 'promo_bar', image: '', text: 'Livraison offerte dès 60€ d\'achat', link: null, active: true, startDate: '2025-01-01', endDate: null },
  { id: '3', title: 'Soldes d\'été -20%', position: 'hero', image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=300&h=120&fit=crop', text: 'Jusqu\'à -20% sur une sélection', link: '/promotions', active: false, startDate: '2026-06-15', endDate: '2026-07-15' },
  { id: '4', title: 'Fête des mères', position: 'hero', image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=300&h=120&fit=crop', text: 'Offrez un bijou unique', link: '/idees-cadeaux', active: false, startDate: '2026-05-15', endDate: '2026-05-25' },
  { id: '5', title: 'Promo code BIENVENUE15', position: 'promo_bar', image: '', text: '-15% avec le code BIENVENUE15', link: null, active: true, startDate: '2025-01-01', endDate: '2026-12-31' },
  { id: '6', title: 'Guide des tailles', position: 'sidebar', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=120&fit=crop', text: 'Trouvez votre taille', link: '/guide-des-tailles', active: true, startDate: '2025-01-01', endDate: null },
]

export default function BannieresPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bannières</h2>
          <p className="text-sm text-gray-500">{demoBanners.length} bannières · {demoBanners.filter((b) => b.active).length} actives</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors">
          <Plus className="w-4 h-4" /> Nouvelle bannière
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Nouvelle bannière</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Titre interne" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta">
              {Object.entries(positionLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Texte de la bannière" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
            <input type="text" placeholder="Lien (URL)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Début</label><input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Fin (optionnel)</label><input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" /></div>
          </div>
          <button className="px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">Créer</button>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bannière</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Texte</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Période</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {demoBanners.map((banner) => (
                <tr key={banner.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {banner.image ? (
                        <img src={banner.image} alt="" className="w-16 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>
                      )}
                      <span className="font-medium text-gray-900">{banner.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">{positionLabels[banner.position]}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{banner.text}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', banner.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
                      {banner.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDate(banner.startDate)}{banner.endDate ? ` → ${formatDate(banner.endDate)}` : ' → ∞'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
