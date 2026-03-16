'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Invoice, InvoiceItem } from '@/lib/types'
import { Plus, Trash2, Eye, Download, Printer, LogOut, Edit2, Search, TrendingUp, DollarSign, AlertCircle, X, Users, FileText, Clock, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface LineItemInput {
  id: string
  description: string
  quantity: string
  price: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export default function EnhancedBillingDashboard() {
  const { currentCompany, logout } = useAuth()
  const router = useRouter()
  const invoiceRef = useRef<HTMLDivElement>(null)

  // ===== MAIN STATE =====
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  
  // ===== UI STATE =====
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses'>('invoices')
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [showInvoiceView, setShowInvoiceView] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const [showCompanySettings, setShowCompanySettings] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')

  // ===== EXPENSES STATE =====
  const [expenses, setExpenses] = useState<any[]>([])
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Travel',
    date: new Date().toISOString().split('T')[0]
  })

  // ===== LINE ITEMS STATE =====
  const [lineItems, setLineItems] = useState<LineItemInput[]>([
    { id: '1', description: '', quantity: '1', price: '' }
  ])

  // ===== COMPANY SETTINGS (GST & LOGO) =====
  const [companySettings, setCompanySettings] = useState({
    gstNumber: '',
    logoUrl: '',
    companyAddress: '',
    companyPhone: ''
  })

  // ===== FORM DATA =====
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientGstNumber: '',
    dueDate: '',
    paymentTerms: 'Net 30',
    notes: '',
    taxRate: '18'
  })

  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'online',
    date: new Date().toISOString().split('T')[0]
  })

  // ===== LOGOUT HANDLER =====
  const handleLogout = () => {
    logout()
    router.push('/company-selection')
  }

  // ===== PERSISTENCE =====
  useEffect(() => {
    const key = `invoices_${currentCompany?.id}`
    const saved = localStorage.getItem(key)
    if (saved) {
      setInvoices(JSON.parse(saved))
    }
  }, [currentCompany?.id])

  useEffect(() => {
    if (currentCompany?.id) {
      localStorage.setItem(`invoices_${currentCompany.id}`, JSON.stringify(invoices))
    }
  }, [invoices, currentCompany?.id])

  useEffect(() => {
    const key = `clients_${currentCompany?.id}`
    const saved = localStorage.getItem(key)
    if (saved) {
      setClients(JSON.parse(saved))
    }
  }, [currentCompany?.id])

  useEffect(() => {
    if (currentCompany?.id) {
      localStorage.setItem(`clients_${currentCompany.id}`, JSON.stringify(clients))
    }
  }, [clients, currentCompany?.id])

  // ===== COMPANY SETTINGS PERSISTENCE =====
  useEffect(() => {
    if (currentCompany?.id) {
      localStorage.setItem(`companySettings_${currentCompany.id}`, JSON.stringify(companySettings))
    }
  }, [companySettings, currentCompany?.id])

  useEffect(() => {
    const key = `expenses_${currentCompany?.id}`
    const saved = localStorage.getItem(key)
    if (saved) setExpenses(JSON.parse(saved))
  }, [currentCompany?.id])

  useEffect(() => {
    if (currentCompany?.id) {
      localStorage.setItem(`expenses_${currentCompany.id}`, JSON.stringify(expenses))
    }
  }, [expenses, currentCompany?.id])

  // ===== UTILITIES =====
  const calculateAmount = (qty: string, price: string): number => {
    return (parseFloat(qty) || 0) * (parseFloat(price) || 0)
  }

  const calculateTotals = (items: LineItemInput[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + calculateAmount(item.quantity, item.price), 0)
    const tax = subtotal * (taxRate / 100)
    return { subtotal, tax, total: subtotal + tax }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Paid': 'bg-green-100 text-green-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Overdue': 'bg-red-100 text-red-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-slate-100 text-slate-800',
      'Partial': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // ===== CLIENTS =====
  const addClient = () => {
    if (!clientForm.name || !clientForm.email) {
      alert('Name and email required')
      return
    }
    setClients([...clients, { id: Date.now().toString(), ...clientForm }])
    setClientForm({ name: '', email: '', phone: '', address: '' })
    setShowClientForm(false)
  }

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id))
  }

  const selectClient = (client: Client) => {
    setFormData({
      ...formData,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientAddress: client.address,
      clientGstNumber: (client as any).taxId || ''
    })
  }

  // ===== LINE ITEMS =====
  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now().toString(), description: '', quantity: '1', price: '' }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const updateLineItem = (id: string, field: keyof LineItemInput, value: string) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  // ===== INVOICE CRUD =====
  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientGstNumber: '',
      dueDate: '',
      paymentTerms: 'Net 30',
      notes: '',
      taxRate: '18'
    })
    setLineItems([{ id: '1', description: '', quantity: '1', price: '' }])
    setEditingInvoiceId(null)
  }

  const createInvoice = () => {
    if (!formData.clientName || lineItems.some(i => !i.description || !i.quantity || !i.price)) {
      alert('Fill all required fields')
      return
    }

    const items: InvoiceItem[] = lineItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.price),
      amount: calculateAmount(item.quantity, item.price),
      taxable: true
    }))

    const taxRate = parseFloat(formData.taxRate) / 100
    const { subtotal, tax, total } = calculateTotals(lineItems, parseFloat(formData.taxRate))

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${currentCompany?.id}-${Date.now().toString().slice(-5)}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientId: formData.clientId || formData.clientName,
      client: {
        id: formData.clientId || formData.clientName,
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone,
        address: formData.clientAddress,
        taxId: formData.clientGstNumber,
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      items,
      subtotal,
      taxRate,
      taxAmount: tax,
      total,
      status: 'Draft',
      notes: formData.notes,
      paymentTerms: formData.paymentTerms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setInvoices([newInvoice, ...invoices])
    resetForm()
    setShowNewInvoiceModal(false)
  }

  const updateInvoice = () => {
    if (!selectedInvoice) return
    if (!formData.clientName || lineItems.some(i => !i.description || !i.quantity || !i.price)) {
      alert('Fill all required fields')
      return
    }

    const items: InvoiceItem[] = lineItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.price),
      amount: calculateAmount(item.quantity, item.price),
      taxable: true
    }))

    const taxRate = parseFloat(formData.taxRate) / 100
    const { subtotal, tax, total } = calculateTotals(lineItems, parseFloat(formData.taxRate))

    const updated: Invoice = {
      ...selectedInvoice,
      client: { 
        ...selectedInvoice.client, 
        name: formData.clientName, 
        email: formData.clientEmail, 
        phone: formData.clientPhone, 
        address: formData.clientAddress,
        taxId: formData.clientGstNumber
      },
      items,
      subtotal,
      taxRate,
      taxAmount: tax,
      total,
      notes: formData.notes,
      paymentTerms: formData.paymentTerms,
      updatedAt: new Date().toISOString()
    }

    setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? updated : inv))
    setSelectedInvoice(updated)
    setEditingInvoiceId(null)
    resetForm()
  }

  const deleteInvoice = (id: string) => {
    if (confirm('Delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== id))
    }
  }

  const loadEditInvoice = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id)
    setSelectedInvoice(invoice)
    setFormData({
      clientId: invoice.clientId,
      clientName: invoice.client.name,
      clientEmail: invoice.client.email,
      clientPhone: invoice.client.phone,
      clientAddress: invoice.client.address,
      clientGstNumber: (invoice.client as any).taxId || '',
      dueDate: invoice.dueDate,
      paymentTerms: invoice.paymentTerms || 'Net 30',
      notes: invoice.notes || '',
      taxRate: (invoice.taxRate * 100).toString()
    })
    setLineItems(invoice.items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity.toString(),
      price: item.unitPrice.toString()
    })))
    setShowNewInvoiceModal(true)
  }

  const updateStatus = (id: string, status: Invoice['status']) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status } : inv))
  }

  const recordPayment = () => {
    if (!selectedInvoice || !paymentData.amount) {
      alert('Enter payment amount')
      return
    }
    const amount = parseFloat(paymentData.amount)
    const newPaid = (selectedInvoice.amountPaid || 0) + amount
    const isPaid = newPaid >= selectedInvoice.total
    updateStatus(selectedInvoice.id, isPaid ? 'Paid' : newPaid > 0 ? 'Partial' : 'Sent')
    setInvoices(invoices.map(inv =>
      inv.id === selectedInvoice.id ? { ...inv, amountPaid: newPaid } : inv
    ))
    setShowPaymentModal(false)
    setPaymentData({ amount: '', method: 'online', date: new Date().toISOString().split('T')[0] })
  }

  // ===== SEARCH & FILTER =====
  const filtered = invoices.filter(inv => {
    const match = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  inv.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    const status = filterStatus === 'All' || inv.status === filterStatus
    return match && status
  })

  // ===== ANALYTICS =====
  const stats = {
    total: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.reduce((s, i) => s + (i.amountPaid || 0), 0),
    pending: invoices.reduce((s, i) => s + Math.max(0, i.total - (i.amountPaid || 0)), 0),
    expenses: expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
    paidCount: invoices.filter(i => i.status === 'Paid').length,
    draftCount: invoices.filter(i => i.status === 'Draft').length,
    sentCount: invoices.filter(i => i.status === 'Sent').length
  }

  const profit = stats.paid - stats.expenses

  // ===== EXPORTS =====
  const exportPdf = async (invoice: Invoice) => {
    if (invoiceRef.current) {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const img = canvas.toDataURL('image/png')
      pdf.addImage(img, 'PNG', 10, 10, 190, 277)
      pdf.save(`${invoice.invoiceNumber}.pdf`)
    }
  }

  const exportCSV = () => {
    const rows = filtered.map(i => [i.invoiceNumber, i.client.name, i.issueDate, i.total.toFixed(2), i.status])
    const csv = [['Invoice', 'Client', 'Date', 'Amount', 'Status'], ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const printInvoice = () => {
    window.print()
  }

  if (!currentCompany) {
    router.push('/company-selection')
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* PREMIUM BACKGROUND ANIMATIONS */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-blue-600 rounded-full blur-[120px] opacity-20"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-purple-600 rounded-full blur-[120px] opacity-20"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="relative z-10">
      {/* HEADER */}
      <motion.header
        className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/30 overflow-hidden relative"
            >
              {(companySettings.logoUrl || currentCompany.logo) ? (
                <img 
                  src={companySettings.logoUrl || currentCompany.logo} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold">${currentCompany.name.slice(0,2)}</span>`;
                  }}
                />
              ) : (
                <span className="text-2xl font-bold">{currentCompany.name.slice(0,2)}</span>
              )}
            </motion.div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">BILLING<span className="text-blue-600">PRO</span></h1>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest leading-none">{currentCompany.name}</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Revenue', val: stats.paid, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Pending', val: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Expenses', val: stats.expenses, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Profit', val: profit, color: 'text-blue-600', bg: 'bg-blue-50' }
              ].map((item, i) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`${item.bg} rounded-xl p-3 border border-white/50 shadow-sm`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                  <p className={`text-sm font-black ${item.color}`}>${item.val.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <motion.button
              onClick={() => setShowAnalytics(true)}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-semibold"
            >
              <TrendingUp size={20} />
              Analytics
            </motion.button>
            <motion.button
              onClick={() => setShowCompanySettings(true)}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-semibold"
            >
              ⚙️
              Settings
            </motion.button>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold"
            >
              <LogOut size={20} />
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-4 gap-6">
        {/* SIDEBAR - CLIENTS */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-slate-200 h-fit sticky top-24"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users size={20} />
              Clients
            </h3>
            <motion.button
              onClick={() => setShowClientForm(!showClientForm)}
              whileHover={{ scale: 1.1 }}
              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
            >
              <Plus size={18} />
            </motion.button>
          </div>

          {showClientForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
              <input
                placeholder="Name"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                placeholder="Email"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                placeholder="Phone"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-2">
                <motion.button onClick={addClient} whileTap={{ scale: 0.95 }} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700">
                  Add
                </motion.button>
                <motion.button onClick={() => setShowClientForm(false)} whileTap={{ scale: 0.95 }} className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded text-sm font-semibold">
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}

          <div className="space-y-4 mb-8">
            <motion.button
              onClick={() => setActiveTab('invoices')}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold text-sm ${activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-white border border-slate-200'}`}
            >
              <FileText size={18} />
              Invoices
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('expenses')}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold text-sm ${activeTab === 'expenses' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-white border border-slate-200'}`}
            >
              <DollarSign size={18} />
              Expenses
            </motion.button>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {clients.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No clients yet</p>
            ) : (
              clients.map((client) => (
                <motion.div
                  key={client.id}
                  whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  className="p-3 rounded-xl border border-transparent hover:border-blue-100 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{client.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium tracking-tight truncate w-32">{client.email}</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.2, color: '#ef4444' }}
                    onClick={(e) => { e.stopPropagation(); deleteClient(client.id) }} 
                    className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
        {/* MAIN CONTENT */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-3 space-y-6">
          {activeTab === 'invoices' ? (
            <>
              {/* TOOLBAR */}
              <div className="flex gap-4 items-center bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/30">
                <div className="flex-1 flex items-center gap-2 bg-slate-50/50 rounded-xl px-4 py-2 border border-slate-200 shadow-inner">
                  <Search size={20} className="text-slate-500" />
                  <input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-slate-900 font-medium"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-white/50 border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm"
                >
                  {['All', 'Draft', 'Sent', 'Paid', 'Partial', 'Overdue', 'Cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <motion.button
                  onClick={() => { resetForm(); setShowNewInvoiceModal(true) }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:shadow-2xl font-bold shadow-lg"
                >
                  <Plus size={20} />
                  New Invoice
                </motion.button>
              </div>

              {/* INVOICES LIST */}
              <div className="space-y-4">
                {filtered.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/50 backdrop-blur-md rounded-3xl shadow-xl p-16 text-center border border-white/30">
                    <AlertCircle size={64} className="mx-auto text-slate-300 mb-6" />
                    <p className="text-slate-500 text-xl font-bold italic">No invoices found</p>
                  </motion.div>
                ) : (
                  filtered.map((invoice, idx) => (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.01, y: -4 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl transition-all overflow-hidden group"
                    >
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-black text-xl text-slate-900 tracking-tight">{invoice.invoiceNumber}</h3>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>
                          <p className="text-slate-600 font-medium">
                            <span className="text-blue-600 font-bold">{invoice.client.name}</span>
                            <span className="mx-2 opacity-30">•</span>
                            {invoice.issueDate}
                          </p>
                        </div>

                        <div className="text-right mr-8">
                          <p className="text-3xl font-black text-slate-900 tracking-tighter">${invoice.total.toLocaleString()}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
                        </div>

                        <div className="flex items-center gap-3">
                          {[
                            { icon: Eye, onClick: () => { setSelectedInvoice(invoice); setShowInvoiceView(true) }, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { icon: Edit2, onClick: () => loadEditInvoice(invoice), color: 'text-purple-600', bg: 'bg-purple-50' },
                            { icon: DollarSign, onClick: () => { setSelectedInvoice(invoice); setShowPaymentModal(true) }, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { icon: Trash2, onClick: () => deleteInvoice(invoice.id), color: 'text-rose-600', bg: 'bg-rose-50' }
                          ].map((btn, i) => (
                            <motion.button
                              key={i}
                              onClick={btn.onClick}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              className={`p-3 ${btn.bg} ${btn.color} rounded-xl transition shadow-sm border border-white/50 hover:shadow-md`}
                            >
                              <btn.icon size={20} />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* EXPENSES TOOLBAR */}
              <div className="flex gap-4 items-center bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/30">
                <div className="flex-1">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Business Expenses</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Track your operational costs</p>
                </div>

                <motion.button
                  onClick={() => setShowNewExpenseModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-xl hover:shadow-2xl font-bold shadow-lg"
                >
                  <Plus size={20} />
                  Add Expense
                </motion.button>
              </div>

              {/* EXPENSES LIST */}
              <div className="grid grid-cols-1 gap-4">
                {expenses.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/50 backdrop-blur-md rounded-3xl shadow-xl p-16 text-center border border-white/30">
                    <DollarSign size={64} className="mx-auto text-slate-300 mb-6" />
                    <p className="text-slate-500 text-xl font-bold italic">No expenses recorded</p>
                  </motion.div>
                ) : (
                  expenses.map((expense, idx) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm">
                          <DollarSign size={24} />
                        </div>
                        <div>
                          <p className="font-black text-lg text-slate-900 tracking-tight">{expense.description}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {expense.category} <span className="mx-2 opacity-30">•</span> {expense.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-2xl font-black text-rose-600 tracking-tighter">-${parseFloat(expense.amount).toLocaleString()}</p>
                        </div>
                        <motion.button
                          onClick={() => {
                            if(confirm('Delete expense?')) {
                              setExpenses(expenses.filter(e => e.id !== expense.id))
                            }
                          }}
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ===== NEW EXPENSE MODAL ===== */}
      {showNewExpenseModal && (
        <motion.div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowNewExpenseModal(false)}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">New Expense</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">What was it for?</label>
                <input
                  placeholder="e.g., Office Supplies"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">How much?</label>
                  <input
                    placeholder="0.00"
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold"
                  >
                    {['Travel', 'Office', 'Salaries', 'Materials', 'Marketing', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <motion.button
                  onClick={() => setShowNewExpenseModal(false)}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    if(!expenseForm.description || !expenseForm.amount) return
                    setExpenses([{ id: Date.now().toString(), ...expenseForm }, ...expenses])
                    setExpenseForm({ description: '', amount: '', category: 'Travel', date: new Date().toISOString().split('T')[0] })
                    setShowNewExpenseModal(false)
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg"
                >
                  Save Expense
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* ===== NEW/EDIT INVOICE MODAL ===== */}
      {showNewInvoiceModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowNewInvoiceModal(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{editingInvoiceId ? 'Edit Invoice' : 'New Invoice'}</h2>
                <motion.button onClick={() => setShowNewInvoiceModal(false)} whileHover={{ scale: 1.1 }} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 border-b pb-2">Client Details</h3>
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Existing Client</label>
                    <select
                      onChange={(e) => {
                        const client = clients.find(c => c.id === e.target.value)
                        if (client) selectClient(client)
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Choose Client --</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <input
                    placeholder="Client Name"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      placeholder="Phone"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Address"
                    rows={2}
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    placeholder="Client GST (Optional)"
                    value={formData.clientGstNumber}
                    onChange={(e) => setFormData({ ...formData, clientGstNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 border-b pb-2">Invoice Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
                      <select
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="Net 30">Net 30</option>
                        <option value="Net 15">Net 15</option>
                        <option value="Due on Receipt">Due on Receipt</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Notes for the client"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-700">Line Items</h3>
                  <motion.button
                    onClick={addLineItem}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1 text-sm text-blue-600 font-bold hover:bg-blue-50 px-3 py-1 rounded"
                  >
                    <Plus size={16} /> Add Item
                  </motion.button>
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b">
                        <th className="pb-2">Description</th>
                        <th className="pb-2 w-24">Qty</th>
                        <th className="pb-2 w-32">Price</th>
                        <th className="pb-2 w-32 text-right">Amount</th>
                        <th className="pb-2 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="py-2">
                            <input
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              placeholder="Service or Product"
                              className="w-full px-2 py-1 outline-none focus:bg-slate-50 rounded"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                              className="w-full px-2 py-1 outline-none focus:bg-slate-50 rounded"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateLineItem(item.id, 'price', e.target.value)}
                              className="w-full px-2 py-1 outline-none focus:bg-slate-50 rounded"
                            />
                          </td>
                          <td className="py-2 text-right font-semibold text-slate-700">
                            ${calculateAmount(item.quantity, item.price).toLocaleString()}
                          </td>
                          <td className="py-2 text-right">
                            <button onClick={() => removeLineItem(item.id)} className="text-slate-300 hover:text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 border-t font-semibold">
                <div className="text-slate-500">
                  <p>Subtotal: ${calculateTotals(lineItems, parseFloat(formData.taxRate)).subtotal.toLocaleString()}</p>
                  <p>Tax: ${calculateTotals(lineItems, parseFloat(formData.taxRate)).tax.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">
                    Total: ${calculateTotals(lineItems, parseFloat(formData.taxRate)).total.toLocaleString()}
                  </p>
                  <div className="flex gap-4 mt-6">
                    <motion.button
                      onClick={() => setShowNewInvoiceModal(false)}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={editingInvoiceId ? updateInvoice : createInvoice}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200"
                    >
                      {editingInvoiceId ? 'Save Changes' : 'Create Invoice'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ===== PAYMENT MODAL ===== */}
      {showPaymentModal && selectedInvoice && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowPaymentModal(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Record Payment</h2>
            <p className="text-slate-500 mb-6 font-medium">For {selectedInvoice.invoiceNumber}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount Received</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-1 text-right">Balance Due: ${(selectedInvoice.total - (selectedInvoice.amountPaid || 0)).toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                >
                  <option value="online">Online Transfer</option>
                  <option value="bank">Bank Deposit</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <motion.button onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">
                  Cancel
                </motion.button>
                <motion.button 
                  onClick={recordPayment} 
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg"
                  whileTap={{ scale: 0.95 }}
                >
                  Confirm Payment
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ===== ANALYTICS MODAL ===== */}
      {showAnalytics && (
        <motion.div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-50 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAnalytics(false)}
        >
          <motion.div
            className="bg-white/5 border border-white/10 rounded-[40px] shadow-2xl max-w-5xl w-full p-12 text-white relative overflow-hidden"
            initial={{ y: 50, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* GLOW DECOR */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />

            <div className="relative flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Financial <span className="text-blue-500">Intelligence</span></h2>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs mt-2">Real-time performance metrics</p>
              </div>
              <motion.button 
                onClick={() => setShowAnalytics(false)}
                whileHover={{ rotate: 90, scale: 1.2 }}
                className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all font-black text-xl"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="relative grid grid-cols-3 gap-8">
              <div className="col-span-2 grid grid-cols-2 gap-6">
                 {[
                   { label: 'Total Revenue', val: stats.total, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                   { label: 'Net Profit', val: profit, icon: TrendingUp, color: profit >= 0 ? 'text-emerald-400' : 'text-rose-400', bg: profit >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10' },
                   { label: 'Operational Costs', val: stats.expenses, icon: DollarSign, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                   { label: 'Outstanding Debt', val: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' }
                 ].map((stat, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className={`${stat.bg} border border-white/5 rounded-3xl p-8 flex flex-col justify-between h-48 hover:bg-white/10 transition-colors cursor-default`}
                   >
                     <div className="flex justify-between items-start">
                       <div className={`p-4 rounded-2xl ${stat.bg} border border-white/5 shadow-2xl`}>
                         <stat.icon size={28} className={stat.color} />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Monthly</span>
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                       <p className={`text-4xl font-black tracking-tighter ${stat.color}`}>${stat.val.toLocaleString()}</p>
                     </div>
                   </motion.div>
                 ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                <h3 className="text-sm font-black uppercase tracking-widest mb-8 opacity-60">Health Overview</h3>
                <div className="space-y-8">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="85, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black tracking-tighter">85%</span>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Score</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                        <span className="opacity-50">Collection Rate</span>
                        <span className="text-emerald-400">92%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                        <span className="opacity-50">Expense Ratio</span>
                        <span className="text-rose-400 text-xs">18%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '18%' }} className="h-full bg-rose-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ===== INVOICE VIEW MODAL ===== */}
      {showInvoiceView && selectedInvoice && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowInvoiceView(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={invoiceRef} className="p-12 bg-white">
              <div className="mb-12 pb-8 border-b-2 border-slate-300">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    {companySettings.logoUrl && (
                      <img 
                        src={companySettings.logoUrl} 
                        alt="Company Logo" 
                        className="max-h-16 max-w-96 mb-4 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <h1 className="text-5xl font-bold text-slate-900 mb-2">INVOICE</h1>
                    <p className="text-lg text-slate-600">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Issue Date: {selectedInvoice.issueDate}</p>
                    <p className="text-sm text-slate-600">Due Date: {selectedInvoice.dueDate}</p>
                    <span className={`text-sm font-bold ${getStatusColor(selectedInvoice.status)} px-4 py-1 rounded-full mt-3 inline-block`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <p className="text-slate-600 mb-2 font-semibold">FROM:</p>
                    <p className="font-bold text-lg text-slate-900">{currentCompany.name}</p>
                    {companySettings.gstNumber && (
                      <p className="text-slate-600 font-semibold mt-2">
                        🇮🇳 GST: <span className="text-blue-700 font-bold">{companySettings.gstNumber}</span>
                      </p>
                    )}
                    {companySettings.companyAddress && (
                      <p className="text-slate-600 mt-2">{companySettings.companyAddress}</p>
                    )}
                    {companySettings.companyPhone && (
                      <p className="text-slate-600">Ph: {companySettings.companyPhone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-600 mb-2 font-semibold">BILL TO:</p>
                    <p className="font-bold text-lg text-slate-900">{selectedInvoice.client.name}</p>
                    <p className="text-slate-600">{selectedInvoice.client.email}</p>
                    <p className="text-slate-600">{selectedInvoice.client.phone}</p>
                    <p className="text-slate-600">{selectedInvoice.client.address}</p>
                    {selectedInvoice.client.taxId && (
                      <p className="text-slate-600 font-semibold mt-2">
                        GST: <span className="text-blue-700 font-bold">{selectedInvoice.client.taxId}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300">
                      <th className="text-left py-4 px-6 font-bold text-slate-900">Description</th>
                      <th className="text-center py-4 px-6 font-bold text-slate-900">Quantity</th>
                      <th className="text-right py-4 px-6 font-bold text-slate-900">Unit Price</th>
                      <th className="text-right py-4 px-6 font-bold text-slate-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-4 px-6 text-slate-900">{item.description}</td>
                        <td className="text-center py-4 px-6 text-slate-900">{item.quantity}</td>
                        <td className="text-right py-4 px-6 text-slate-900">${item.unitPrice.toLocaleString()}</td>
                        <td className="text-right py-4 px-6 text-slate-900 font-semibold">${item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

                <div className="flex justify-end mb-12">
                  {selectedInvoice && (
                    <div className="w-full max-w-md">
                      <div className="flex justify-between py-3 border-b border-slate-200">
                        <span className="text-slate-700">Subtotal</span>
                        <span className="font-semibold text-slate-900">${selectedInvoice.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b-2 border-slate-300">
                        <span className="text-slate-700">GST ({(selectedInvoice.taxRate * 100).toFixed(0)}%)</span>
                        <span className="font-semibold text-slate-900">${selectedInvoice.taxAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 rounded-lg mt-6">
                        <span className="font-bold text-lg">TOTAL DUE</span>
                        <span className="text-2xl font-bold">${selectedInvoice.total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedInvoice?.notes && (
                  <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 mb-2">Notes:</p>
                    <p className="text-slate-700">{selectedInvoice.notes}</p>
                  </div>
                )}

              <div className="pt-8 border-t border-slate-300 text-center text-slate-600">
                <p>Thank you for your business!</p>
                <p className="text-sm mt-2">Payment Terms: {selectedInvoice.paymentTerms || 'Net 30'}</p>
              </div>
            </div>

            <div className="bg-slate-50 px-8 py-6 flex justify-end gap-4 border-t border-slate-200">
              <motion.button onClick={() => setShowInvoiceView(false)} className="px-6 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 font-semibold">
                Close
              </motion.button>
              <motion.button onClick={printInvoice} className="flex items-center gap-2 px-6 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-semibold">
                <Printer size={18} /> Print
              </motion.button>
              <motion.button onClick={() => exportPdf(selectedInvoice)} className="flex items-center gap-2 px-6 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 font-semibold">
                <Download size={18} /> PDF
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ===== COMPANY SETTINGS MODAL ===== */}
      {showCompanySettings && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowCompanySettings(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Company Settings</h2>
              <motion.button onClick={() => setShowCompanySettings(false)} whileHover={{ scale: 1.1 }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </motion.button>
            </div>

            <div className="space-y-6">
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-green-600" />
                  Primary Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">GST Identification Number</label>
                    <input
                      placeholder="e.g., 22AAAAA0000A1Z5"
                      value={companySettings.gstNumber}
                      onChange={(e) => setCompanySettings({ ...companySettings, gstNumber: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Logo URL</label>
                    <input
                      placeholder="https://yourcompany.com/logo.png"
                      value={companySettings.logoUrl}
                      onChange={(e) => setCompanySettings({ ...companySettings, logoUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Company Details</h3>
                <div className="space-y-3">
                  <input
                    placeholder="Company Phone"
                    value={companySettings.companyPhone}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <textarea
                    placeholder="Company Address"
                    rows={3}
                    value={companySettings.companyAddress}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <motion.button onClick={() => setShowCompanySettings(false)} className="px-6 py-2 text-slate-600 font-bold bg-slate-100 rounded-lg">
                  Cancel
                </motion.button>
                <motion.button 
                  onClick={() => { alert('Settings saved!'); setShowCompanySettings(false) }} 
                  className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold shadow-lg"
                  whileTap={{ scale: 0.95 }}
                >
                  Save Settings
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .fixed, button, header, [class*="bg-slate-50"] { display: none !important; }
        }
      `}</style>
    </div>
  </div>
  )
}
