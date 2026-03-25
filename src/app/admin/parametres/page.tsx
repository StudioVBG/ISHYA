'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Store, CreditCard, Truck, Mail, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'

const tabs = [
  { id: 'general', label: 'Général', icon: Store },
  { id: 'payment', label: 'Paiement', icon: CreditCard },
  { id: 'shipping', label: 'Livraison', icon: Truck },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'tax', label: 'TVA', icon: Receipt },
]

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState('general')

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>
        <p className="text-sm text-gray-500">Configuration de la boutique</p>
      </motion.div>

      <motion.div variants={staggerItem} className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'general' && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-base font-semibold text-gray-900">Informations générales</h3>
            <div><label className={labelClass}>Nom de la boutique</label><input type="text" defaultValue="ISHYA" className={inputClass} /></div>
            <div><label className={labelClass}>Description</label><textarea defaultValue="Bijoux artisanaux en fleurs séchées et résine" className={cn(inputClass, 'h-20 resize-none')} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Email de contact</label><input type="email" defaultValue="contact@ishya.fr" className={inputClass} /></div>
              <div><label className={labelClass}>Téléphone</label><input type="text" defaultValue="+33 1 23 45 67 89" className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Devise</label><select defaultValue="EUR" className={inputClass}><option value="EUR">Euro (€)</option><option value="USD">Dollar ($)</option></select></div>
              <div><label className={labelClass}>Langue</label><select defaultValue="fr" className={inputClass}><option value="fr">Français</option><option value="en">English</option></select></div>
            </div>
            <div><label className={labelClass}>Adresse</label><textarea defaultValue="42 rue des Artisans&#10;75011 Paris, France" className={cn(inputClass, 'h-20 resize-none')} /></div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
              <Save className="w-4 h-4" /> Enregistrer
            </button>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-base font-semibold text-gray-900">Paiement</h3>
            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><span className="text-purple-700 font-bold text-sm">S</span></div>
                  <div><p className="font-medium text-gray-900">Stripe</p><p className="text-xs text-gray-500">Cartes bancaires, Apple Pay, Google Pay</p></div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Connecté</span>
              </div>
            </div>
            <div><label className={labelClass}>Clé publique Stripe</label><input type="text" defaultValue="pk_live_••••••••••••••••" className={cn(inputClass, 'font-mono text-xs')} /></div>
            <div><label className={labelClass}>Clé secrète Stripe</label><input type="password" defaultValue="sk_live_xxxxxxxxxxxxxxxx" className={cn(inputClass, 'font-mono text-xs')} /></div>
            <div className="flex items-center gap-3">
              <label className={labelClass}>Mode test</label>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors"><span className="inline-block h-4 w-4 rounded-full bg-white translate-x-1 transition-transform" /></button>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
              <Save className="w-4 h-4" /> Enregistrer
            </button>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-base font-semibold text-gray-900">Livraison</h3>
            <div><label className={labelClass}>Seuil livraison gratuite (€)</label><input type="number" defaultValue="60" className={inputClass} /></div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Modes de livraison</p>
              {[
                { name: 'Colissimo Domicile', price: '4.90', delay: '3-5 jours' },
                { name: 'Colissimo Point Relais', price: '3.90', delay: '4-6 jours' },
                { name: 'Chronopost Express', price: '8.90', delay: '1-2 jours' },
              ].map((mode) => (
                <div key={mode.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div><p className="text-sm font-medium text-gray-900">{mode.name}</p><p className="text-xs text-gray-400">{mode.delay}</p></div>
                  <span className="text-sm font-medium text-gray-700">{mode.price} €</span>
                </div>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
              <Save className="w-4 h-4" /> Enregistrer
            </button>
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-base font-semibold text-gray-900">Emails transactionnels</h3>
            <div><label className={labelClass}>Email expéditeur</label><input type="email" defaultValue="commandes@ishya.fr" className={inputClass} /></div>
            <div><label className={labelClass}>Nom de l&apos;expéditeur</label><input type="text" defaultValue="ISHYA" className={inputClass} /></div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Templates actifs</p>
              {['Confirmation de commande', 'Expédition', 'Livraison', 'Bienvenue', 'Mot de passe oublié', 'Avis produit'].map((tpl) => (
                <div key={tpl} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-700">{tpl}</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">Actif</span>
                </div>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
              <Save className="w-4 h-4" /> Enregistrer
            </button>
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-base font-semibold text-gray-900">TVA</h3>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Prix TTC affichés</label>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors"><span className="inline-block h-4 w-4 rounded-full bg-white translate-x-6 transition-transform" /></button>
            </div>
            <div><label className={labelClass}>Taux de TVA par défaut (%)</label><input type="number" defaultValue="20" className={inputClass} /></div>
            <div><label className={labelClass}>N° TVA intracommunautaire</label><input type="text" defaultValue="FR 12 345678901" className={cn(inputClass, 'font-mono')} /></div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Taux par catégorie</p>
              {[
                { cat: 'Bijoux (standard)', rate: '20%' },
                { cat: 'Livres & contenus', rate: '5.5%' },
              ].map((item) => (
                <div key={item.cat} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-700">{item.cat}</span>
                  <span className="text-sm font-medium text-gray-900">{item.rate}</span>
                </div>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors">
              <Save className="w-4 h-4" /> Enregistrer
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
