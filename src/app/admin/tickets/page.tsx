'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Send, Clock, User, Tag } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Basse', className: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Moyenne', className: 'bg-blue-50 text-blue-700' },
  high: { label: 'Haute', className: 'bg-orange-50 text-orange-700' },
  urgent: { label: 'Urgente', className: 'bg-red-50 text-red-700' },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: 'Ouvert', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'En attente', className: 'bg-yellow-50 text-yellow-700' },
  resolved: { label: 'Résolu', className: 'bg-blue-50 text-blue-700' },
  closed: { label: 'Fermé', className: 'bg-gray-100 text-gray-600' },
}

const demoTickets = [
  { id: 'TIC-001', subject: 'Commande non reçue après 10 jours', client: 'Camille Bernard', email: 'camille.b@email.com', status: 'open', priority: 'high', category: 'shipping', assignedTo: null, createdAt: '2026-03-19T14:00:00Z', messages: [
    { from: 'client', text: 'Bonjour, j\'ai passé ma commande ISH-7X2H-E7F2 il y a 10 jours et je n\'ai toujours rien reçu. Le suivi indique "en transit" depuis une semaine. Pouvez-vous m\'aider ?', date: '2026-03-19T14:00:00Z' },
  ]},
  { id: 'TIC-002', subject: 'Question sur l\'entretien de la résine', client: 'Marie Dupont', email: 'marie.dupont@email.com', status: 'pending', priority: 'low', category: 'product', assignedTo: 'Sophie A.', createdAt: '2026-03-18T10:30:00Z', messages: [
    { from: 'client', text: 'Bonjour, comment puis-je nettoyer mon collier en résine sans l\'abîmer ? J\'ai peur d\'utiliser des produits inadaptés.', date: '2026-03-18T10:30:00Z' },
    { from: 'agent', text: 'Bonjour Marie ! Pour l\'entretien de vos bijoux en résine, utilisez simplement un chiffon doux légèrement humide. Évitez tout contact avec les parfums et produits chimiques. N\'hésitez pas si vous avez d\'autres questions !', date: '2026-03-18T11:15:00Z' },
    { from: 'client', text: 'Merci ! Et pour le stockage, avez-vous des conseils ?', date: '2026-03-18T14:00:00Z' },
  ]},
  { id: 'TIC-003', subject: 'Erreur de taille sur ma bague', client: 'Emma Petit', email: 'emma.petit@email.com', status: 'open', priority: 'medium', category: 'order', assignedTo: 'Sophie A.', createdAt: '2026-03-17T16:00:00Z', messages: [
    { from: 'client', text: 'J\'ai reçu une bague taille 54 alors que j\'avais commandé en 52. Comment faire pour l\'échanger ?', date: '2026-03-17T16:00:00Z' },
  ]},
  { id: 'TIC-004', subject: 'Demande de facture', client: 'Clara Dubois', email: 'clara.d@email.com', status: 'resolved', priority: 'low', category: 'order', assignedTo: 'Sophie A.', createdAt: '2026-03-15T09:00:00Z', messages: [
    { from: 'client', text: 'Pourriez-vous m\'envoyer la facture de ma commande ISH-7X1D-M7N4 ?', date: '2026-03-15T09:00:00Z' },
    { from: 'agent', text: 'Bien sûr ! La facture a été envoyée à votre adresse email. Bonne journée !', date: '2026-03-15T09:30:00Z' },
  ]},
  { id: 'TIC-005', subject: 'Bracelet cassé après 2 semaines', client: 'Julie Moreau', email: 'julie.m@email.com', status: 'open', priority: 'urgent', category: 'return', assignedTo: null, createdAt: '2026-03-20T08:00:00Z', messages: [
    { from: 'client', text: 'Mon bracelet chaîne florale s\'est cassé au niveau du fermoir après seulement 2 semaines d\'utilisation. C\'est inadmissible pour ce prix. Je souhaite un remboursement ou un remplacement.', date: '2026-03-20T08:00:00Z' },
  ]},
]

export default function TicketsPage() {
  const [selectedId, setSelectedId] = useState(demoTickets[0].id)
  const [replyText, setReplyText] = useState('')
  const [search, setSearch] = useState('')

  const selectedTicket = demoTickets.find((t) => t.id === selectedId)!

  const filtered = demoTickets.filter((t) => {
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.client.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-gray-900">Tickets support</h2>
        <p className="text-sm text-gray-500">{demoTickets.filter((t) => t.status === 'open').length} ouverts · {demoTickets.filter((t) => !t.assignedTo).length} non assignés</p>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex" style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}>
        {/* Left panel: List */}
        <div className="w-80 border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((ticket) => {
              const p = priorityConfig[ticket.priority]
              const s = statusConfig[ticket.status]
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedId(ticket.id)}
                  className={cn(
                    'w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                    selectedId === ticket.id && 'bg-terracotta/5 border-l-2 border-l-terracotta'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-gray-400">{ticket.id}</span>
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', p.className)}>{p.label}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{ticket.client}</span>
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', s.className)}>{s.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right panel: Detail */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{selectedTicket.client}</span>
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{selectedTicket.category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(selectedTicket.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusConfig[selectedTicket.status].className)}>
                  {statusConfig[selectedTicket.status].label}
                </span>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', priorityConfig[selectedTicket.priority].className)}>
                  {priorityConfig[selectedTicket.priority].label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedTicket.messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.from === 'agent' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-md rounded-xl px-4 py-3',
                  msg.from === 'agent'
                    ? 'bg-terracotta/10 text-gray-900'
                    : 'bg-gray-100 text-gray-900'
                )}>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">{formatDate(msg.date)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-end gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Répondre au ticket..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm h-16 resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              />
              <button className="p-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
