'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Plus, Trash2, Globe, FileCode, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'

const demoRedirects = [
  { id: '1', from: '/ancien-collier-rose', to: '/produit/collier-petale-de-rose', type: '301' },
  { id: '2', from: '/promo-noel', to: '/promotions', type: '301' },
  { id: '3', from: '/bijoux-fleurs', to: '/boutique', type: '301' },
  { id: '4', from: '/parure-ete', to: '/collections/terre-et-fleur', type: '301' },
  { id: '5', from: '/old-blog/entretien', to: '/blog/comment-entretenir-vos-bijoux-en-resine', type: '301' },
]

export default function SeoPage() {
  const [metaTitle, setMetaTitle] = useState('ISHYA | Bijoux artisanaux en fleurs séchées et résine')
  const [metaDesc, setMetaDesc] = useState('Découvrez les bijoux artisanaux ISHYA : colliers, bagues, bracelets et boucles d\'oreilles en fleurs séchées préservées dans la résine. Pièces uniques faites main en France.')
  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/

Sitemap: https://ishya.fr/sitemap.xml`)
  const [redirects, setRedirects] = useState(demoRedirects)
  const [newFrom, setNewFrom] = useState('')
  const [newTo, setNewTo] = useState('')

  const addRedirect = () => {
    if (newFrom && newTo) {
      setRedirects([...redirects, { id: String(Date.now()), from: newFrom, to: newTo, type: '301' }])
      setNewFrom('')
      setNewTo('')
    }
  }

  const removeRedirect = (id: string) => {
    setRedirects(redirects.filter((r) => r.id !== id))
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta'

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-gray-900">SEO</h2>
        <p className="text-sm text-gray-500">Paramètres de référencement global</p>
      </motion.div>

      {/* Global Meta */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-gray-400" />
          <h3 className="text-base font-semibold text-gray-900">Meta globales</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta title (page d&apos;accueil)</label>
          <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} />
          <p className="text-xs text-gray-400 mt-1">{metaTitle.length}/60 caractères</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta description (page d&apos;accueil)</label>
          <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} className={cn(inputClass, 'h-20 resize-none')} />
          <p className="text-xs text-gray-400 mt-1">{metaDesc.length}/160 caractères</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Aperçu SERP</p>
          <p className="text-blue-700 text-base font-medium truncate">{metaTitle}</p>
          <p className="text-emerald-700 text-xs mt-0.5">ishya.fr</p>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{metaDesc}</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
          <Save className="w-4 h-4" /> Enregistrer
        </button>
      </motion.div>

      {/* Robots.txt */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileCode className="w-5 h-5 text-gray-400" />
          <h3 className="text-base font-semibold text-gray-900">Robots.txt</h3>
        </div>
        <textarea
          value={robotsTxt}
          onChange={(e) => setRobotsTxt(e.target.value)}
          className={cn(inputClass, 'h-40 resize-none font-mono text-xs')}
        />
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
          <Save className="w-4 h-4" /> Enregistrer
        </button>
      </motion.div>

      {/* Redirections */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <h3 className="text-base font-semibold text-gray-900">Redirections 301</h3>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">URL source</label>
            <input type="text" value={newFrom} onChange={(e) => setNewFrom(e.target.value)} placeholder="/ancienne-url" className={inputClass} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">URL destination</label>
            <input type="text" value={newTo} onChange={(e) => setNewTo(e.target.value)} placeholder="/nouvelle-url" className={inputClass} />
          </div>
          <button onClick={addRedirect} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Source</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Destination</th>
                <th className="px-4 py-2 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-gray-600">{r.from}</td>
                  <td className="px-4 py-2 text-center"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono">{r.type}</span></td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-600">{r.to}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => removeRedirect(r.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
