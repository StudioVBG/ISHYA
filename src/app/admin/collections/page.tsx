'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Calendar, Package, X } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface CollectionItem {
  id: string
  name: string
  image: string
  productCount: number
  startDate: string
  endDate: string | null
  status: 'active' | 'scheduled' | 'ended'
}

const demoCollections: CollectionItem[] = [
  { id: 'col-001', name: 'Printemps Éternel', image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&h=300&fit=crop', productCount: 8, startDate: '2025-03-01', endDate: null, status: 'active' },
  { id: 'col-002', name: 'Rose Sauvage', image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&h=300&fit=crop', productCount: 6, startDate: '2025-02-14', endDate: null, status: 'active' },
  { id: 'col-003', name: 'Jardin Secret', image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=300&fit=crop', productCount: 5, startDate: '2025-04-01', endDate: null, status: 'active' },
  { id: 'col-004', name: 'Fleur de Lune', image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&h=300&fit=crop', productCount: 4, startDate: '2025-05-01', endDate: null, status: 'active' },
  { id: 'col-005', name: 'Terre & Fleur', image: 'https://images.unsplash.com/photo-1501004318855-b174af8a00fe?w=400&h=300&fit=crop', productCount: 7, startDate: '2025-06-01', endDate: null, status: 'active' },
  { id: 'col-006', name: 'Éclats d\'Hiver', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', productCount: 0, startDate: '2026-11-01', endDate: '2027-02-28', status: 'scheduled' },
]

const statusConfig = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700' },
  scheduled: { label: 'Planifiée', className: 'bg-blue-50 text-blue-700' },
  ended: { label: 'Terminée', className: 'bg-gray-100 text-gray-600' },
}

export default function CollectionsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Collections</h2>
          <p className="text-sm text-gray-500">{demoCollections.length} collections</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors">
          <Plus className="w-4 h-4" />
          Nouvelle collection
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoCollections.map((col) => {
          const s = statusConfig[col.status]
          return (
            <motion.div key={col.id} variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
              <div className="relative h-44 overflow-hidden">
                <img src={col.image} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className={cn('absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium', s.className)}>
                  {s.label}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{col.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{col.productCount} produits</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(col.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Edit className="w-3.5 h-3.5" /> Modifier
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Nouvelle collection</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Nom de la collection" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
              <textarea placeholder="Description..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (optionnel)</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
              <button className="px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">Créer</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
