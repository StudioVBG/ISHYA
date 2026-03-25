'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, Calendar, User } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

const demoPosts = [
  { id: 'blog-001', title: 'Comment entretenir vos bijoux en résine', author: 'Sophie Admin', status: 'published', date: '2026-03-15T10:00:00Z', excerpt: 'Découvrez nos conseils pour conserver l\'éclat de vos bijoux en résine florale...', coverImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=120&fit=crop', views: 342 },
  { id: 'blog-002', title: 'Les tendances bijoux printemps 2026', author: 'Sophie Admin', status: 'published', date: '2026-03-10T10:00:00Z', excerpt: 'Cette saison, les bijoux floraux sont plus que jamais au cœur des tendances...', coverImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=120&fit=crop', views: 528 },
  { id: 'blog-003', title: 'L\'art de la résine florale : notre processus créatif', author: 'Sophie Admin', status: 'published', date: '2026-02-28T10:00:00Z', excerpt: 'Plongez dans les coulisses de notre atelier et découvrez comment naissent vos bijoux...', coverImage: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200&h=120&fit=crop', views: 891 },
  { id: 'blog-004', title: 'Guide cadeau : offrir un bijou floral', author: 'Sophie Admin', status: 'draft', date: '2026-03-18T10:00:00Z', excerpt: 'Trouver le bijou parfait à offrir n\'a jamais été aussi simple...', coverImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=120&fit=crop', views: 0 },
  { id: 'blog-005', title: '5 façons de porter vos bijoux ISHYA au quotidien', author: 'Sophie Admin', status: 'draft', date: '2026-03-20T10:00:00Z', excerpt: 'Des idées de styling pour intégrer vos pièces florales dans vos looks de tous les jours...', coverImage: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=200&h=120&fit=crop', views: 0 },
  { id: 'blog-006', title: 'Notre engagement écoresponsable', author: 'Sophie Admin', status: 'published', date: '2026-02-14T10:00:00Z', excerpt: 'Chez ISHYA, chaque bijou est créé dans le respect de la nature et de l\'environnement...', coverImage: 'https://images.unsplash.com/photo-1501004318855-b174af8a00fe?w=200&h=120&fit=crop', views: 456 },
]

export default function BlogPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Blog</h2>
          <p className="text-sm text-gray-500">{demoPosts.length} articles · {demoPosts.filter((p) => p.status === 'published').length} publiés</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors">
          <Plus className="w-4 h-4" /> Nouvel article
        </button>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Article</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Auteur</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Vues</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {demoPosts.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={post.coverImage} alt="" className="w-16 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 truncate">{post.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-gray-600"><User className="w-3.5 h-3.5" />{post.author}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', post.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
                      {post.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{post.views > 0 ? post.views : '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(post.date)}</td>
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
