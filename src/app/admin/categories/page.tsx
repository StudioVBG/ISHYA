'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderTree, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface CategoryNode {
  id: string
  name: string
  slug: string
  image: string
  productCount: number
  children: CategoryNode[]
}

const demoCategories: CategoryNode[] = [
  {
    id: 'cat-001', name: 'Colliers', slug: 'colliers',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=40&h=40&fit=crop',
    productCount: 12,
    children: [
      { id: 'cat-001-1', name: 'Pendentifs', slug: 'pendentifs', image: '', productCount: 5, children: [] },
      { id: 'cat-001-2', name: 'Sautoirs', slug: 'sautoirs', image: '', productCount: 3, children: [] },
      { id: 'cat-001-3', name: 'Ras-de-cou', slug: 'ras-de-cou', image: '', productCount: 2, children: [] },
      { id: 'cat-001-4', name: 'Chaînes', slug: 'chaines', image: '', productCount: 2, children: [] },
    ],
  },
  {
    id: 'cat-002', name: 'Bagues', slug: 'bagues',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=40&h=40&fit=crop',
    productCount: 8,
    children: [
      { id: 'cat-002-1', name: 'Bagues réglables', slug: 'bagues-reglables', image: '', productCount: 4, children: [] },
      { id: 'cat-002-2', name: 'Bagues fines', slug: 'bagues-fines', image: '', productCount: 2, children: [] },
      { id: 'cat-002-3', name: 'Chevalières', slug: 'chevalieres', image: '', productCount: 1, children: [] },
      { id: 'cat-002-4', name: 'Bagues de phalange', slug: 'bagues-phalange', image: '', productCount: 1, children: [] },
    ],
  },
  {
    id: 'cat-003', name: 'Bracelets', slug: 'bracelets',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=40&h=40&fit=crop',
    productCount: 7,
    children: [
      { id: 'cat-003-1', name: 'Joncs', slug: 'joncs', image: '', productCount: 2, children: [] },
      { id: 'cat-003-2', name: 'Chaînes', slug: 'bracelets-chaines', image: '', productCount: 3, children: [] },
      { id: 'cat-003-3', name: 'Manchettes', slug: 'manchettes', image: '', productCount: 1, children: [] },
      { id: 'cat-003-4', name: 'Bracelets perles', slug: 'bracelets-perles', image: '', productCount: 1, children: [] },
    ],
  },
  {
    id: 'cat-004', name: 'Boucles d\'oreilles', slug: 'boucles-d-oreilles',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=40&h=40&fit=crop',
    productCount: 10,
    children: [
      { id: 'cat-004-1', name: 'Puces', slug: 'puces', image: '', productCount: 3, children: [] },
      { id: 'cat-004-2', name: 'Créoles', slug: 'creoles', image: '', productCount: 2, children: [] },
      { id: 'cat-004-3', name: 'Pendantes', slug: 'pendantes', image: '', productCount: 3, children: [] },
      { id: 'cat-004-4', name: 'Clips', slug: 'clips', image: '', productCount: 1, children: [] },
      { id: 'cat-004-5', name: 'Dormeuses', slug: 'dormeuses', image: '', productCount: 1, children: [] },
    ],
  },
  {
    id: 'cat-005', name: 'Accessoires', slug: 'accessoires',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=40&h=40&fit=crop',
    productCount: 5,
    children: [
      { id: 'cat-005-1', name: 'Barrettes', slug: 'barrettes', image: '', productCount: 2, children: [] },
      { id: 'cat-005-2', name: 'Broches', slug: 'broches', image: '', productCount: 1, children: [] },
      { id: 'cat-005-3', name: 'Bijoux de cheveux', slug: 'bijoux-cheveux', image: '', productCount: 1, children: [] },
      { id: 'cat-005-4', name: 'Porte-clés', slug: 'porte-cles', image: '', productCount: 1, children: [] },
    ],
  },
  {
    id: 'cat-006', name: 'Packs & Parures', slug: 'packs-parures',
    image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=40&h=40&fit=crop',
    productCount: 4,
    children: [
      { id: 'cat-006-1', name: 'Coffrets découverte', slug: 'coffrets-decouverte', image: '', productCount: 1, children: [] },
      { id: 'cat-006-2', name: 'Parures assorties', slug: 'parures-assorties', image: '', productCount: 2, children: [] },
      { id: 'cat-006-3', name: 'Coffrets cadeaux', slug: 'coffrets-cadeaux', image: '', productCount: 1, children: [] },
      { id: 'cat-006-4', name: 'Éditions limitées', slug: 'editions-limitees', image: '', productCount: 0, children: [] },
    ],
  },
]

function CategoryRow({ cat, depth = 0 }: { cat: CategoryNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = cat.children.length > 0

  return (
    <>
      <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)} className="p-0.5 rounded hover:bg-gray-200 transition-colors">
                {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            {cat.image ? (
              <img src={cat.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <FolderTree className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <span className={cn('font-medium', depth === 0 ? 'text-gray-900' : 'text-gray-700')}>{cat.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{cat.slug}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{cat.productCount}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors"><Edit className="w-4 h-4" /></button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        </td>
      </tr>
      {expanded && cat.children.map((child) => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} />
      ))}
    </>
  )
}

export default function CategoriesPage() {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Catégories</h2>
          <p className="text-sm text-gray-500">{demoCategories.length} catégories parentes · {demoCategories.reduce((acc, c) => acc + c.children.length, 0)} sous-catégories</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </button>
      </motion.div>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Ajouter une catégorie</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" placeholder="Nom de la catégorie" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta">
              <option value="">Catégorie parente (aucune)</option>
              {demoCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
              Ajouter
            </button>
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Produits</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demoCategories.map((cat) => (
                <CategoryRow key={cat.id} cat={cat} />
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
