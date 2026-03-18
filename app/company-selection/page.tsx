'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Lock, X, ShieldCheck, ChevronRight } from 'lucide-react'
import Image from 'next/image'

export default function CompanySelection() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, companies, isLoading: isContextLoading } = useAuth()
  
  const selectedCompany = companies.find(c => c.id === selectedCompanyId)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    setTimeout(() => {
      if (selectedCompany && login(selectedCompany, password)) {
        setIsLoading(false)
        router.push('/dashboard')
      } else {
        setError('Invalid access credentials.')
        setPassword('')
        setIsLoading(false)
      }
    }, 800)
  }

  const closePasswordModal = () => {
    setSelectedCompanyId(null)
    setPassword('')
    setError('')
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "circOut" }}
          className="text-center mb-24"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-12 flex justify-center"
          >
            <div className="relative group">
              <div className="absolute -inset-8 bg-primary/20 rounded-full blur-[60px] group-hover:bg-primary/30 transition-all duration-700 animate-pulse" />
              <Image 
                src="/md-logo-01.png" 
                alt="MD Global" 
                width={200}
                height={128}
                className="h-32 w-auto object-contain relative z-10 drop-shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-transform duration-700 group-hover:scale-105" 
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8 backdrop-blur-md"
          >
            <ShieldCheck size={18} className="text-primary animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.4em] font-black text-primary">Secure Infrastructure Protocol</span>
          </motion.div>
          
          <h1 className="text-8xl font-black mb-6 tracking-tighter italic leading-none">
            <span className="text-white">GATEWAY</span> <span className="gold-text-gradient">CONTROL</span>
          </h1>
          <p className="text-slate-500 text-xl tracking-[0.6em] uppercase font-light">Select Enterprise Unit</p>
        </motion.div>

        {/* Company Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {isContextLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-6">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_30px_-5px_#D4AF37]" 
              />
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">Synchronizing Ledger Data...</p>
            </div>
          ) : (
            [...companies].sort((a,b) => a.id - b.id).map((company, idx) => (
              <motion.button
                key={company.id}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1, duration: 0.8, ease: "circOut" }}
                onClick={() => setSelectedCompanyId(company.id)}
                className="group relative text-left outline-none"
              >
                <div className="absolute -inset-1 bg-gradient-to-b from-primary/40 to-transparent rounded-[32px] blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700" />
                <div className="relative bg-slate-900/40 backdrop-blur-[60px] border border-white/10 hover:border-primary/40 transition-all duration-700 p-12 rounded-[32px] overflow-hidden min-h-[520px] flex flex-col justify-between shadow-2xl">
                  <div className="absolute top-0 right-0 p-8">
                     <Lock size={20} className="text-slate-700 group-hover:text-primary group-hover:rotate-12 transition-all duration-500" />
                  </div>

                  <div>
                    <div className="w-56 h-56 bg-white/5 border border-white/10 rounded-[40px] flex items-center justify-center p-2 mb-10 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-700 shadow-xl overflow-hidden mx-auto">
                      {company.logo ? (
                        <Image 
                          src={company.logo} 
                          alt={company.name} 
                          width={224}
                          height={224}
                          unoptimized
                          className="max-w-full max-h-full object-contain gold-filter brightness-125 transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <span className="text-6xl font-black text-white italic">{company.name.slice(0, 2)}</span>
                      )}
                    </div>

                    <h3 className="text-3xl font-black text-white mb-4 leading-none uppercase italic group-hover:translate-x-2 transition-transform duration-700 break-normal line-clamp-2 min-h-[4.5rem] flex items-end justify-center text-center">
                      {company.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed group-hover:text-slate-400 transition-colors text-center">{company.description}</p>
                  </div>

                  <div className="mt-12 flex items-center justify-between text-slate-600 group-hover:text-primary transition-all duration-700 border-t border-white/5 pt-8">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] mb-1">Assigned Division</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{company.city} Regional</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-700">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Password Modal Overlay */}
      <AnimatePresence>
        {selectedCompanyId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
            onClick={closePasswordModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-md glass-card rounded-[40px] p-12 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              
              <button 
                onClick={closePasswordModal}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-primary/20">
                  <Lock size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic">{selectedCompany?.name}</h2>
                <p className="text-xs text-slate-500 mt-2 tracking-[0.3em] font-bold uppercase">Authorized Personnel Only</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Access Key</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/50 transition-all text-center tracking-[1em]"
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-rose-500 font-bold uppercase tracking-widest">{error}</motion.p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full bg-primary hover:bg-blue-600 disabled:bg-slate-800 text-white font-black uppercase tracking-[0.3em] py-5 rounded-2xl transition-all shadow-xl shadow-primary/20"
                >
                  {isLoading ? "Validating..." : "Execute Access"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}
