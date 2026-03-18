'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Mail, Phone, MapPin, Hash } from 'lucide-react'
import { Client } from '@/lib/types'

interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (client: Partial<Client>) => void
  initialData?: Client | null
}

export default function ClientFormModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: ClientFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    gstNumber: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zipCode: initialData.zipCode || '',
        country: initialData.country || 'India',
        gstNumber: initialData.gstNumber || ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        gstNumber: ''
      })
    }
    setIsSubmitting(false)
  }, [initialData, isOpen])

  const handleSave = async () => {
    setIsSubmitting(true)
    await onSave(formData)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[200] p-4 lg:p-8"
          onClick={onClose}
        >
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: -5 }}
           animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
           exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: 5 }}
           transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
           className="glass-card !bg-slate-900/60 border border-white/10 rounded-[40px] shadow-[0_0_100px_-20px_rgba(212,175,55,0.15)] max-w-2xl w-full overflow-hidden flex flex-col relative"
           onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="p-10 border-b border-white/10 flex justify-between items-center bg-slate-950/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                {initialData ? 'Synchronize' : 'Register'} <span className="gold-text-gradient">Enterprise Entity</span>
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Enterprise Entity Registry</p>
            </div>
            <motion.button 
              onClick={onClose} 
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white border border-white/10"
            >
              <X size={20} />
            </motion.button>
          </div>

          <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            <div className="space-y-6">
              <div className="relative group">
                <UserPlus className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-hover:text-primary" size={20} />
                 <input
                   placeholder="Full Name / Legal Entity"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   className="w-full pl-16 pr-8 py-5 bg-slate-950/40 border border-white/10 rounded-[24px] text-white font-black outline-none focus:border-primary/50 transition-all uppercase placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                 />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-hover:text-primary" size={20} />
                   <input
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-16 pr-8 py-5 bg-slate-950/40 border border-white/10 rounded-[24px] text-white font-black outline-none focus:border-primary/50 transition-all placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                  />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-hover:text-primary" size={20} />
                  <input
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-16 pr-8 py-5 bg-slate-950/40 border border-white/10 rounded-[24px] text-white font-black outline-none focus:border-primary/50 transition-all placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                  />
                </div>
              </div>

              <div className="relative group">
                <MapPin className="absolute left-6 top-6 text-slate-600 transition-colors group-hover:text-primary" size={20} />
                <textarea
                  placeholder="Street Address"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-16 pr-8 py-6 bg-slate-950/40 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-primary/50 transition-all placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-8 py-5 bg-slate-950/40 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-primary/50 transition-all uppercase placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                />
                <input
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-8 py-5 bg-slate-950/40 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-primary/50 transition-all uppercase placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input
                  placeholder="Zip Code"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-8 py-5 bg-slate-950/40 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-primary/50 transition-all uppercase placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                />
                <input
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-8 py-5 bg-slate-950/40 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-primary/50 transition-all uppercase placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                />
              </div>

              <div className="relative group">
                <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-hover:text-primary" size={20} />
                <input
                  placeholder="GSTIN (Optional)"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border border-white/10 rounded-[20px] text-primary font-mono font-black outline-none focus:border-primary/50 transition-all uppercase placeholder:text-slate-700 placeholder:font-bold tracking-widest"
                />
              </div>
            </div>

            <div className="flex gap-6 pt-6">
              <button onClick={onClose} className="flex-1 px-8 py-5 bg-white/5 text-slate-500 rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] border border-white/10 hover:bg-white/10 transition-all">Cancel</button>
              <button 
                onClick={handleSave}
                disabled={isSubmitting}
                className={`flex-1 px-8 py-5 premium-button rounded-2xl text-sm transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 ${isSubmitting ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {isSubmitting ? 'Synchronizing...' : (initialData ? 'Update Ledger' : 'Confirm Entity')}
              </button>
            </div>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
