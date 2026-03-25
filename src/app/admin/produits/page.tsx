'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, getPaginationRowModel, flexRender,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table'
import { Plus, Search, Trash2, Edit, ChevronUp, ChevronDown, Filter } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

interface AdminProduct {
  id: string
  image: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
  status: 'active' | 'draft'
}

const demoProducts: AdminProduct[] = [
  { id: 'prod-001', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=60&h=60&fit=crop', name: 'Collier Fleur d\'Oranger', sku: 'COL-FO-001', price: 45, stock: 24, category: 'Colliers', status: 'active' },
  { id: 'prod-002', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=60&h=60&fit=crop', name: 'Collier Pétale de Rose', sku: 'COL-PR-001', price: 52, stock: 18, category: 'Colliers', status: 'active' },
  { id: 'prod-003', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=60&h=60&fit=crop', name: 'Collier Éclat Doré', sku: 'COL-ED-001', price: 68, stock: 12, category: 'Colliers', status: 'active' },
  { id: 'prod-004', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=60&h=60&fit=crop', name: 'Bague Bouton de Pivoine', sku: 'BAG-BP-001', price: 32, stock: 31, category: 'Bagues', status: 'active' },
  { id: 'prod-005', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=60&h=60&fit=crop', name: 'Bague Cercle Fleuri', sku: 'BAG-CF-001', price: 28, stock: 45, category: 'Bagues', status: 'active' },
  { id: 'prod-006', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=60&h=60&fit=crop', name: 'Bracelet Chaîne Florale', sku: 'BRA-CF-001', price: 35, stock: 8, category: 'Bracelets', status: 'active' },
  { id: 'prod-007', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=60&h=60&fit=crop', name: 'Bracelet Jonc Résine', sku: 'BRA-JR-001', price: 42, stock: 0, category: 'Bracelets', status: 'active' },
  { id: 'prod-008', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=60&h=60&fit=crop', name: 'Boucles Pluie de Pétales', sku: 'BO-PP-001', price: 39, stock: 22, category: 'Boucles d\'oreilles', status: 'active' },
  { id: 'prod-009', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=60&h=60&fit=crop', name: 'Boucles Créoles Botaniques', sku: 'BO-CB-001', price: 44, stock: 15, category: 'Boucles d\'oreilles', status: 'active' },
  { id: 'prod-010', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=60&h=60&fit=crop', name: 'Boucles Puces Marguerite', sku: 'BO-PM-001', price: 24, stock: 56, category: 'Boucles d\'oreilles', status: 'active' },
  { id: 'prod-011', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=60&h=60&fit=crop', name: 'Barrette Fleurs Séchées', sku: 'ACC-BF-001', price: 18, stock: 3, category: 'Accessoires', status: 'active' },
  { id: 'prod-012', image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=60&h=60&fit=crop', name: 'Parure Printemps', sku: 'PAR-PR-001', price: 95, stock: 9, category: 'Packs & Parures', status: 'active' },
  { id: 'prod-013', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=60&h=60&fit=crop', name: 'Collier Lavande Éternelle', sku: 'COL-LE-001', price: 48, stock: 0, category: 'Colliers', status: 'draft' },
  { id: 'prod-014', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=60&h=60&fit=crop', name: 'Bague Soleil d\'Été', sku: 'BAG-SE-001', price: 36, stock: 20, category: 'Bagues', status: 'draft' },
  { id: 'prod-015', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=60&h=60&fit=crop', name: 'Bracelet Perle Florale', sku: 'BRA-PF-001', price: 38, stock: 14, category: 'Bracelets', status: 'active' },
]

export default function ProduitsPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const filteredData = useMemo(() => {
    let data = demoProducts
    if (categoryFilter) data = data.filter((p) => p.category === categoryFilter)
    if (statusFilter) data = data.filter((p) => p.status === statusFilter)
    return data
  }, [categoryFilter, statusFilter])

  const columns = useMemo<ColumnDef<AdminProduct>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        size: 40,
      },
      {
        accessorKey: 'image',
        header: '',
        cell: ({ row }) => (
          <img src={row.original.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ),
        size: 56,
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Nom',
        cell: ({ row }) => (
          <Link href={`/admin/produits/${row.original.id}`} className="font-medium text-gray-900 hover:text-terracotta transition-colors">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: 'sku', header: 'SKU', cell: ({ getValue }) => <span className="font-mono text-xs text-gray-500">{getValue<string>()}</span> },
      {
        accessorKey: 'price',
        header: 'Prix',
        cell: ({ getValue }) => <span className="font-medium">{formatPrice(getValue<number>())}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ getValue }) => {
          const v = getValue<number>()
          return (
            <span className={cn('font-medium', v === 0 ? 'text-red-600' : v < 10 ? 'text-orange-500' : 'text-gray-900')}>
              {v}
            </span>
          )
        },
      },
      { accessorKey: 'category', header: 'Catégorie' },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ getValue }) => {
          const s = getValue<string>()
          return (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              s === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
            )}>
              {s === 'active' ? 'Actif' : 'Brouillon'}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link href={`/admin/produits/${row.original.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors">
              <Edit className="w-4 h-4" />
            </Link>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        size: 80,
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  const selectedCount = Object.keys(rowSelection).length
  const categories = [...new Set(demoProducts.map((p) => p.category))]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Produits</h2>
          <p className="text-sm text-gray-500">{demoProducts.length} produits au total</p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau produit
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          >
            <option value="">Tous statuts</option>
            <option value="active">Actif</option>
            <option value="draft">Brouillon</option>
          </select>
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">{selectedCount} sélectionné(s)</span>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
          </div>
        )}
      </motion.div>

      {/* Table */}
      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                        header.column.getCanSort() && 'cursor-pointer select-none hover:text-gray-700'
                      )}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <ChevronUp className="w-3.5 h-3.5" />}
                        {header.column.getIsSorted() === 'desc' && <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
