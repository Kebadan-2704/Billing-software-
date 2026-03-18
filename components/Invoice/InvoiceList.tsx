'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Edit2, Trash2, IndianRupee, Search, AlertCircle, FileText, Mail } from 'lucide-react'
import { Invoice } from '@/lib/types'

interface InvoiceListProps {
  invoices: Invoice[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterStatus: string
  setFilterStatus: (status: string) => void
  onView: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onDelete: (id: string) => void
  onPayment: (invoice: Invoice) => void
  onEmail: (invoice: Invoice) => void
  onNew: () => void
}

export default function InvoiceList({
  invoices,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onView,
  onEdit,
  onDelete,
  onPayment,
  onEmail,
  onNew
}: InvoiceListProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Paid': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Sent': 'bg-primary/10 text-primary border-primary/20',
      'Overdue': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'Partial': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Draft': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      'Cancelled': 'bg-white/5 text-slate-500 border-white/5'
    }
    return colors[status] || 'bg-white/5 text-slate-400 border-white/5'
  }

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-6 items-center glass-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="flex-1 flex items-center gap-4 bg-slate-950/50 rounded-2xl px-6 py-5 border border-white/5 focus-within:border-primary/30 transition-all group shadow-inner">
          <Search size={20} className="text-slate-700 group-hover:text-primary transition-colors" />
          <input
            placeholder="Search Intelligence Ledger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white font-black uppercase tracking-[0.3em] text-[10px] placeholder:text-slate-800"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-6 py-4 bg-white/[0.02] border border-white/10 rounded-2xl font-black text-slate-500 uppercase tracking-[0.3em] outline-none focus:border-primary/40 transition-all cursor-pointer text-[10px] appearance-none"
        >
          {['All Categories', 'Draft', 'Sent', 'Paid', 'Partial', 'Overdue', 'Cancelled'].map(s => (
            <option key={s} value={s.includes('All') ? 'All' : s} className="bg-slate-900">{s}</option>
          ))}
        </select>

        <button
          onClick={onNew}
          className="premium-button-redefined"
        >
          Generate Instrument
        </button>
      </div>

      {/* ITEMS */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {invoices.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-24 text-center"
            >
              <AlertCircle size={48} className="mx-auto text-slate-800 mb-6" />
              <p className="text-slate-700 text-sm font-black uppercase tracking-[0.6em]">Zero Records Found</p>
            </motion.div>
          ) : (
            invoices.map((invoice, idx) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05, duration: 0.6, ease: "circOut" }}
                className="glass-card hover:bg-white/[0.04] rounded-[32px] border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 relative z-10 transition-all hover:px-8 sm:group-hover:px-14">
                  <div className="flex items-center gap-4 sm:gap-12 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-950 border border-white/5 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group/icon flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                      <FileText size={18} className="text-slate-600 group-hover:text-primary transition-colors relative z-10 sm:hidden" />
                      <FileText size={24} className="text-slate-600 group-hover:text-primary transition-colors relative z-10 hidden sm:block mb-1" />
                      <span className="text-[6px] sm:text-[7px] font-black text-slate-700 z-10 uppercase tracking-[0.2em]">{invoice.invoiceNumber.split('-').pop()}</span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-5 mb-1 sm:mb-3">
                        <h3 className="font-black text-base sm:text-xl text-white tracking-[0.1em] uppercase group-hover:gold-text-gradient transition-all truncate">{invoice.invoiceNumber}</h3>
                        <span className={`px-2 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[6px] sm:text-[8px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] border ${getStatusColor(invoice.status)} shadow-2xl shadow-black/50 whitespace-nowrap`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 text-slate-500 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.5em] truncate">
                        <span className="text-primary/60 group-hover:text-primary transition-colors truncate">{invoice.client.name}</span>
                        <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/5 rounded-full" />
                        <span className="opacity-40 whitespace-nowrap">{invoice.issueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 md:mr-16">
                    <p className="text-xl sm:text-3xl font-black text-white tracking-tighter gold-text-gradient order-2 md:order-1">₹{invoice.total.toLocaleString('en-IN')}</p>
                    <p className="text-[7px] sm:text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] sm:tracking-[0.6em] md:mt-2 order-1 md:order-2">Instrument Value</p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap justify-end">
                    {[
                      { icon: Eye, onClick: () => onView(invoice), color: 'primary', label: 'View' },
                      { icon: Edit2, onClick: () => onEdit(invoice), color: 'primary', label: 'Edit' },
                      { icon: Mail, onClick: () => onEmail(invoice), color: 'amber', label: 'Email' },
                      { icon: IndianRupee, onClick: () => onPayment(invoice), color: 'emerald', label: 'Pay' },
                      { icon: Trash2, onClick: () => onDelete(invoice.id), color: 'rose', label: 'Delete' }
                    ].map((btn, i) => (
                      <motion.button
                        key={i}
                        onClick={btn.onClick}
                        whileHover={{ scale: 1.15, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-950 border border-white/10 text-${btn.color === 'primary' ? 'primary' : btn.color + '-500'} rounded-xl sm:rounded-2xl transition-all hover:bg-white/5 hover:border-${btn.color === 'primary' ? 'primary/50' : btn.color + '-500/50'} shadow-2xl group/btn overflow-hidden relative`}
                      >
                        <div className={`absolute inset-0 bg-${btn.color === 'primary' ? 'primary' : btn.color + '-500'}/5 opacity-0 group-hover/btn:opacity-100 transition-opacity`} />
                        <btn.icon size={16} className="relative z-10 sm:hidden" />
                        <btn.icon size={18} className="relative z-10 hidden sm:block" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
