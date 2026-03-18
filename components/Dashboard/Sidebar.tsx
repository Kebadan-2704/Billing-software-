'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Users, FileText, IndianRupee, Plus, Trash2, Settings } from 'lucide-react'
import { Client } from '@/lib/types'

interface SidebarProps {
  clients: Client[]
  activeTab: 'invoices' | 'expenses'
  setActiveTab: (tab: 'invoices' | 'expenses') => void
  onAddClient: () => void
  onDeleteClient: (id: string) => void
  onSettings: () => void
}

export default function Sidebar({ clients, activeTab, setActiveTab, onAddClient, onDeleteClient, onSettings }: SidebarProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-card rounded-[40px] p-10 border border-white/5 h-fit sticky top-24 shadow-2xl overflow-hidden group/sidebar"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none opacity-50 group-hover/sidebar:opacity-100 transition-opacity duration-1000" />
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="relative group/header">
          <h3 className="text-[10px] font-black text-slate-500 flex items-center gap-3 uppercase tracking-[0.6em] mb-2 group-hover/header:text-primary transition-colors">
            <Users size={14} className="text-primary group-hover/header:scale-110 transition-transform" />
            Registry
          </h3>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-7">Validated Entities</p>
        </div>
        <motion.button
          onClick={onAddClient}
          whileHover={{ scale: 1.1, rotate: 90 }}
          className="w-10 h-10 bg-slate-950 text-primary p-2 rounded-2xl border border-white/5 hover:border-primary/40 transition-all flex items-center justify-center shadow-2xl"
        >
          <Plus size={18} />
        </motion.button>
      </div>

      <nav className="space-y-4 mb-12 relative z-10">
        {[
          { id: 'invoices' as const, label: 'Billing Registry', icon: FileText, color: 'text-primary' },
          { id: 'expenses' as const, label: 'Audit Records', icon: IndianRupee, color: 'text-rose-500' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ x: 8 }}
            className={`w-full flex items-center gap-4 px-8 py-6 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest border cinematic-glow ${
              activeTab === tab.id 
                ? `bg-slate-900 border-primary/30 text-white shadow-[0_0_40px_rgba(212,175,55,0.15)]` 
                : 'bg-white/[0.02] text-slate-600 hover:bg-white/[0.05] border-white/5 hover:border-white/20'
            }`}
          >
            <tab.icon size={18} className={`${activeTab === tab.id ? tab.color : 'text-slate-700'} group-hover:scale-110 transition-transform`} />
            {tab.label}
          </motion.button>
        ))}

        <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
           <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-700 mb-4 ml-2">Protocol Control</p>
           <motion.button
              onClick={onSettings}
              whileHover={{ x: 8 }}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/05 hover:border-white/10 transition-all font-black text-[10px] uppercase tracking-widest"
           >
              <Settings size={16} />
              System Control
           </motion.button>
        </div>
      </nav>

      <div className="space-y-8 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-700">Verified Personnel</p>
          <div className="h-[1px] flex-1 bg-white/5" />
        </div>
        
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
          {clients.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.01] rounded-3xl border border-white/5 italic text-[9px] uppercase tracking-[0.4em] text-slate-800">No Records Found</div>
          ) : (
            clients.map((client) => (
              <motion.div
                key={client.id}
                whileHover={{ x: 6 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center font-black text-xs text-slate-600 group-hover:text-primary group-hover:border-primary/30 transition-all shadow-2xl">
                    {client.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-slate-300 text-[11px] group-hover:text-white transition-colors uppercase tracking-tight">{client.name}</p>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-1 group-hover:text-slate-500 transition-colors truncate w-32">{client.email}</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.2, color: '#f43f5e' }}
                  onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id) }} 
                  className="text-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Trash2 size={16} />
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
