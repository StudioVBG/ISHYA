'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Save, Upload, Star, X, GripVertical,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'

const steps = [
  { id: 1, label: 'Informations' },
  { id: 2, label: 'Variantes & Prix' },
  { id: 3, label: 'Médias' },
  { id: 4, label: 'SEO & Publication' },
]

const categoriesList = ['Colliers', 'Bagues', 'Bracelets', 'Boucles d\'oreilles', 'Accessoires', 'Packs & Parures']
const collectionsList = ['Printemps Éternel', 'Rose Sauvage', 'Jardin Secret', 'Fleur de Lune', 'Terre & Fleur']
const variantAxes = ['Taille', 'Matière', 'Pierre', 'Longueur']

interface VariantRow {
  id: string; sku: string; label: string; price: string; stock: string; weight: string
}

const prefilled = {
  name: 'Collier Fleur d\'Oranger',
  shortDesc: 'Pendentif délicat en résine avec de véritables fleurs d\'oranger séchées sur chaîne dorée.',
  longDesc: 'Ce collier artisanal capture la beauté des fleurs d\'oranger dans un pendentif en résine cristalline. Chaque pièce est unique, fabriquée à la main dans notre atelier.',
  category: 'Colliers',
  collections: ['Printemps Éternel', 'Terre & Fleur'],
  tags: 'fleurs, résine, fait main, or',
  material: 'Plaqué or 18K, Résine',
  weight: '12',
  dimensions: 'Pendentif: 2×1.5cm, Chaîne: 45cm+5cm',
  nickelFree: true,
  care: 'Éviter le contact avec l\'eau et les parfums. Ranger dans la pochette fournie.',
  basePrice: '45',
  comparePrice: '',
  selectedAxes: ['Taille', 'Matière'],
  slug: 'collier-fleur-d-oranger',
  metaTitle: 'Collier Fleur d\'Oranger | ISHYA',
  metaDesc: 'Pendentif délicat en résine avec de véritables fleurs d\'oranger séchées sur chaîne dorée. Bijou artisanal unique.',
  status: 'published',
}

