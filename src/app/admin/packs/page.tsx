'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Package, Percent, X } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface Pack {
  id: string
  name: string
  products: string[]
  originalPrice: number
  discountPercent: number
  finalPrice: number
  status: 'active' | 'draft'
  soldCount: number
}

const demoPacks: Pack[] = [
  { id: 'pack-001', name: 'Parure Printemps Éternel', products: ['Collier Fleur d\'Oranger', 'Boucles Pluie de Pétales', 'Bracelet Chaîne Florale'], originalPrice: 119, discountPercent: 15, finalPrice: 101.15, status: 'active', soldCount: 24 },
  { id: 'pack-002', name: 'Coffret Rose Sauvage', products: ['Collier Pétale de Rose', 'Bague Bouton de Pivoine'], originalPrice: 84, discountPercent: 10, finalPrice: 75.60, status: 'active', soldCount: 18 },
  { id: 'pack-003', name: 'Ensemble Bohème Chic', products: ['Collier Éclat Doré', 'Boucles Créoles Botaniques', 'Bague Cercle Fleuri'], originalPrice: 140, discountPercent: 20, finalPrice: 112, status: 'active', soldCount: 12 },
  { id: 'pack-004', name: 'Duo Découverte', products: ['Boucles Puces Marguerite', 'Bracelet Perle Florale'], originalPrice: 62, discountPercent: 10, finalPrice: 55.80, status: 'active', soldCount: 31 },
  { id: 'pack-005', name: 'Coffret Fête des Mères', products: ['Collier Fleur d\'Oranger', 'Bague Bouton de Pivoine', 'Boucles Pluie de Pétales', 'Bracelet Chaîne Florale'], originalPrice: 151, discountPercent: 25, finalPrice: 113.25, status: 'draft', soldCount: 0 },
]

export default function PacksPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Packs & Coffrets</h2>
          <p className="text-sm text-gray-500">{demoPacks.length} packs configurés</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors">
          <Plus className="w-4 h-4" />
          Nouveau pack
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Nouveau pack</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Nom du pack" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
            <input type="number" placeholder="Remise (%)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          </div>
          <textarea placeholder="Sélectionner les produits (bientôt un sélecteur multi-produits)..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          <button className="px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">Créer le pack</button>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pack</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Produits inclus</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Remise</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix final</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendus</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {demoPacks.map((pack) => (
                <tr key={pack.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-terracotta" />
                      </div>
                      <span className="font-medium text-gray-900">{pack.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="max-w-xs">
                      {pack.products.map((p, i) => (
                        <span key={i}>{p}{i < pack.products.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-terracotta font-medium">
                      <Percent className="w-3.5 h-3.5" />{pack.discountPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <span className="font-medium text-gray-900">{formatPrice(pack.finalPrice)}</span>
                      <span className="block text-xs text-gray-400 line-through">{formatPrice(pack.originalPrice)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{pack.soldCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      pack.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {pack.status === 'active' ? 'Actif' : 'Brouillon'}
                    </span>
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
