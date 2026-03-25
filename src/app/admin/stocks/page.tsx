'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, AlertTriangle, Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface StockRow {
  id: string
  product: string
  sku: string
  variant: string
  stock: number
  threshold: number
}

const demoStocks: StockRow[] = [
  { id: '1', product: 'Collier Fleur d\'Oranger', sku: 'COL-FO-S-OR', variant: 'S / Or', stock: 10, threshold: 5 },
  { id: '2', product: 'Collier Fleur d\'Oranger', sku: 'COL-FO-M-OR', variant: 'M / Or', stock: 8, threshold: 5 },
  { id: '3', product: 'Collier Fleur d\'Oranger', sku: 'COL-FO-L-OR', variant: 'L / Or', stock: 2, threshold: 5 },
  { id: '4', product: 'Collier Fleur d\'Oranger', sku: 'COL-FO-S-AG', variant: 'S / Argent', stock: 12, threshold: 5 },
  { id: '5', product: 'Collier Pétale de Rose', sku: 'COL-PR-001', variant: 'Standard', stock: 18, threshold: 5 },
  { id: '6', product: 'Collier Éclat Doré', sku: 'COL-ED-001', variant: 'Standard', stock: 3, threshold: 5 },
  { id: '7', product: 'Bague Bouton de Pivoine', sku: 'BAG-BP-50', variant: 'Taille 50', stock: 15, threshold: 5 },
  { id: '8', product: 'Bague Bouton de Pivoine', sku: 'BAG-BP-52', variant: 'Taille 52', stock: 0, threshold: 5 },
  { id: '9', product: 'Bague Bouton de Pivoine', sku: 'BAG-BP-54', variant: 'Taille 54', stock: 0, threshold: 5 },
  { id: '10', product: 'Bague Cercle Fleuri', sku: 'BAG-CF-52', variant: 'Taille 52', stock: 20, threshold: 5 },
  { id: '11', product: 'Bracelet Chaîne Florale', sku: 'BRA-CF-16', variant: '16cm', stock: 4, threshold: 5 },
  { id: '12', product: 'Bracelet Chaîne Florale', sku: 'BRA-CF-18', variant: '18cm', stock: 3, threshold: 5 },
  { id: '13', product: 'Bracelet Jonc Résine', sku: 'BRA-JR-S', variant: 'S', stock: 0, threshold: 3 },
  { id: '14', product: 'Bracelet Jonc Résine', sku: 'BRA-JR-M', variant: 'M', stock: 0, threshold: 3 },
  { id: '15', product: 'Boucles Pluie de Pétales', sku: 'BO-PP-001', variant: 'Standard', stock: 22, threshold: 5 },
  { id: '16', product: 'Boucles Créoles Botaniques', sku: 'BO-CB-001', variant: 'Standard', stock: 15, threshold: 5 },
  { id: '17', product: 'Boucles Puces Marguerite', sku: 'BO-PM-001', variant: 'Standard', stock: 56, threshold: 10 },
  { id: '18', product: 'Barrette Fleurs Séchées', sku: 'ACC-BF-001', variant: 'Standard', stock: 3, threshold: 5 },
  { id: '19', product: 'Parure Printemps', sku: 'PAR-PR-001', variant: 'Standard', stock: 9, threshold: 3 },
  { id: '20', product: 'Bracelet Perle Florale', sku: 'BRA-PF-16', variant: '16cm', stock: 7, threshold: 5 },
]

function getStockStatus(stock: number, threshold: number) {
  if (stock === 0) return { label: 'Rupture', className: 'bg-red-50 text-red-700', dotColor: 'bg-red-500' }
  if (stock <= threshold) return { label: 'Stock bas', className: 'bg-orange-50 text-orange-700', dotColor: 'bg-orange-500' }
  return { label: 'OK', className: 'bg-emerald-50 text-emerald-700', dotColor: 'bg-emerald-500' }
}

export default function StocksPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'low' | 'out'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [stocks, setStocks] = useState(demoStocks)

  const filtered = stocks.filter((s) => {
    if (search && !s.product.toLowerCase().includes(search.toLowerCase()) && !s.sku.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter === 'ok' && (s.stock === 0 || s.stock <= s.threshold)) return false
    if (statusFilter === 'low' && (s.stock === 0 || s.stock > s.threshold)) return false
    if (statusFilter === 'out' && s.stock !== 0) return false
    return true
  })

  const outCount = stocks.filter((s) => s.stock === 0).length
  const lowCount = stocks.filter((s) => s.stock > 0 && s.stock <= s.threshold).length

  const saveEdit = (id: string) => {
    const val = parseInt(editValue)
    if (!isNaN(val) && val >= 0) {
      setStocks((prev) => prev.map((s) => s.id === id ? { ...s, stock: val } : s))
    }
    setEditingId(null)
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des stocks</h2>
          <p className="text-sm text-gray-500">
            {stocks.length} variantes ·
            <span className="text-red-600 ml-1">{outCount} en rupture</span> ·
            <span className="text-orange-500 ml-1">{lowCount} stock bas</span>
          </p>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher produit ou SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
          </div>
          <div className="flex gap-2">
            {([['all', 'Tous'], ['ok', 'OK'], ['low', 'Stock bas'], ['out', 'Rupture']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setStatusFilter(key)} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors', statusFilter === key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Variante</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Seuil</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const status = getStockStatus(row.stock, row.threshold)
                const isEditing = editingId === row.id
                return (
                  <tr key={row.id} className={cn('border-b border-gray-50 last:border-0 transition-colors', row.stock === 0 ? 'bg-red-50/30' : row.stock <= row.threshold ? 'bg-orange-50/30' : 'hover:bg-gray-50/50')}>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.product}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.sku}</td>
                    <td className="px-4 py-3 text-gray-600">{row.variant}</td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:border-terracotta" autoFocus onKeyDown={(e) => e.key === 'Enter' && saveEdit(row.id)} />
                          <button onClick={() => saveEdit(row.id)} className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><Check className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(row.id); setEditValue(String(row.stock)) }} className={cn('font-bold tabular-nums hover:underline', row.stock === 0 ? 'text-red-600' : row.stock <= row.threshold ? 'text-orange-500' : 'text-gray-900')}>
                          {row.stock}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400">{row.threshold}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', status.className)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', status.dotColor)} />
                        {status.label}
                      </span>
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