export default function EditProduitPage() {
  const params = useParams<{ id: string }>()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(prefilled)
  const [variants, setVariants] = useState<VariantRow[]>([
    { id: '1', sku: 'COL-FO-S-OR', label: 'Taille S / Or', price: '', stock: '10', weight: '11' },
    { id: '2', sku: 'COL-FO-M-OR', label: 'Taille M / Or', price: '', stock: '8', weight: '12' },
    { id: '3', sku: 'COL-FO-L-OR', label: 'Taille L / Or', price: '48', stock: '6', weight: '14' },
    { id: '4', sku: 'COL-FO-S-AG', label: 'Taille S / Argent', price: '42', stock: '12', weight: '11' },
    { id: '5', sku: 'COL-FO-M-AG', label: 'Taille M / Argent', price: '42', stock: '5', weight: '12' },
  ])
  const [mediaFiles, setMediaFiles] = useState([
    { id: '1', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop', primary: true },
    { id: '2', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop', primary: false },
    { id: '3', url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200&h=200&fit=crop', primary: false },
  ])

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  const toggleCollection = (col: string) => {
    setFormData((prev) => ({
      ...prev,
      collections: prev.collections.includes(col) ? prev.collections.filter((c) => c !== col) : [...prev.collections, col],
    }))
  }
  const toggleAxis = (axis: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAxes: prev.selectedAxes.includes(axis) ? prev.selectedAxes.filter((a) => a !== axis) : [...prev.selectedAxes, axis],
    }))
  }
  const setPrimaryMedia = (id: string) => { setMediaFiles((prev) => prev.map((m) => ({ ...m, primary: m.id === id }))) }
  const removeMedia = (id: string) => { setMediaFiles((prev) => prev.filter((m) => m.id !== id)) }

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/produits" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Modifier le produit</h2>
            <p className="text-sm text-gray-500">ID: {params.id}</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
          <Save className="w-4 h-4" />
          Sauvegarder
        </button>
      </div>

      {/* Step indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <button onClick={() => setCurrentStep(step.id)} className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  currentStep === step.id ? 'bg-terracotta text-white' : currentStep > step.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                )}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={cn('text-sm font-medium hidden sm:block', currentStep === step.id ? 'text-gray-900' : 'text-gray-400')}>
                  {step.label}
                </span>
              </button>
              {idx < steps.length - 1 && <div className={cn('flex-1 h-px mx-4', currentStep > step.id ? 'bg-emerald-300' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="bg-white rounded-xl border border-gray-200 p-6">
          {currentStep === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900">Informations produit</h3>
              <div><label className={labelClass}>Nom du produit *</label><input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Description courte *</label><textarea value={formData.shortDesc} onChange={(e) => updateField('shortDesc', e.target.value)} className={cn(inputClass, 'h-20 resize-none')} /></div>
              <div><label className={labelClass}>Description longue</label><textarea value={formData.longDesc} onChange={(e) => updateField('longDesc', e.target.value)} className={cn(inputClass, 'h-36 resize-none')} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Catégorie *</label>
                  <select value={formData.category} onChange={(e) => updateField('category', e.target.value)} className={inputClass}>
                    {categoriesList.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>Matière</label><input type="text" value={formData.material} onChange={(e) => updateField('material', e.target.value)} className={inputClass} /></div>
              </div>
              <div>
                <label className={labelClass}>Collections</label>
                <div className="flex flex-wrap gap-2">
                  {collectionsList.map((col) => (
                    <button key={col} onClick={() => toggleCollection(col)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors', formData.collections.includes(col) ? 'bg-terracotta/10 border-terracotta text-terracotta' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {col}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className={labelClass}>Tags</label><input type="text" value={formData.tags} onChange={(e) => updateField('tags', e.target.value)} className={inputClass} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className={labelClass}>Poids (g)</label><input type="text" value={formData.weight} onChange={(e) => updateField('weight', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Dimensions</label><input type="text" value={formData.dimensions} onChange={(e) => updateField('dimensions', e.target.value)} className={inputClass} /></div>
                <div>
                  <label className={labelClass}>Sans nickel</label>
                  <button onClick={() => updateField('nickelFree', !formData.nickelFree)} className={cn('mt-1 relative inline-flex h-6 w-11 items-center rounded-full transition-colors', formData.nickelFree ? 'bg-emerald-500' : 'bg-gray-300')}>
                    <span className={cn('inline-block h-4 w-4 rounded-full bg-white transition-transform', formData.nickelFree ? 'translate-x-6' : 'translate-x-1')} />
                  </button>
                </div>
              </div>
              <div><label className={labelClass}>Instructions d&apos;entretien</label><textarea value={formData.care} onChange={(e) => updateField('care', e.target.value)} className={cn(inputClass, 'h-20 resize-none')} /></div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900">Variantes & Prix</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Prix de base (€) *</label><input type="text" value={formData.basePrice} onChange={(e) => updateField('basePrice', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Prix barré (€)</label><input type="text" value={formData.comparePrice} onChange={(e) => updateField('comparePrice', e.target.value)} className={inputClass} /></div>
              </div>
              <div>
                <label className={labelClass}>Axes de variation</label>
                <div className="flex flex-wrap gap-2">
                  {variantAxes.map((axis) => (
                    <button key={axis} onClick={() => toggleAxis(axis)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors', formData.selectedAxes.includes(axis) ? 'bg-terracotta/10 border-terracotta text-terracotta' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {axis}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">SKU</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Variante</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Prix (€)</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Stock</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Poids (g)</th>
                  </tr></thead>
                  <tbody>
                    {variants.map((v, idx) => (
                      <tr key={v.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-3 py-2"><input type="text" value={v.sku} onChange={(e) => { const nv = [...variants]; nv[idx] = { ...v, sku: e.target.value }; setVariants(nv) }} className="w-32 px-2 py-1 border border-gray-200 rounded text-xs font-mono" /></td>
                        <td className="px-3 py-2 text-gray-700">{v.label}</td>
                        <td className="px-3 py-2"><input type="text" value={v.price} onChange={(e) => { const nv = [...variants]; nv[idx] = { ...v, price: e.target.value }; setVariants(nv) }} className="w-20 px-2 py-1 border border-gray-200 rounded text-xs" placeholder="—" /></td>
                        <td className="px-3 py-2"><input type="text" value={v.stock} onChange={(e) => { const nv = [...variants]; nv[idx] = { ...v, stock: e.target.value }; setVariants(nv) }} className="w-16 px-2 py-1 border border-gray-200 rounded text-xs" /></td>
                        <td className="px-3 py-2"><input type="text" value={v.weight} onChange={(e) => { const nv = [...variants]; nv[idx] = { ...v, weight: e.target.value }; setVariants(nv) }} className="w-16 px-2 py-1 border border-gray-200 rounded text-xs" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900">Médias</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-terracotta/50 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">Glissez-déposez vos images ici</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP jusqu&apos;à 5 Mo</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mediaFiles.map((media) => (
                  <div key={media.id} className={cn('relative group rounded-lg overflow-hidden border-2 transition-colors', media.primary ? 'border-gold' : 'border-gray-200')}>
                    <img src={media.url} alt="" className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setPrimaryMedia(media.id)} className="p-1.5 bg-white rounded-lg shadow-sm"><Star className={cn('w-4 h-4', media.primary ? 'text-gold fill-gold' : 'text-gray-600')} /></button>
                        <button className="p-1.5 bg-white rounded-lg shadow-sm cursor-grab"><GripVertical className="w-4 h-4 text-gray-600" /></button>
                        <button onClick={() => removeMedia(media.id)} className="p-1.5 bg-white rounded-lg shadow-sm"><X className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                    {media.primary && <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-gold text-white text-[10px] font-semibold rounded">Principale</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900">SEO & Publication</h3>
              <div>
                <label className={labelClass}>Slug (URL)</label>
                <div className="flex items-center gap-2"><span className="text-sm text-gray-400">/produit/</span><input type="text" value={formData.slug} onChange={(e) => updateField('slug', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Meta title</label><input type="text" value={formData.metaTitle} onChange={(e) => updateField('metaTitle', e.target.value)} className={inputClass} /><p className="text-xs text-gray-400 mt-1">{formData.metaTitle.length}/60 caractères</p></div>
              <div><label className={labelClass}>Meta description</label><textarea value={formData.metaDesc} onChange={(e) => updateField('metaDesc', e.target.value)} className={cn(inputClass, 'h-20 resize-none')} /><p className="text-xs text-gray-400 mt-1">{formData.metaDesc.length}/160 caractères</p></div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Aperçu SERP</p>
                <p className="text-blue-700 text-base font-medium truncate">{formData.metaTitle || 'Titre'}</p>
                <p className="text-emerald-700 text-xs mt-0.5">ishya.fr/produit/{formData.slug}</p>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{formData.metaDesc || 'Description...'}</p>
              </div>
              <div>
                <label className={labelClass}>Statut de publication</label>
                <div className="flex gap-3">
                  {(['draft', 'published', 'scheduled'] as const).map((s) => {
                    const labels = { draft: 'Brouillon', published: 'Publié', scheduled: 'Planifié' }
                    return (
                      <button key={s} onClick={() => updateField('status', s)} className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-colors', formData.status === s ? 'bg-terracotta text-white border-terracotta' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                        {labels[s]}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button className="w-full py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta-dark transition-colors">
                Sauvegarder les modifications
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors', currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100')}>
          <ChevronLeft className="w-4 h-4" /> Précédent
        </button>
        <button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))} disabled={currentStep === 4} className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors', currentStep === 4 ? 'text-gray-300 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800')}>
          Suivant <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}
