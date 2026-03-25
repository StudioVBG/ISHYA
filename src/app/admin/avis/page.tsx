'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Check, X, Star, Filter } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

const demoReviews = [
  { id: '1', product: 'Collier Fleur d\'Oranger', client: 'Marie Dupont', rating: 5, content: 'Magnifique collier ! Les fleurs sont sublimes et la chaîne est de très bonne qualité. Je suis ravie de mon achat.', status: 'approved', verified: true, date: '2026-03-18T10:00:00Z' },
  { id: '2', product: 'Boucles Pluie de Pétales', client: 'Léa Martin', rating: 4, content: 'Très jolies boucles d\'oreilles, fidèles à la photo. Juste un peu lourdes pour un port quotidien.', status: 'approved', verified: true, date: '2026-03-17T14:30:00Z' },
  { id: '3', product: 'Bague Bouton de Pivoine', client: 'Emma Petit', rating: 5, content: 'Un bijou d\'exception ! La pivoine est magnifiquement préservée. J\'ai reçu plein de compliments.', status: 'pending', verified: true, date: '2026-03-16T09:00:00Z' },
  { id: '4', product: 'Bracelet Chaîne Florale', client: 'Julie Moreau', rating: 3, content: 'Le bracelet est joli mais le fermoir semble fragile. La résine est bien faite cependant.', status: 'pending', verified: false, date: '2026-03-15T16:00:00Z' },
  { id: '5', product: 'Collier Éclat Doré', client: 'Sarah Leroy', rating: 5, content: 'Un vrai coup de cœur ! Le pendentif est encore plus beau en vrai. L\'emballage était soigné, parfait pour un cadeau.', status: 'approved', verified: true, date: '2026-03-14T11:00:00Z' },
  { id: '6', product: 'Bague Cercle Fleuri', client: 'Clara Dubois', rating: 2, content: 'Déçue par la taille, c\'est beaucoup plus petit que ce que je pensais. La qualité est ok mais pas au niveau du prix.', status: 'pending', verified: true, date: '2026-03-13T08:00:00Z' },
  { id: '7', product: 'Boucles Créoles Botaniques', client: 'Alice Robert', rating: 4, content: 'Créoles originales et légères. Le packaging est superbe. Je recommande !', status: 'approved', verified: true, date: '2026-03-12T15:00:00Z' },
  { id: '8', product: 'Bracelet Perle Florale', client: 'Chloé Richard', rating: 5, content: 'Bracelet délicat et raffiné. Les perles et les fleurs sont un mariage parfait. Livraison rapide.', status: 'approved', verified: true, date: '2026-03-11T12:00:00Z' },
  { id: '9', product: 'Collier Pétale de Rose', client: 'Manon Thomas', rating: 1, content: 'Le pétale a changé de couleur au bout de 2 jours. Très déçue.', status: 'pending', verified: false, date: '2026-03-20T07:00:00Z' },
]

export default function AvisPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const filtered = demoReviews.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false
    if (search && !r.product.toLowerCase().includes(search.toLowerCase()) && !r.client.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const pendingCount = demoReviews.filter((r) => r.status === 'pending').length
  const avgRating = (demoReviews.reduce((a, r) => a + r.rating, 0) / demoReviews.length).toFixed(1)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-gray-900">Modération des avis</h2>
        <p className="text-sm text-gray-500">{demoReviews.length} avis · {pendingCount} en attente · Note moyenne: {avgRating}/5</p>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher par produit ou client..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta">
            <option value="">Tous les avis</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
          </select>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="space-y-3">
        {filtered.map((review) => (
          <div key={review.id} className={cn(
            'bg-white rounded-xl border p-5 transition-colors',
            review.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-200'
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-gray-900">{review.product}</span>
                  <span className="text-sm text-gray-400">par</span>
                  <span className="text-sm text-gray-700">{review.client}</span>
                  {review.verified && (
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded">Achat vérifié</span>
                  )}
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('w-4 h-4', i < review.rating ? 'text-gold fill-gold' : 'text-gray-200')} />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(review.date)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {review.status === 'pending' ? (
                  <>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
                      <Check className="w-4 h-4" /> Approuver
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                      <X className="w-4 h-4" /> Rejeter
                    </button>
                  </>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Approuvé</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
