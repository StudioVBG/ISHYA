'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, ShoppingCart, Euro, Users, Percent,
  AlertTriangle, RotateCcw, Headphones, Package,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn, formatPrice } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

const kpis = [
  {
    label: 'CA du jour',
    value: '1 250 €',
    change: '+12%',
    trend: 'up' as const,
    detail: 'vs veille',
    icon: Euro,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Commandes',
    value: '18',
    change: '+5',
    trend: 'up' as const,
    detail: 'aujourd\'hui',
    icon: ShoppingCart,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Panier moyen',
    value: '69,44 €',
    change: '-2%',
    trend: 'down' as const,
    detail: 'vs veille',
    icon: Users,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Taux conversion',
    value: '3,2%',
    change: '+0,5%',
    trend: 'up' as const,
    detail: 'vs veille',
    icon: Percent,
    color: 'bg-purple-50 text-purple-600',
  },
]

const revenueData = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  const base = 800 + Math.sin(i * 0.5) * 300 + Math.random() * 200
  return { day: `${day}/03`, ca: Math.round(base) }
})

const topProducts = [
  { id: 1, name: 'Collier Fleur d\'Oranger', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=60&h=60&fit=crop', qty: 42, revenue: 1890 },
  { id: 2, name: 'Bague Bouton de Pivoine', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=60&h=60&fit=crop', qty: 38, revenue: 1216 },
  { id: 3, name: 'Boucles Pluie de Pétales', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=60&h=60&fit=crop', qty: 35, revenue: 1365 },
  { id: 4, name: 'Bracelet Chaîne Florale', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=60&h=60&fit=crop', qty: 29, revenue: 1015 },
  { id: 5, name: 'Collier Éclat Doré', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=60&h=60&fit=crop', qty: 25, revenue: 1700 },
]

const alerts = [
  { type: 'stock', message: 'Collier Fleur d\'Oranger – variante Or Rose : 2 restants', color: 'bg-red-50 text-red-700 border-red-200' },
  { type: 'stock', message: 'Bague Bouton de Pivoine – taille 54 : rupture', color: 'bg-red-50 text-red-700 border-red-200' },
  { type: 'stock', message: 'Bracelet Chaîne Florale – longueur 18cm : 3 restants', color: 'bg-red-50 text-red-700 border-red-200' },
  { type: 'retour', message: '2 retours en attente de validation', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { type: 'ticket', message: '1 ticket non assigné depuis 4h', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
]

const recentOrders = [
  { id: 'ISH-7X2K-A9B3', client: 'Marie Dupont', date: '20/03/2026 14:32', status: 'paid', amount: 127.00 },
  { id: 'ISH-7X2J-C4D1', client: 'Léa Martin', date: '20/03/2026 13:15', status: 'processing', amount: 89.50 },
  { id: 'ISH-7X2H-E7F2', client: 'Camille Bernard', date: '20/03/2026 11:48', status: 'shipped', amount: 156.00 },
  { id: 'ISH-7X2G-G1H5', client: 'Emma Petit', date: '20/03/2026 10:22', status: 'delivered', amount: 45.00 },
  { id: 'ISH-7X2F-I3J8', client: 'Julie Moreau', date: '20/03/2026 09:05', status: 'pending', amount: 210.00 },
]

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-gray-100 text-gray-700' },
  paid: { label: 'Payée', className: 'bg-emerald-50 text-emerald-700' },
  processing: { label: 'En préparation', className: 'bg-blue-50 text-blue-700' },
  shipped: { label: 'Expédiée', className: 'bg-purple-50 text-purple-700' },
  delivered: { label: 'Livrée', className: 'bg-green-50 text-green-700' },
}

const alertIcons: Record<string, React.ElementType> = {
  stock: AlertTriangle,
  retour: RotateCcw,
  ticket: Headphones,
}

export default function AdminDashboard() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              variants={staggerItem}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', kpi.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                )}>
                  {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {kpi.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-1">{kpi.label} · {kpi.detail}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">CA des 30 derniers jours</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" interval={4} />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${v}€`} />
              <Tooltip
                formatter={(value) => [`${value} €`, 'CA']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              />
              <Line
                type="monotone"
                dataKey="ca"
                stroke="#DF887B"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#DF887B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top 5 produits</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-medium text-gray-500">Produit</th>
                  <th className="text-right py-2 font-medium text-gray-500">Vendus</th>
                  <th className="text-right py-2 font-medium text-gray-500">CA</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="font-medium text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="text-right text-gray-600 py-2.5">{p.qty}</td>
                    <td className="text-right font-medium text-gray-900 py-2.5">{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Alertes</h2>
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const Icon = alertIcons[alert.type] || AlertTriangle
              return (
                <div key={i} className={cn('flex items-start gap-3 p-3 rounded-lg border', alert.color)}>
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-sm">{alert.message}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Commandes récentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 font-medium text-gray-500">N° Commande</th>
                <th className="text-left py-2 font-medium text-gray-500">Client</th>
                <th className="text-left py-2 font-medium text-gray-500">Date</th>
                <th className="text-left py-2 font-medium text-gray-500">Statut</th>
                <th className="text-right py-2 font-medium text-gray-500">Montant</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const s = statusLabels[order.status]
                return (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 font-mono text-xs text-gray-600">{order.id}</td>
                    <td className="py-2.5 text-gray-900">{order.client}</td>
                    <td className="py-2.5 text-gray-500">{order.date}</td>
                    <td className="py-2.5">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', s.className)}>
                        {s.label}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-gray-900">{formatPrice(order.amount)}</td>
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
