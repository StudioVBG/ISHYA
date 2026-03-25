'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Calendar } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { cn, formatPrice } from '@/lib/utils'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'

const salesData = Array.from({ length: 12 }, (_, i) => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  const base = 8000 + Math.sin(i * 0.8) * 3000 + Math.random() * 2000
  return { month: months[i], ca: Math.round(base), orders: Math.round(base / 65) }
})

const categoryData = [
  { name: 'Colliers', value: 35, color: '#DF887B' },
  { name: 'Bagues', value: 22, color: '#C5A572' },
  { name: 'Bracelets', value: 18, color: '#9C8E82' },
  { name: 'Boucles d\'oreilles', value: 20, color: '#E9A99F' },
  { name: 'Accessoires', value: 5, color: '#D4BC93' },
]

const returnsData = [
  { month: 'Jan', rate: 2.1 }, { month: 'Fév', rate: 1.8 }, { month: 'Mar', rate: 2.5 },
  { month: 'Avr', rate: 1.5 }, { month: 'Mai', rate: 1.9 }, { month: 'Juin', rate: 2.2 },
  { month: 'Juil', rate: 1.7 }, { month: 'Août', rate: 2.0 }, { month: 'Sep', rate: 1.6 },
  { month: 'Oct', rate: 1.8 }, { month: 'Nov', rate: 2.3 }, { month: 'Déc', rate: 3.1 },
]

const loyaltyData = [
  { tier: 'Bronze', count: 245, color: '#CD7F32' },
  { tier: 'Argent', count: 128, color: '#C0C0C0' },
  { tier: 'Or', count: 67, color: '#C5A572' },
  { tier: 'Platine', count: 23, color: '#E5E4E2' },
]

export default function RapportsPage() {
  const [period, setPeriod] = useState('12m')

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rapports</h2>
          <p className="text-sm text-gray-500">Vue d&apos;ensemble des performances</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[['7d', '7j'], ['30d', '30j'], ['12m', '12m'], ['all', 'Tout']] .map(([key, label]) => (
              <button key={key} onClick={() => setPeriod(key)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors', period === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                {label}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Exporter
          </button>
        </div>
      </motion.div>

      {/* Sales chart */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Chiffre d&apos;affaires par mois</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip formatter={(value) => [`${formatPrice(Number(value))}`, 'CA']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
              <Bar dataKey="ca" fill="#DF887B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Part']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-gray-600">{cat.name} ({cat.value}%)</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Returns rate */}
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Taux de retours (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={returnsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${v}%`} domain={[0, 5]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Taux']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                <Line type="monotone" dataKey="rate" stroke="#DC3545" strokeWidth={2} dot={{ fill: '#DC3545', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Loyalty */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Répartition fidélité</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loyaltyData.map((tier) => (
            <div key={tier.tier} className="p-4 rounded-xl border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                <span className="text-lg font-bold" style={{ color: tier.color }}>{tier.count}</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{tier.tier}</p>
              <p className="text-xs text-gray-400">clients</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
