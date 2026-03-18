'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Invoice, Client } from '@/lib/types'
import { invoiceService, clientService, expenseService } from '@/lib/services'
import { LogOut, Printer, Download, Trash2, Menu, IndianRupee, X, Edit2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Components
import KPIBar from './Dashboard/KPIBar'
import Sidebar from './Dashboard/Sidebar'
import InvoiceList from './Invoice/InvoiceList'
import InvoiceFormModal from './Invoice/InvoiceFormModal'
import InvoiceTemplate from './Invoice/InvoiceTemplate'
import ClientFormModal from './Dashboard/ClientFormModal'
import ExpenseFormModal from './Dashboard/ExpenseFormModal'

export default function EnhancedBillingDashboard() {
  const { currentCompany, logout, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const invoiceRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLDivElement>(null)

  // ===== CORE STATE =====
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ===== UI STATE =====
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses'>('invoices')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showInvoiceView, setShowInvoiceView] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // ===== MODAL STATE =====
  const [showClientForm, setShowClientForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [editingExpense, setEditingExpense] = useState<any>(null)

  // ===== DATA INITIALIZATION =====
  const fetchData = useCallback(async () => {
    if (!currentCompany) return
    setLoading(true)
    try {
      const [invData, clData, expData] = await Promise.all([
        invoiceService.getInvoices(currentCompany.id).catch(() => []),
        clientService.getClients(currentCompany.id).catch(() => []),
        expenseService.getExpenses(currentCompany.id).catch(() => [])
      ])
      setInvoices(invData || [])
      setClients(clData || [])
      setExpenses(expData || [])
    } catch (err) {
      console.error("Critical Data fetch error:", err)
      setInvoices([])
      setClients([])
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [currentCompany])

  useEffect(() => {
    if (isAuthLoading) return
    if (!currentCompany) {
      router.push('/company-selection')
      return
    }
    fetchData()
  }, [currentCompany, router, fetchData, isAuthLoading])

  const handleSendEmail = async (invoice: Invoice) => {
    if (!invoice.client.email) {
      alert("Client email is missing protocol. Update client data first.")
      return
    }

    if (!currentCompany?.smtp_host || !currentCompany?.smtp_pass) {
      alert("Mail protocol not configured. Update SMTP settings in Enterprise Configuration first.")
      router.push('/settings')
      return
    }

    setLoading(true)
    try {
      // 1. Ensure the invoice is selected so it renders in the hidden capture area
      setSelectedInvoice(invoice)
      
      // Give time for React to render the template in the hidden div
      await new Promise(resolve => setTimeout(resolve, 800))

      const element = emailRef.current
      if (!element) {
        throw new Error("Optical Capture System Failure: Render target not found.")
      }

      // Ensure images are loaded
      const images = element.getElementsByTagName('img')
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve()
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve })
      }))

      const canvas = await html2canvas(element, { 
        scale: 3, 
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      const pdfBase64 = pdf.output('datauristring').split(',')[1]

      // 2. Transmit to API
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: invoice.client.email,
          subject: `INVOICE ${invoice.invoiceNumber} FROM ${currentCompany?.name}`,
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 20px; background-color: #fcfcfc;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1b; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Service Instrument</h1>
                <p style="color: #D4AF37; font-weight: bold; margin: 5px 0;">TRANSIT PROTOCOL v4.0</p>
              </div>
              
              <p>Greetings,</p>
              <p>Please find the attached invoice <b>${invoice.invoiceNumber}</b> issued by <b>${currentCompany?.name}</b>.</p>
              
              <div style="margin: 30px 0; padding: 25px; background: #ffffff; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Instrument ID</td>
                    <td style="text-align: right; font-weight: bold;">${invoice.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 10px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Consolidated Value</td>
                    <td style="padding-top: 10px; text-align: right; font-weight: bold; color: #D4AF37; font-size: 18px;">₹${invoice.total.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 10px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Maturity Date</td>
                    <td style="padding-top: 10px; text-align: right; font-weight: bold;">${invoice.dueDate || invoice.issueDate}</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 13px; line-height: 1.6; color: #555;">This is an automated encrypted transmission from the MD Billing Intelligence System. Please retain this for your fiscal records.</p>
              
              <div style="margin-top: 40px; border-top: 2px solid #f0f0f0; padding-top: 20px;">
                <p style="font-size: 11px; color: #888; margin: 0;"><b>${currentCompany?.name}</b></p>
                <p style="font-size: 10px; color: #aaa; margin: 5px 0 0 0;">CONFIDENTIALITY NOTICE: This transmission is intended solely for the recipient node.</p>
              </div>
            </div>
          `,
          attachments: [{
            filename: `${invoice.invoiceNumber}.pdf`,
            content: pdfBase64,
            encoding: 'base64'
          }],
          smtpConfig: {
            host: currentCompany.smtp_host,
            port: currentCompany.smtp_port,
            user: currentCompany.smtp_user,
            pass: currentCompany.smtp_pass
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        alert("Transmission Successful: Invoice dispatched to client node.")
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      console.error("Transmission Error:", err)
      alert(`Protocol Violation: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ===== HANDLERS =====
  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    if (!currentCompany || !invoiceData.client) return

    try {
      // 1. Ensure client exists and get ID
      let finalClientId = invoiceData.clientId
      
      if (!finalClientId && invoiceData.client) {
        const { id, ...clientData } = invoiceData.client
        const mappedClient = {
          company_id: currentCompany.id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          gst_number: clientData.gstNumber,
          city: clientData.city || '',
          state: clientData.state || '',
          zip_code: clientData.zipCode || '',
          country: clientData.country || 'India'
        }
        const savedClient = await clientService.createClient(currentCompany.id, mappedClient as any)
        finalClientId = savedClient.id
      }
      
      // 2. Prepare invoice for Supabase
      const supabaseInvoice = {
        company_id: currentCompany.id,
        invoice_number: invoiceData.invoiceNumber || `INV-${currentCompany.name.split(' ').pop() || 'MD'}-${Date.now().toString().slice(-4)}`,
        issue_date: invoiceData.issueDate || new Date().toISOString().split('T')[0],
        due_date: invoiceData.dueDate || null,
        client_id: finalClientId,
        subtotal: invoiceData.subtotal,
        tax_rate: Number(invoiceData.taxRate) || 0.18,
        tax_amount: invoiceData.taxAmount,
        total: invoiceData.total,
        status: invoiceData.status || 'Draft',
        notes: invoiceData.notes || '',
        payment_terms: invoiceData.paymentTerms || 'Net 30',
        items: invoiceData.items || []
      }

      if (editingInvoice) {
        await invoiceService.updateInvoice(editingInvoice.id, supabaseInvoice as any)
      } else {
        await invoiceService.createInvoice(currentCompany.id, supabaseInvoice as any)
      }
      
      await fetchData() // Consistently refresh everything
      setShowInvoiceForm(false)
      setEditingInvoice(null)
    } catch (err: any) {
      console.error("Supabase Save Error Details:", err)
      alert(`Error saving invoice: ${err.message || 'Unknown error'}`)
    }
  }

  const handleSaveClient = async (clientData: any) => {
    if (!currentCompany) return
    try {
      if (editingClient) {
        // Update logic if needed, currently create is default
        await clientService.createClient(currentCompany.id, clientData)
      } else {
        await clientService.createClient(currentCompany.id, clientData)
      }
      await fetchData()
      setShowClientForm(false)
    } catch (err) {
      console.error("Client Save Error:", err)
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (confirm("Permanently purge client and all associated electronic records?")) {
      try {
        await clientService.deleteClient(id)
        await fetchData()
      } catch (err) {
        alert("Operation restricted. Ensure client has no active dependencies.")
      }
    }
  }

  const handleSaveExpense = async (expenseData: any) => {
    if (!currentCompany) return
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, expenseData)
      } else {
        await expenseService.createExpense(currentCompany.id, expenseData)
      }
      await fetchData()
      setShowExpenseForm(false)
      setEditingExpense(null)
    } catch (err) {
      console.error("Expense Save Error:", err)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (confirm("Delete this expenditure record?")) {
      try {
        await expenseService.deleteExpense(id)
        await fetchData()
      } catch (err) {
        alert("Deletion failed.")
      }
    }
  }

  const handleExportPDF = async () => {
    if (!invoiceRef.current || !selectedInvoice) return
    
    try {
      // Phase 8: Stabilization Delay to ensure all gradients and icons stay sharp
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ensure images are loaded
      const images = invoiceRef.current.getElementsByTagName('img')
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve()
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve })
      }))

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3, // Ultra-high resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Auto-detect dimensions from the mm-locked template
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('invoice-capture-area');
          if (el) {
            el.style.border = 'none';
            el.style.boxShadow = 'none';
            el.style.margin = '0';
            el.style.padding = '0';
            el.style.backgroundColor = '#ffffff';
          }
        }
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Forces exactly 1:1 mapping to the A4 page dimensions
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
      
      const fileName = `MD_INV_${selectedInvoice.invoiceNumber}_${selectedInvoice.client.name.replace(/[^a-z0-9]/gi, '_').toUpperCase()}.pdf`
      
      // FORCED MANUAL DOWNLOAD
      const blob = pdf.output('blob')
      const pdfBlob = new Blob([blob], { type: 'application/pdf' }) // Explicitly set type
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (err: any) {
      console.error("PDF Export Failure:", err)
      alert(`Critical: PDF export failed. ${err.message || ''}`)
    }
  }

  const handleRecordPayment = async (invoice: Invoice) => {
    const newStatus = invoice.status === 'Paid' ? 'Sent' : 'Paid'
    try {
      await invoiceService.updateInvoice(invoice.id, { status: newStatus })
      await fetchData()
    } catch (err) {
      console.error("Payment update error:", err)
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    if (confirm("Permanently delete this record?")) {
      try {
        await invoiceService.deleteInvoice(id)
        setInvoices(invoices.filter(i => i.id !== id))
      } catch (err) {
        alert("Deletion failed.")
      }
    }
  }

  const filteredInvoices = React.useMemo(() => {
    return invoices.filter(i => {
      const invNum = i.invoiceNumber || ''
      const clientName = i.client?.name || ''
      const matchesSearch = invNum.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           clientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'All' || i.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, filterStatus])

  const stats = React.useMemo(() => ({
    total: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0),
    pending: invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0),
    expenses: expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  }), [invoices, expenses])

  if (loading || isAuthLoading || !currentCompany) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-primary/30 relative overflow-x-hidden">
      {/* CINEMATIC OVERLAYS */}
      <div className="subtle-noise" />
      <div className="scan-line" />
      
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen z-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[160px] animate-fluid-glow" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px]" style={{ animationDelay: '4s' }} />
      </div>

      {/* HIDDEN INVOICE RENDERER FOR EMAIL PDF GENERATION */}
      <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
        <div ref={emailRef} className="w-[210mm] min-h-[297mm] bg-white">
          {selectedInvoice && (
            <InvoiceTemplate invoice={selectedInvoice} company={currentCompany} />
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-[100] px-4 md:px-8 py-4 bg-slate-950/80 backdrop-blur-[40px] border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="w-12 h-12 bg-gradient-to-br from-slate-900 to-black rounded-2xl flex items-center justify-center p-2 border border-white/10 shadow-2xl relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {currentCompany?.logo ? (
                  <img 
                    src={currentCompany.logo} 
                    alt="Logo" 
                    className="max-w-full max-h-full object-contain relative z-10 gold-filter brightness-125" 
                  />
                ) : (
                  <span className="text-white font-black text-xl italic relative z-10 uppercase">{currentCompany?.name.slice(0, 2)}</span>
                )}
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-black tracking-[0.1em] uppercase leading-none gold-text-gradient mb-1">
                  {currentCompany?.name}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-primary rounded-full animate-pulse" />
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">
                    Enterprise Portal
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block flex-1 max-w-[1000px] px-4 overflow-visible">
            <KPIBar stats={{
              total: stats.total,
              paid: stats.paid,
              pending: stats.pending,
              expenses: stats.expenses
            }} />
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button 
              onClick={() => logout()}
              className="flex items-center gap-2 px-4 py-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-2xl transition-all group"
            >
              <span className="text-[8px] md:text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hidden xl:block">Quit Session</span>
              <LogOut size={18} className="text-rose-500 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row w-full p-4 md:p-10 gap-6 md:gap-10">
          {/* Responsive Sidebar */}
          <aside className={`
            fixed inset-0 z-[150] lg:relative lg:z-10 lg:w-[350px] transition-transform duration-500 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            {/* Mobile Backdrop */}
            <div 
              className={`absolute inset-0 bg-black/80 backdrop-blur-md lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setIsSidebarOpen(false)}
            />
            
            <div className="relative h-full lg:h-auto w-[280px] md:w-[320px] lg:w-full bg-slate-950 lg:bg-transparent border-r border-white/5 lg:border-none p-6 lg:p-0 flex flex-col gap-8">
              <Sidebar 
                clients={clients}
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab)
                  setIsSidebarOpen(false)
                }}
                onAddClient={() => {
                  setEditingClient(null)
                  setShowClientForm(true)
                }}
                onDeleteClient={handleDeleteClient}
                onSettings={() => router.push('/settings')}
              />
            </div>
          </aside>

          {/* Main Dashboard Interaction Area */}
          <section className="flex-1 space-y-6 md:space-y-10 min-w-0">
            {/* Mobile/Tablet KPI Bar */}
            <div className="lg:hidden">
              <KPIBar stats={{
                total: stats.total,
                paid: stats.paid,
                pending: stats.pending,
                expenses: stats.expenses
              }} />
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'invoices' ? (
                <motion.div 
                  key="invoices-tab"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }} 
                  className="space-y-10"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }} 
                    className="glass-card p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 border border-white/5 relative overflow-hidden group shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative z-10 text-center md:text-left">
                      <div className="section-header-redefined">MD Enterprise Infrastructure</div>
                      <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                        Enterprise <span className="gold-text-gradient">Registry</span>
                      </h2>
                      <div className="flex flex-wrap justify-center md:justify-start gap-6 items-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Enterprise Protocol v4.0.5</p>
                        <div className="h-1 w-1 bg-primary/40 rounded-full animate-pulse hidden md:block" />
                        <span className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-[8px] font-black text-primary uppercase tracking-[0.2em]">Validated Transactional Ledger</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setEditingInvoice(null); setShowInvoiceForm(true) }}
                      className="premium-button-redefined"
                    >
                      Issue New Instrument
                    </button>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.2 }}
                    className="overflow-x-auto pb-6 custom-scrollbar"
                  >
                    <InvoiceList 
                      invoices={filteredInvoices}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      onView={(inv) => { setSelectedInvoice(inv); setShowInvoiceView(true) }}
                      onEdit={(inv) => { setEditingInvoice(inv); setShowInvoiceForm(true) }}
                      onDelete={handleDeleteInvoice}
                      onPayment={handleRecordPayment}
                      onEmail={handleSendEmail}
                      onNew={() => { setEditingInvoice(null); setShowInvoiceForm(true) }}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  key="expenses-tab"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }} 
                  className="space-y-10"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }} 
                    className="glass-card p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 border border-white/5 relative overflow-hidden group shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative z-10 text-center md:text-left">
                      <div className="section-header-redefined">MD Enterprise Capital Flow</div>
                      <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                        Audit <span className="text-rose-500">Expenditure</span>
                      </h2>
                      <div className="flex flex-wrap justify-center md:justify-start gap-6 items-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Enterprise Asset Allocation</p>
                        <div className="h-1 w-1 bg-rose-500/40 rounded-full animate-pulse hidden md:block" />
                        <span className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-[8px] font-black text-rose-400 uppercase tracking-[0.2em]">Verified Personnel Only</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setEditingExpense(null); setShowExpenseForm(true) }}
                      className="premium-button-redefined !border-rose-500/20 hover:!border-rose-500/50 hover:shadow-rose-500/30"
                    >
                      Authenticate Outflow
                    </button>
                  </motion.div>

                  <div className="space-y-4">
                    {expenses.length === 0 ? (
                      <div className="p-12 md:p-24 glass-card rounded-[32px] text-center italic text-slate-500">
                        No expenditure data available in current cycle.
                      </div>
                    ) : (
                      expenses.map((exp, i) => (
                        <motion.div 
                          key={exp.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-8 md:p-10 bg-slate-900/40 backdrop-blur-[40px] rounded-[32px] md:rounded-[40px] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 group hover:bg-white/[0.05] transition-all relative overflow-hidden shadow-xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/[0.02] to-transparent pointer-events-none" />
                            <div className="flex items-center gap-6 md:gap-10 relative z-10">
                              <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-950 border border-white/10 rounded-[24px] flex items-center justify-center shadow-2xl group-hover:border-rose-500/20 transition-all">
                                <IndianRupee size={24} className="text-slate-600 group-hover:text-rose-500 transition-colors" />
                              </div>
                              <div>
                                <p className="text-lg md:text-2xl font-black text-white italic uppercase tracking-widest leading-none mb-3 group-hover:text-rose-400 transition-colors">{exp.description}</p>
                                <div className="flex items-center gap-4">
                                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">{exp.category}</span>
                                  <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                  <p className="text-[9px] md:text-[11px] font-bold text-slate-600 uppercase tracking-[0.4em]">
                                    {new Date(exp.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-10 relative z-10">
                              <div className="text-right">
                                <p className="text-2xl md:text-4xl font-black text-rose-500 tracking-tighter leading-none mb-2">₹{exp.amount.toLocaleString('en-IN')}</p>
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Settled Outflow</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <motion.button 
                                  onClick={() => { setEditingExpense(exp); setShowExpenseForm(true) }}
                                  whileHover={{ scale: 1.2, rotate: -15 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 text-slate-700 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all shadow-lg"
                                >
                                  <Edit2 size={20} />
                                </motion.button>
                                <motion.button 
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  whileHover={{ scale: 1.2, rotate: 90 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all shadow-lg"
                                >
                                  <Trash2 size={20} />
                                </motion.button>
                              </div>
                            </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>

      {/* MODALS & PORTALS */}
      <InvoiceFormModal 
        isOpen={showInvoiceForm}
        onClose={() => { setShowInvoiceForm(false); setEditingInvoice(null) }}
        onSave={handleSaveInvoice}
        initialData={editingInvoice}
        clients={clients}
        companyId={currentCompany!.id}
      />

      <AnimatePresence>
        {showInvoiceView && selectedInvoice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/98 backdrop-blur-[40px] flex items-center justify-center z-[200] p-4 md:p-12"
            onClick={() => setShowInvoiceView(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col relative border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL CLOSE BUTTON - PREMIUM OVERLAY */}
              <button 
                onClick={() => setShowInvoiceView(false)}
                className="absolute top-8 right-8 z-50 p-4 bg-slate-950 text-white rounded-2xl border border-white/10 hover:border-primary/50 transition-all shadow-2xl group"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-slate-100">
                <div className="flex justify-center p-12">
                  <div id="invoice-capture-area" ref={invoiceRef} className="w-[210mm] min-h-[297mm] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] rounded-sm bg-white">
                    <InvoiceTemplate invoice={selectedInvoice!} company={currentCompany!} />
                  </div>
                </div>
              </div>

              {/* ACTION TOOLBAR - CINEMATIC GLASS */}
              <div className="p-10 bg-slate-950 border-t border-white/5 flex flex-wrap justify-between items-center gap-8">
                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 text-primary">Status: Authorized</p>
                  <p className="text-sm font-black text-white italic tracking-widest">Serial #{selectedInvoice?.invoiceNumber}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                            const styles = Array.from(document.head.querySelectorAll('style, link')).map(s => s.outerHTML).join('\n');
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Print Invoice</title>
                                  ${styles}
                                  <style>
                                    @page { size: A4; margin: 0; }
                                    body { margin: 0; padding: 0; background: #ffffff !important; }
                                    .print-container { 
                                      width: 210mm; 
                                      min-height: 297mm; 
                                      margin: 0 auto;
                                      background: white;
                                    }
                                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                  </style>
                                </head>
                                <body>
                                  <div class="print-container">
                                    ${invoiceRef.current?.innerHTML || ''}
                                  </div>
                                  <script>
                                    window.onload = () => {
                                      setTimeout(() => {
                                        window.print();
                                        window.close();
                                      }, 500);
                                    };
                                  </script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                        }
                    }}
                    className="flex items-center gap-3 px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
                  >
                    <Printer size={18} />
                    Printer Protocol
                  </button>
                  
                  <motion.button 
                    onClick={handleExportPDF}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex items-center gap-4 px-12 py-5 premium-button text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20"
                  >
                    <Download size={20} />
                    Archive as PDF
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ClientFormModal 
        isOpen={showClientForm}
        onClose={() => setShowClientForm(false)}
        onSave={handleSaveClient}
        initialData={editingClient}
      />

      <ExpenseFormModal 
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />
    </div>
  )
}
