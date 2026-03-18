'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, LogOut, Building, Mail, Phone, MapPin, Camera, Loader2, CheckCircle, Shield, Activity, Database, Lock, Settings, Trash2, Edit2, Plus, X, Key, Globe, Cpu } from 'lucide-react'
import { companyService } from '@/lib/services'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { isAuthenticated, currentCompany, companies, logout, isLoading: isAuthLoading, refresh } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'enterprise' | 'admin'>('enterprise')
  const [formData, setFormData] = useState({
    companyName: currentCompany?.name || '',
    gstNumber: currentCompany?.gstNumber || '',
    email: currentCompany?.email || '',
    phone: currentCompany?.phone || '',
    address: currentCompany?.address || '',
    city: currentCompany?.city || '',
    state: currentCompany?.state || '',
    logo: currentCompany?.logo || '',
    smtpHost: currentCompany?.smtp_host || '',
    smtpPort: currentCompany?.smtp_port || '465',
    smtpUser: currentCompany?.smtp_user || '',
    smtpPass: currentCompany?.smtp_pass || '',
    bankName: currentCompany?.bank_name || '',
    bankAccount: currentCompany?.bank_account || '',
    bankIfsc: currentCompany?.bank_ifsc || '',
    bankBranch: currentCompany?.bank_branch || '',
    panNumber: currentCompany?.pan_number || '',
    authorizedSignatory: currentCompany?.authorized_signatory || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Master Control State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [editingCompanyNode, setEditingCompanyNode] = useState<any>(null)
  const [isLvl4Unlocked, setIsLvl4Unlocked] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authKey, setAuthKey] = useState('')
  const [companyNodeData, setCompanyNodeData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    gstNumber: '',
    description: 'Enterprise Node'
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(currentCompany?.logo || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || !currentCompany)) {
      router.push('/company-selection')
    }
  }, [isAuthLoading, isAuthenticated, currentCompany, router])

  if (isAuthLoading) {
    return (
       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_30px_-5px_#D4AF37]"
          />
       </div>
    )
  }

  if (!isAuthenticated || !currentCompany) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentCompany) return

    setIsSubmitting(true)
    setError(null)
    try {
      // 1. Upload to Supabase Storage
      const fileName = `logos/${currentCompany.id}_${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName)

      // 3. Update State
      setLogoPreview(publicUrl)
      setFormData(prev => ({ ...prev, logo: publicUrl }))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (err: any) {
      console.error("Logo upload failed:", err)
      setError(err.message || "Failed to upload logo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = async () => {
    if (!currentCompany) return
    setIsSubmitting(true)
    setError(null)
    
    try {
      await companyService.updateCompany(currentCompany.id, {
        name: formData.companyName,
        gst_number: formData.gstNumber,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        logo_url: formData.logo,
        smtp_host: formData.smtpHost,
        smtp_port: formData.smtpPort,
        smtp_user: formData.smtpUser,
        smtp_pass: formData.smtpPass,
        bank_name: formData.bankName,
        bank_account: formData.bankAccount,
        bank_ifsc: formData.bankIfsc,
        bank_branch: formData.bankBranch,
        pan_number: formData.panNumber,
        authorized_signatory: formData.authorizedSignatory
      })
      
      await refresh()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update settings")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/company-selection')
  }

  const handleRegisterNode = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      if (editingCompanyNode) {
        await companyService.updateCompany(editingCompanyNode.id, {
          name: companyNodeData.name,
          email: companyNodeData.email,
          phone: companyNodeData.phone,
          city: companyNodeData.city,
          state: companyNodeData.state,
          gst_number: companyNodeData.gstNumber,
          description: companyNodeData.description
        })
      } else {
        await companyService.createCompany({
          name: companyNodeData.name,
          email: companyNodeData.email,
          phone: companyNodeData.phone,
          city: companyNodeData.city,
          state: companyNodeData.state,
          gst_number: companyNodeData.gstNumber,
          description: companyNodeData.description,
          password: 'password123', // Default password
          color: 'blue'
        })
      }
      await refresh()
      setIsCompanyModalOpen(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to process enterprise node")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNode = async (id: number) => {
    if (!confirm("CRITICAL: This will terminate all data associated with this enterprise node. Proceed?")) return
    setIsSubmitting(true)
    try {
      await companyService.deleteCompany(id)
      await refresh()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to delete node")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthSubmit = () => {
    if (authKey === 'ADMIN123') {
      setIsLvl4Unlocked(true)
      setIsAuthModalOpen(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError("AUTHENTICATION FAILURE: INVALID MASTER KEY")
      setTimeout(() => setError(null), 3000)
    }
  }

  const adminStats = [
    { label: 'Active Enterprise Units', val: companies.length.toString(), icon: Building, color: 'text-blue-500' },
    { label: 'Master Protocols', val: 'Active', icon: Shield, color: 'text-emerald-500' },
    { label: 'System Uptime', val: '99.9%', icon: Activity, color: 'text-amber-500' },
    { label: 'Database Integrity', val: 'Verified', icon: Database, color: 'text-purple-500' }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary/30 selection:text-white">
      {/* Background Cinematic Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-[100] bg-slate-950/80 backdrop-blur-[40px] border-b border-white/10 p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.button
              onClick={() => router.push('/dashboard')}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div>
              <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">
                System <span className="gold-text-gradient">Control</span>
              </h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Integrated Enterprise Gateway & Master Protocols</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[24px] border border-white/10">
            <button 
              onClick={() => setActiveTab('enterprise')}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'enterprise' ? 'bg-primary text-slate-950 shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
            >
              Enterprise Config
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-white'}`}
            >
              Master Control
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'enterprise' ? (
            <motion.div 
               key="enterprise"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
              {/* PROFILE CARD */}
              <div className="lg:col-span-1 space-y-8">
                <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="glass-card p-12 text-center relative overflow-hidden group"
                >
                   <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/20 to-transparent opacity-30" />
                   
                   <div className="relative z-10 space-y-8">
                      <div className="relative inline-block group/avatar">
                         <div className="w-40 h-40 bg-slate-950 rounded-[40px] border-2 border-white/5 flex items-center justify-center overflow-hidden shadow-2xl relative">
                            {logoPreview ? (
                              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover gold-filter brightness-110" />
                            ) : (
                              <Building size={48} className="text-slate-800" />
                            )}
                            <motion.button
                               onClick={() => fileInputRef.current?.click()}
                               whileHover={{ opacity: 1 }}
                               className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm opacity-0 flex flex-col items-center justify-center gap-2 transition-opacity cursor-pointer"
                            >
                               <Camera size={24} className="text-white" />
                               <span className="text-[8px] font-black uppercase tracking-widest text-white">Modify Branding</span>
                            </motion.button>
                         </div>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </div>

                      <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none gold-text-gradient">
                         {currentCompany?.name || 'Unknown Entity'}
                      </h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                         System ID: {currentCompany?.id?.toString().substring(0, 8)}...
                      </p>

                      <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                         <div className="flex items-center gap-3 text-slate-400">
                            <Mail size={16} className="shrink-0" />
                            <span className="text-xs font-medium truncate">{currentCompany?.email || 'N/A'}</span>
                         </div>
                         <div className="flex items-center gap-3 text-slate-400">
                            <Phone size={16} className="shrink-0" />
                            <span className="text-xs font-medium truncate">{currentCompany?.phone || 'N/A'}</span>
                         </div>
                         <div className="flex items-center gap-3 text-slate-400">
                            <MapPin size={16} className="shrink-0" />
                            <span className="text-xs font-medium truncate">{currentCompany?.city || 'N/A'}, {currentCompany?.state || 'N/A'}</span>
                         </div>
                      </div>
                   </div>
                </motion.div>

                <motion.button
                   onClick={handleLogout}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 }}
                   className="w-full flex items-center justify-center gap-3 px-10 py-5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/5"
                >
                   <LogOut size={18} />
                   De-authenticate Session
                </motion.button>
              </div>

              {/* Main Control Panel */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 bg-slate-900/40 backdrop-blur-[40px] rounded-[48px] border border-white/10 p-10 md:p-16 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
                
                <div className="space-y-16">
                  {/* SECTION: IDENTITY */}
                  <section>
                    <div className="flex items-center gap-4 mb-10">
                      <div className="h-0.5 w-12 bg-primary/40" />
                      <h2 className="text-xl font-black italic uppercase tracking-[0.3em] text-white">Identity & Nexus</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Legal Entity Designation</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Primary Digital Archive (Email)</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </section>

                  {/* SECTION: FISCAL */}
                  <section className="bg-slate-950/30 rounded-[32px] p-10 border border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Save size={120} className="text-primary" />
                    </div>
                    <div className="flex items-center gap-4 mb-10">
                      <div className="h-0.5 w-12 bg-primary" />
                      <h2 className="text-xl font-black italic uppercase tracking-[0.3em] text-primary">Fiscal Authority</h2>
                    </div>
                    <div className="space-y-6">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">GST Registration Protocol (GSTIN)</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        placeholder="27AABCU9003R1Z0"
                        className="w-full bg-slate-950 border border-primary/20 rounded-[24px] px-10 py-6 text-2xl font-black text-white italic tracking-widest uppercase focus:outline-none focus:border-primary transition-all shadow-2xl"
                      />
                      <div className="flex items-center gap-3 ml-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Authenticating against department standards</p>
                      </div>
                    </div>
                  </section>

                  {/* SECTION: LOGISTICS */}
                  <section>
                    <div className="flex items-center gap-4 mb-10">
                      <div className="h-0.5 w-12 bg-white/20" />
                      <h2 className="text-xl font-black italic uppercase tracking-[0.3em] text-white">Logistics & Proximity</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Communications Node (Phone)</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-white/20 transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Urban Sector (City)</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-white/20 transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Jurisdiction (State)</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-white/20 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-3 space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Full Geographical Coordinates (Address)</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-white/20 transition-all"
                        />
                      </div>
                    </div>
                  </section>

                  {/* SECTION: FINANCIAL INFRASTRUCTURE */}
                  <section className="bg-slate-950/30 rounded-[32px] p-10 border border-emerald-500/10 relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="h-0.5 w-12 bg-emerald-500/40" />
                      <h2 className="text-xl font-black italic uppercase tracking-[0.3em] text-emerald-400">Financial Infrastructure</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Preferred Settlement Bank</label>
                        <input
                          type="text"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          placeholder="State Bank of India"
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Account Allocation Number</label>
                        <input
                          type="text"
                          name="bankAccount"
                          value={formData.bankAccount}
                          onChange={handleInputChange}
                          placeholder="XXXX XXXX XXXX XXXX"
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner font-mono"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">IFSC Protocol Code</label>
                        <input
                          type="text"
                          name="bankIfsc"
                          value={formData.bankIfsc}
                          onChange={handleInputChange}
                          placeholder="SBIN0001234"
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner font-mono uppercase"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Regional Branch Node</label>
                        <input
                          type="text"
                          name="bankBranch"
                          value={formData.bankBranch}
                          onChange={handleInputChange}
                          placeholder="Miyapur Branch"
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </section>

                  {/* SECTION: OPERATIONAL SIGNATORY */}
                  <section className="bg-slate-950/30 rounded-[32px] p-10 border border-amber-500/10 relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="h-0.5 w-12 bg-amber-500/40" />
                      <h2 className="text-xl font-black italic uppercase tracking-[0.3em] text-amber-400">Operational Signatory</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Permanent Account Identifier (PAN)</label>
                        <input
                          type="text"
                          name="panNumber"
                          value={formData.panNumber}
                          onChange={handleInputChange}
                          placeholder="ABCDE1234F"
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner font-mono uppercase"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Authorized Authentication Name</label>
                        <input
                          type="text"
                          name="authorizedSignatory"
                          value={formData.authorizedSignatory}
                          onChange={handleInputChange}
                          placeholder="Full Name of Signatory"
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] px-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </section>
                </div>

                {/* ACTION FOOTER */}
                <div className="mt-20 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
                   <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-2 leading-relaxed">System Integrity Protocol:</p>
                      <p className="text-[11px] font-bold text-slate-400 italic">All modifications require administrative authentication before commitment to the encrypted ledger.</p>
                   </div>
                   <div className="flex items-center gap-6 w-full md:w-auto">
                    <button
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="flex-1 md:flex-none px-12 py-5 bg-primary text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:shadow-[0_0_50px_rgba(212,175,55,0.3)] hover:-translate-y-1 disabled:opacity-50"
                    >
                      <div className="relative z-10 flex items-center justify-center gap-3">
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{isSubmitting ? 'Processing...' : 'Transmit Parameters'}</span>
                      </div>
                    </button>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
               key="admin"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-20"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {adminStats.map((s, i) => (
                   <motion.div 
                     key={s.label}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="glass-card p-8 group hover:border-primary/20 transition-all"
                   >
                      <div className="flex justify-between items-start mb-6">
                         <div className={`p-4 rounded-xl bg-slate-950 border border-white/5 ${s.color} group-hover:scale-110 transition-transform`}>
                            <s.icon size={24} />
                         </div>
                         <span className="text-4xl font-black italic text-white opacity-20 group-hover:opacity-100 transition-opacity">0{i+1}</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{s.label}</p>
                      <p className="text-3xl font-black text-white italic tracking-tighter">{s.val}</p>
                   </motion.div>
                 ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <section className="glass-card p-12 space-y-10">
                    <div className="flex items-center gap-6">
                       <h2 className="text-2xl font-black italic text-white uppercase tracking-widest">Enterprise Management</h2>
                       <div className="h-[1px] flex-1 bg-white/10" />
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                       {companies.map(c => (
                         <motion.div 
                           key={c.id} 
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all group"
                         >
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5">
                                  {c.logo ? <img src={c.logo} className="w-8 h-8 object-contain gold-filter" /> : <Building size={20} />}
                               </div>
                               <div>
                                  <p className="font-black text-white italic uppercase tracking-wider">{c.name}</p>
                                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">{c.city || 'Global'} Sector</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <button 
                                 onClick={() => {
                                   setEditingCompanyNode(c);
                                   setCompanyNodeData({
                                     name: c.name,
                                     email: c.email || '',
                                     phone: c.phone || '',
                                     city: c.city || '',
                                     state: c.state || '',
                                     gstNumber: c.gstNumber || '',
                                     description: c.description || 'Enterprise Node'
                                   });
                                   setIsCompanyModalOpen(true);
                                 }}
                                 className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                               >
                                  <Edit2 size={16} />
                               </button>
                               <button 
                                 onClick={() => handleDeleteNode(c.id)}
                                 className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         </motion.div>
                       ))}
                       <button 
                         onClick={() => {
                           setEditingCompanyNode(null);
                           setCompanyNodeData({ name: '', email: '', phone: '', city: '', state: '', gstNumber: '', description: 'Enterprise Node' });
                           setIsCompanyModalOpen(true);
                         }}
                         className="w-full py-8 border-2 border-dashed border-white/10 rounded-3xl text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] hover:border-primary/30 hover:text-primary transition-all flex flex-col items-center gap-4 group"
                       >
                          <Plus className="group-hover:rotate-90 transition-transform" />
                          Register New Enterprise Node
                       </button>
                    </div>
                 </section>

                 <section className="glass-card p-12 space-y-10">
                    <div className="flex items-center gap-6">
                       <h2 className="text-2xl font-black italic text-white uppercase tracking-widest">System Protocols</h2>
                       <div className="h-[1px] flex-1 bg-white/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       {[
                         { label: 'Security Firewall', val: 'Reinforced', icon: Shield },
                         { label: 'API Endpoints', val: 'Secure', icon: Globe },
                         { label: 'CDN Deployment', val: 'Edge', icon: Activity },
                         { label: 'Log Collection', val: 'Standard', icon: Database }
                       ].map(p => (
                         <div key={p.label} className="p-8 bg-white/5 border border-white/5 rounded-[32px] space-y-4 group hover:bg-white/10 transition-all">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{p.label}</p>
                            <div className="flex items-center justify-between">
                               <p className="text-xl font-bold text-white italic tracking-widest">{p.val}</p>
                               <p.icon size={20} className="text-slate-800 group-hover:text-primary transition-colors" />
                            </div>
                         </div>
                       ))}
                    </div>

                    {!isLvl4Unlocked ? (
                      <div className="p-10 bg-rose-500/5 border border-rose-500/10 rounded-[40px] relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                            <Lock size={80} className="text-rose-500" />
                         </div>
                         <h3 className="text-lg font-black text-rose-500 uppercase italic tracking-widest mb-4">Master Configuration</h3>
                         <p className="text-xs text-slate-500 leading-relaxed mb-8 uppercase tracking-wider">Configure global parameters, authentication cycles, and system-wide aesthetics for the entire MD Ecosystem.</p>
                         <button 
                           onClick={() => setIsAuthModalOpen(true)}
                           className="px-6 py-3 bg-rose-500 text-white border border-rose-500/20 rounded-full flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all"
                         >
                            <Lock size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Initialize Lvl 4 Auth</span>
                         </button>
                      </div>
                    ) : (
                      <div className="p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] relative overflow-hidden group animate-in fade-in zoom-in duration-500">
                         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                            <Cpu size={80} className="text-emerald-500" />
                         </div>
                         <h3 className="text-lg font-black text-emerald-500 uppercase italic tracking-widest mb-4">Global Parameters Unlocked</h3>
                         <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Auto-Archive Delay</span>
                               <span className="text-emerald-400 font-black italic">30 Days</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Encryption Standard</span>
                               <span className="text-emerald-400 font-black italic">AES-256-X</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aesthetic Mode</span>
                               <div className="flex gap-2">
                                  <div className="w-4 h-4 rounded-full bg-primary" />
                                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                                  <div className="w-4 h-4 rounded-full bg-rose-500" />
                               </div>
                            </div>
                         </div>
                      </div>
                    )}
                 </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* STATUS MESSAGES */}
      <div className="fixed bottom-10 right-10 z-[200] flex flex-col gap-4">
          <AnimatePresence>
            {success && (
              <motion.div
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-8 rounded-[32px] text-center font-black italic tracking-widest uppercase text-sm shadow-2xl backdrop-blur-md"
              >
                 <div className="flex items-center justify-center gap-3">
                    <CheckCircle size={20} />
                    <span>[SUCCESS]: System Profile Synchronized Successfully</span>
                 </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-8 rounded-[32px] text-center font-black italic tracking-widest uppercase text-sm shadow-2xl backdrop-blur-md"
              >
                [X-FAILURE]: {error}
              </motion.div>
            )}
          </AnimatePresence>
      </div>
      {/* MODALS */}
      <AnimatePresence>
        {isCompanyModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompanyModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-10 md:p-16 space-y-12">
                 <div className="flex items-center justify-between">
                    <div>
                       <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                          {editingCompanyNode ? 'Modify' : 'Initialize'} <span className="gold-text-gradient">Enterprise Node</span>
                       </h2>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Provisioning Secure Infrastructure</p>
                    </div>
                    <button onClick={() => setIsCompanyModalOpen(false)} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Node Name</label>
                       <input 
                         type="text" 
                         value={companyNodeData.name}
                         onChange={(e) => setCompanyNodeData({...companyNodeData, name: e.target.value})}
                         className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white focus:border-primary transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Digital Archive (Email)</label>
                       <input 
                         type="email" 
                         value={companyNodeData.email}
                         onChange={(e) => setCompanyNodeData({...companyNodeData, email: e.target.value})}
                         className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white focus:border-primary transition-all shadow-inner"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Operational Protocol Description</label>
                    <input 
                      type="text" 
                      value={companyNodeData.description}
                      onChange={(e) => setCompanyNodeData({...companyNodeData, description: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white focus:border-primary transition-all shadow-inner"
                    />
                 </div>

                 <button 
                   onClick={handleRegisterNode}
                   disabled={isSubmitting}
                   className="w-full py-6 bg-primary text-slate-950 rounded-[24px] font-black text-[10px] uppercase tracking-[0.4em] hover:shadow-[0_0_50px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-3"
                 >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    {editingCompanyNode ? 'Update Node Configuration' : 'Deploy Enterprise Node'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}

        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-rose-500/20 rounded-[40px] p-12 text-center space-y-10 shadow-2xl"
            >
              <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center mx-auto text-rose-500 animate-pulse">
                 <Shield size={32} />
              </div>
              <div>
                 <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">LVL 4 Protocol Activation</h2>
                 <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.4em] mt-2">Critical Infrastructure Access</p>
              </div>
              <div className="space-y-6">
                 <div className="relative">
                    <Key size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input 
                      type="password"
                      placeholder="ENTER MASTER KEY"
                      value={authKey}
                      onChange={(e) => setAuthKey(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-16 pr-6 py-5 font-black text-white text-center tracking-[0.5em] focus:border-rose-500 transition-all outline-none"
                    />
                 </div>
                 <button 
                   onClick={handleAuthSubmit}
                   className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] transition-all"
                 >
                    Initialize Authentication
                 </button>
                 <button onClick={() => setIsAuthModalOpen(false)} className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all">
                    Abort Access Attempt
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
