'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, IndianRupee, Clock, Activity } from 'lucide-react'

interface KPIBarProps {
  stats: {
    total: number
    paid: number
    pending: number
    expenses: number
  }
}

export default function KPIBar({ stats }: KPIBarProps) {
  const profit = stats.paid - stats.expenses

  const items = [
    { label: 'Revenue Received', val: stats.paid, icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/5', shadow: 'shadow-emerald-500/20' },
    { label: 'Pending Credits', val: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/5', shadow: 'shadow-amber-500/20' },
    { label: 'Resource Outflow', val: stats.expenses, icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/5', shadow: 'shadow-rose-500/20' },
    { label: 'Net Liquidity', val: profit, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/5', shadow: 'shadow-blue-500/20' }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
      {items.map((stat, i) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -10, scale: 1.05 }}
          transition={{ delay: i * 0.1, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          className="glass-card relative flex items-center gap-3 sm:gap-6 p-4 sm:p-8 border border-white/5 group hover:border-primary/20 transition-all overflow-visible shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-2xl shrink-0">
            <stat.icon size={24} className={stat.color} />
            <div className={`absolute inset-0 ${stat.bg} blur-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
          </div>
 
          <div className="relative z-10 flex-1 min-w-0">
            <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-500 mb-0.5 sm:mb-1 leading-none whitespace-nowrap overflow-visible">{stat.label}</p>
            <p className={`inline-block text-xs sm:text-2xl font-black pr-4 sm:pr-14 whitespace-nowrap tracking-normal overflow-visible ${stat.label === 'Net Liquidity' ? 'gold-text-gradient' : 'text-white'}`} style={{ WebkitBoxDecorationBreak: 'clone', WebkitBackgroundClip: 'text' }}>
              {'\u20B9'}{stat.val.toLocaleString('en-IN')}
            </p>
          </div>
 
          <div 
            className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 ${stat.color} group-hover:scale-150 group-hover:-rotate-12 pointer-events-none`}
          >
            <stat.icon size={110} strokeWidth={0.5} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
