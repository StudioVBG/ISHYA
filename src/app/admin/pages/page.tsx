'use client'

import { motion } from 'framer-motion'
import { Edit, Eye, FileText, Calendar } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

const demoPages = [
  { id: '1', title: 'À propos', slug: '/a-propos', status: 'published', updatedAt: '2026-02-10T10:00:00Z' },
  { id: '2', title: 'Conditions Générales de Vente', slug: '/cgv', status: 'published', updatedAt: '2025-12-01T10:00:00Z' },
  { id: '3', title: 'Politique de confidentialité', slug: '/confidentialite', status: 'published', updatedAt: '2025-12-01T10:00:00Z' },
  { id: '4', title: 'Mentions légales', slug: '/mentions-legales', status: 'published', updatedAt: '2025-12-01T10:00:00Z' },
  { id: '5', title: 'Politique de retours', slug: '/retours', status: 'published', updatedAt: '2026-01-15T10:00:00Z' },
  { id: '6', title: 'Guide des tailles', slug: '/guide-des-tailles', status: 'published', updatedAt: '2026-03-01T10:00:00Z' },
  { id: '7', title: 'Notre histoire', slug: '/notre-histoire', status: 'published', updatedAt: '2026-02-20T10:00:00Z' },
  { id: '8', title: 'Livraison', slug: '/livraison', status: 'published', updatedAt: '2026-01-05T10:00:00Z' },
  { id: '9', title: 'FAQ', slug: '/faq', status: 'published', updatedAt: '2026-03-10T10:00:00Z' },
  { id: '10', title: 'Contact', slug: '/contact', status: 'published', updatedAt: '2025-11-01T10:00:00Z' },
  { id: '11', title: 'Programme de fidélité', slug: '/fidelite', status: 'draft', updatedAt: '2026-03-18T10:00:00Z' },
]

export default function PagesAdminPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-gray-900">Pages statiques</h2>
        <p className="text-sm text-gray-500">{demoPages.length} pages</p>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Page</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dernière modification</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {demoPages.map((page) => (
                <tr key={page.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-900">{page.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{page.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', page.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
                      {page.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(page.updatedAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
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
