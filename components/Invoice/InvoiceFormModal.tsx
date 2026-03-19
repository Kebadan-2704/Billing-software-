'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, CheckCircle, FileText, Loader2, Camera, Scan, Image as ImageIcon } from 'lucide-react'
import { Invoice, InvoiceItem, Client } from '@/lib/types'
import { createWorker } from 'tesseract.js'
import Image from 'next/image'

interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (invoice: Partial<Invoice>) => void
  initialData?: Invoice | null
  clients: Client[]
  companyId: number
}

export default function InvoiceFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  clients,
  companyId
}: InvoiceFormModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    clientState: '',
    clientZip: '',
    clientCountry: 'India',
    clientGst: '',
    clientId: '',
    dueDate: '',
    paymentTerms: 'Net 30',
    notes: '',
    taxRate: 18
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState(0)

  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, amount: 0, taxable: true }
  ])

  useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.client.name,
        clientEmail: initialData.client.email,
        clientPhone: initialData.client.phone,
        clientAddress: initialData.client.address,
        clientCity: initialData.client.city || '',
        clientState: initialData.client.state || '',
        clientZip: initialData.client.zipCode || '',
        clientCountry: initialData.client.country || 'India',
        clientGst: initialData.client.gstNumber || '',
        clientId: initialData.clientId || '',
        dueDate: initialData.dueDate,
        paymentTerms: initialData.paymentTerms || 'Net 30',
        notes: initialData.notes || '',
        taxRate: initialData.taxRate * 100
      })
      setLineItems(initialData.items)
    } else {
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientCity: '',
        clientState: '',
        clientZip: '',
        clientCountry: 'India',
        clientGst: '',
        clientId: '',
        dueDate: '',
        paymentTerms: 'Net 30',
        notes: '',
        taxRate: 18
      })
      setLineItems([{ id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, amount: 0, taxable: true }])
    }
    setIsSubmitting(false)
  }, [initialData, isOpen])

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const taxAmount = subtotal * (formData.taxRate / 100)
    return { subtotal, taxAmount, total: subtotal + taxAmount }
  }

  const handleSave = () => {
    const { subtotal, taxAmount, total } = calculateTotals()
    const invoiceData: Partial<Invoice> = {
      client: {
        id: formData.clientId || initialData?.client.id || Date.now().toString(),
        company_id: companyId,
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone,
        address: formData.clientAddress,
        gstNumber: formData.clientGst,
        city: formData.clientCity,
        state: formData.clientState,
        zipCode: formData.clientZip,
        country: formData.clientCountry
      },
      clientId: formData.clientId || initialData?.clientId,
      items: lineItems,
      subtotal,
      taxRate: formData.taxRate / 100,
      taxAmount,
      total,
      dueDate: formData.dueDate,
      paymentTerms: formData.paymentTerms,
      notes: formData.notes,
      status: initialData?.status || 'Draft'
    }
    
    onSave(invoiceData)
  }

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const performOcr = async () => {
    if (!receiptImage) return
    setIsScanning(true)
    setOcrProgress(0)
    
    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100))
          }
        }
      })
      
      const { data: { text } } = await worker.recognize(receiptImage)
      await worker.terminate()
      
      console.log("OCR Extracted Text:", text)
      
      const lines = text.split('\n').filter(line => line.trim().length > 0)
      const detectedItems: InvoiceItem[] = []
      let detectedTotal = 0
      

      let pendingName = ''
      lines.forEach((line, index) => {
        const trimmedLine = line.trim()
        const upperLine = trimmedLine.toUpperCase()
        
        // Skip metadata lines aggressively
        if (
          upperLine.includes('DATE') || 
          upperLine.includes('SHIPPING') ||
          upperLine.includes('VENDOR') ||
          upperLine.includes('GSTIN') ||
          upperLine.includes('CODE') ||
          upperLine.includes('ADDRESS') ||
          trimmedLine.length < 3
        ) return

        // Skip lines that look like a standalone date
        if (/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|20\d{2})\b/i.test(upperLine)) return
        
        // Lenient price pattern: handles 1,234.56, 123.45, etc.
        const priceMatches = trimmedLine.match(/((\d{1,3}(?:[,\s]\d{3})*|\d+)(?:[\.,]\d{2}))/g)
        
        // Comprehensive summary keywords regex
        const isSummary = /(TOTAL|SUBTOTAL|TOTA|TOTL|NET|BALANCE|GRAND|ROUND|GST|TAX|VAT|AMOUNT|VALUE)/i.test(upperLine)

        if (priceMatches && priceMatches.length > 0) {
          const mainPriceStr = priceMatches[priceMatches.length - 1]
          const price = parseFloat(mainPriceStr.replace(/,/g, '').replace(' ', ''))
          
          if (isSummary) {
            // Update total amount if it seems like a final value
            if (/(TOTAL|TOTA|TOTL|NET|BALANCE|AMOUNT)/i.test(upperLine)) {
              detectedTotal = Math.max(detectedTotal, price)
            }
          } else {
            // Potential line item
            // Try to extract name: everything before the first price
            let name = trimmedLine.split(priceMatches[0])[0].replace(/^[\d\s\.\|]+/, '').replace(/[^\w\s]/gi, ' ').trim()
            
            if (name.length < 3 && pendingName) {
              name = pendingName
              pendingName = ''
            }

            if (name.length >= 3 && !/^\d+$/.test(name)) {
              detectedItems.push({
                id: Date.now().toString() + index,
                description: name.toUpperCase(),
                quantity: 1,
                unitPrice: price,
                amount: price,
                taxable: true
              })
              pendingName = ''
            } else if (pendingName) {
              detectedItems.push({
                id: Date.now().toString() + index,
                description: pendingName.toUpperCase(),
                quantity: 1,
                unitPrice: price,
                amount: price,
                taxable: true
              })
              pendingName = ''
            }
          }
        } else if (!isSummary && trimmedLine.length > 3) {
          // No price found, buffer as potential name if it's text-heavy
          const potentialName = trimmedLine.replace(/^[\d\s\.\|]+/, '').replace(/[^\w\s]/gi, ' ').trim()
          if (potentialName.length >= 3 && !/^\d+$/.test(potentialName)) {
            pendingName = potentialName
          }
        }
      })

      if (detectedItems.length > 0) {
        if (lineItems.length === 1 && !lineItems[0].description) {
          setLineItems(detectedItems)
        } else {
          setLineItems([...lineItems, ...detectedItems])
        }

        const summary = detectedItems.map((item, i) => `Item ${i + 1}: ${item.description} - ₹${item.unitPrice.toLocaleString()}`).join('\n')
        const totalMsg = detectedTotal > 0 ? `\n\nEstimated Total: ₹${detectedTotal.toLocaleString()}` : ''
        alert(`OCR Extraction Successful!\n\n${summary}${totalMsg}`)
      } else {
        alert("OCR completed but no items were clearly identified. Please check the image quality or crop to the table.")
      }
      
    } catch (err) {
      console.error("OCR Error:", err)
      alert("Failed to process receipt image.")
    } finally {
      setIsScanning(false)
      setOcrProgress(0)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] sm:p-4 lg:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, rotateX: -5 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.9, y: 20, rotateX: 5 }}
            className="glass-card !bg-slate-900/60 border border-white/10 sm:rounded-[40px] shadow-2xl max-w-6xl w-full h-full sm:h-[90vh] overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="p-4 sm:p-10 border-b border-white/10 flex justify-between items-center bg-slate-950/50 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
               <div className="relative z-10">
                <h2 className="text-xl sm:text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-1 sm:mb-3">
                  {initialData ? 'Synchronize' : 'Orchestrate'} <span className="gold-text-gradient">Instrument</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.4em]">Audit Node: Financial Emission Protocol</p>
                  <div className="hidden sm:block h-1 w-1 bg-primary/40 rounded-full animate-pulse" />
                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary/10 border border-primary/20 rounded-full text-[7px] sm:text-[8px] font-black text-primary uppercase tracking-widest">Secure Ledger</span>
                </div>
              </div>
              <motion.button 
                onClick={onClose}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black"
              >
                <X size={18} className="sm:hidden" />
                <X size={24} className="hidden sm:block" />
              </motion.button>
            </div>

            {/* MODAL BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-6 sm:space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 pb-8 sm:pb-16 border-b border-white/5">
                {/* CLIENT SECTION */}
                <div className="space-y-6 sm:space-y-12">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="h-[1px] w-8 sm:w-12 bg-primary/40" />
                    <h3 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] italic">Enterprise Entity Selection</h3>
                  </div>
                  <div className="space-y-3 sm:space-y-6">
                    <div className="space-y-1 sm:space-y-4">
                       <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.4em] ml-2">Enterprise Nexus Selection</label>
                       <select
                        value={formData.clientId}
                        onChange={(e) => {
                          const c = clients.find(cl => cl.id === e.target.value)
                          if (c) {
                            setFormData({ 
                              ...formData, 
                              clientId: c.id, 
                              clientName: c.name, 
                              clientEmail: c.email, 
                              clientPhone: c.phone, 
                              clientAddress: c.address, 
                              clientCity: c.city || '',
                              clientState: c.state || '',
                              clientZip: c.zipCode || '',
                              clientCountry: c.country || 'India',
                              clientGst: c.gstNumber || '' 
                            })
                          } else {
                            setFormData({ ...formData, clientId: '' })
                          }
                        }}
                        className="w-full px-4 sm:px-8 py-2 sm:py-5 bg-slate-950/40 border border-white/10 rounded-xl sm:rounded-2xl text-white text-xs sm:text-base font-bold outline-none focus:border-primary/50 transition-all shadow-inner appearance-none"
                      >
                        <option value="" className="bg-slate-900">Select Entity from Database</option>
                        {clients.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-4">
                       <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.4em] ml-2">Legal Name / Organization</label>
                        <input
                         placeholder="Organization Identity"
                         value={formData.clientName}
                         onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                         className="w-full px-4 sm:px-8 py-2 sm:py-5 bg-slate-950/40 border border-white/10 rounded-xl sm:rounded-[24px] text-white text-xs sm:text-base font-bold outline-none focus:border-primary/50 transition-all shadow-inner"
                       />
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8">
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 sm:h-9 flex items-center">Digital Relay (Email)</label>
                          <input
                           placeholder="Communications Node"
                           value={formData.clientEmail}
                           onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                           className="w-full px-4 sm:px-8 py-2 sm:py-5 bg-slate-950/50 border border-white/10 rounded-xl sm:rounded-[24px] text-white text-xs sm:text-base font-bold outline-none focus:border-primary/50 transition-all shadow-inner"
                         />
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 sm:h-9 flex items-center">Voice Frequency (Phone)</label>
                          <input
                           placeholder="Contact Protocol"
                           value={formData.clientPhone}
                           onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                           className="w-full px-4 sm:px-8 py-2 sm:py-5 bg-slate-950/50 border border-white/10 rounded-xl sm:rounded-[24px] text-white text-xs sm:text-base font-bold outline-none focus:border-primary/50 transition-all shadow-inner"
                         />
                        </div>
                     </div>

                    <div className="space-y-1 sm:space-y-4">
                       <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.4em] ml-2">Geographical Presence (Address)</label>
                       <textarea
                        placeholder="Physical Logistics Node"
                        rows={2}
                        value={formData.clientAddress}
                        onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                        className="w-full px-4 sm:px-8 py-2 sm:py-5 bg-slate-950/50 border border-white/10 rounded-xl sm:rounded-[24px] text-white text-xs sm:text-base font-bold outline-none focus:border-primary/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 sm:h-9 flex items-center">City</label>
                          <input
                           placeholder="City"
                           value={formData.clientCity}
                           onChange={(e) => setFormData({ ...formData, clientCity: e.target.value })}
                           className="w-full px-3 sm:px-6 py-2 sm:py-4 bg-slate-950/50 border border-white/10 rounded-xl sm:rounded-[24px] text-white font-bold outline-none focus:border-primary/30 transition-all text-[10px] sm:text-sm"
                         />
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 sm:h-9 flex items-center">State</label>
                          <input
                           placeholder="State"
                           value={formData.clientState}
                           onChange={(e) => setFormData({ ...formData, clientState: e.target.value })}
                           className="w-full px-3 sm:px-6 py-2 sm:py-4 bg-slate-950/50 border border-white/10 rounded-xl sm:rounded-[24px] text-white font-bold outline-none focus:border-primary/30 transition-all text-[10px] sm:text-sm"
                         />
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 sm:h-9 flex items-center">Zip</label>
                          <input
                           placeholder="Pincode"
                           value={formData.clientZip}
                           onChange={(e) => setFormData({ ...formData, clientZip: e.target.value })}
                           className="w-full px-3 sm:px-6 py-2 sm:py-4 bg-slate-950/50 border border-white/10 rounded-xl sm:rounded-[24px] text-white font-bold outline-none focus:border-primary/30 transition-all text-[10px] sm:text-sm"
                         />
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 sm:h-9 flex items-center">Country</label>
                          <input
                           placeholder="Country"
                           value={formData.clientCountry}
                           onChange={(e) => setFormData({ ...formData, clientCountry: e.target.value })}
                           className="w-full px-3 sm:px-6 py-2 sm:py-4 bg-slate-950/50 border border-white/10 rounded-xl sm:rounded-[24px] text-white font-bold outline-none focus:border-primary/30 transition-all text-[10px] sm:text-sm"
                         />
                        </div>
                    </div>

                     <div className="space-y-4 pt-4 sm:pt-10 border-t border-white/5">
                        <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.4em] ml-2">Fiscal Registry (GSTIN)</label>
                         <div className="relative group">
                           <input
                            placeholder="RECIPIENT FISCAL ID"
                            value={formData.clientGst}
                            onChange={(e) => setFormData({ ...formData, clientGst: e.target.value.toUpperCase() })}
                            className="w-full px-6 sm:px-10 py-3 sm:py-7 bg-slate-950/40 border border-primary/20 rounded-2xl sm:rounded-[32px] text-white font-mono font-black italic tracking-[0.1em] sm:tracking-[0.3em] outline-none focus:border-primary/60 transition-all uppercase shadow-2xl shadow-primary/10 text-sm sm:text-xl backdrop-blur-md"
                          />
                          <div className="absolute inset-x-0 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                         </div>
                     </div>
                  </div>
                </div>

                 {/* LOGISTICS SECTION */}
                <div className="space-y-6 sm:space-y-12">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="h-[1px] w-8 sm:w-12 bg-purple-500/40" />
                    <h3 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] italic">Logistics Matrix</h3>
                  </div>
                  <div className="space-y-4 sm:space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <label className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 sm:h-9 flex items-center">Maturity Threshold (Due Date)</label>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full px-4 sm:px-8 py-2 sm:py-5 bg-slate-950/50 border border-white/10 rounded-xl sm:rounded-[24px] text-white font-bold outline-none focus:border-purple-500/50 transition-all font-mono text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <label className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 sm:h-9 flex items-center">Settlement Framework</label>
                        <select
                          value={formData.paymentTerms}
                          onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                          className="w-full px-4 sm:px-8 py-3 sm:py-5 bg-slate-950/50 border border-white/10 rounded-xl sm:rounded-[24px] text-white font-bold outline-none focus:border-purple-500/50 transition-all shadow-inner text-sm"
                        >
                          <option value="Net 30" className="bg-slate-900">NET_30_CYCLE</option>
                          <option value="Net 15" className="bg-slate-900">NET_15_CYCLE</option>
                          <option value="Due on Receipt" className="bg-slate-900">IMMEDIATE_SETTLEMENT</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-4">
                      <label className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.4em] ml-2">Fiscal Levy Percentage (GST)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.taxRate}
                          onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                          className="w-full px-4 sm:px-8 py-3 sm:py-5 bg-slate-950/50 border border-white/10 rounded-xl sm:rounded-[24px] text-lg sm:text-2xl font-black text-white italic focus:outline-none focus:border-purple-500/50 transition-all pr-12 sm:pr-16 font-mono"
                        />
                        <span className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-slate-600 font-black text-sm sm:text-xl italic uppercase">%</span>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-4">
                      <label className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.4em] ml-2">Internal Metadata (Notes)</label>
                      <textarea
                        placeholder="Project Reference / Special Conditions"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 sm:px-8 py-2.5 sm:py-5 bg-slate-950/50 border border-white/10 rounded-[20px] sm:rounded-[28px] text-white text-xs font-bold outline-none focus:border-white/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* RECEIPT CAPTURE SECTION */}
                <div className="space-y-10 group lg:col-span-2 pt-10 border-t border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="h-[1px] w-12 bg-amber-500/40" />
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic text-amber-500">Auto Mind Intelligence Sync</h3>
                  </div>
                  
                  <div className="bg-slate-950/50 border-2 border-dashed border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center gap-6 transition-all hover:border-amber-500/30 group-hover:bg-amber-500/[0.02]">
                    {receiptImage ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image 
                          src={receiptImage} 
                          alt="Receipt Preview" 
                          width={800} 
                          height={600} 
                          unoptimized
                          className="w-full h-full object-contain" 
                        />
                        <button 
                          onClick={() => setReceiptImage(null)}
                          className="absolute top-4 right-4 p-2 bg-slate-950/80 text-white rounded-full hover:bg-rose-500 transition-all"
                        >
                          <X size={20} />
                        </button>
                        {isScanning && (
                          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                             <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                             <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Scanning: {ocrProgress}%</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center border border-white/10 text-slate-700">
                           <Camera size={32} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Input Receipt Image</p>
                          <p className="text-[9px] text-slate-700 uppercase tracking-[0.3em] mt-1 italic">JPG, PNG for OCR Extraction</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 w-full">
                      <label className="flex-1 cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
                        <div className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                           <ImageIcon size={16} /> Select Photo
                        </div>
                      </label>
                      
                      {receiptImage && !isScanning && (
                        <button 
                          onClick={performOcr}
                          className="flex-1 py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500/20 transition-all"
                        >
                           <Scan size={16} /> Execute OCR
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* LINE ITEMS */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.25em] flex items-center gap-2">
                    <FileText size={14} /> Service Inventory
                  </h3>
                  <motion.button
                    onClick={() => setLineItems([...lineItems, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, amount: 0, taxable: true }])}
                    whileHover={{ scale: 1.05, x: 2 }}
                    className="px-6 py-3 bg-emerald-500/10 text-emerald-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                  >
                    + New Resource
                  </motion.button>
                </div>
                
                <div className="overflow-x-auto custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[500px] sm:min-w-0">
                    <thead className="bg-white/5">
                      <tr className="text-left">
                        <th className="px-4 sm:px-6 py-4 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-emerald-500/50">Description</th>
                        <th className="px-4 sm:px-6 py-4 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest w-16 sm:w-24 text-center">Qty</th>
                        <th className="px-4 sm:px-6 py-4 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 sm:w-40">Rate</th>
                        <th className="px-4 sm:px-6 py-4 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 sm:w-40 text-right">Yield</th>
                        <th className="px-4 w-12 sm:w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {lineItems.map((item, idx) => (
                        <tr key={item.id} className="group/row hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 sm:px-6 py-4">
                            <input
                              value={item.description}
                              onChange={(e) => {
                                const newItems = [...lineItems]
                                newItems[idx].description = e.target.value
                                setLineItems(newItems)
                              }}
                              className="w-full bg-transparent outline-none text-white font-bold text-xs sm:text-base border-b border-transparent focus:border-emerald-500/30 transition-all placeholder:text-slate-800"
                              placeholder="Service..."
                            />
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...lineItems]
                                newItems[idx].quantity = Math.max(0, parseFloat(e.target.value) || 0)
                                newItems[idx].amount = newItems[idx].quantity * newItems[idx].unitPrice
                                setLineItems(newItems)
                              }}
                              className="w-full bg-transparent outline-none text-white font-bold text-center text-sm sm:text-base"
                            />
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const newItems = [...lineItems]
                                newItems[idx].unitPrice = Math.max(0, parseFloat(e.target.value) || 0)
                                newItems[idx].amount = newItems[idx].quantity * newItems[idx].unitPrice
                                setLineItems(newItems)
                              }}
                              className="w-full bg-transparent outline-none text-white font-bold font-mono text-sm sm:text-base"
                            />
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-right">
                            <span className="text-white font-black font-mono tracking-tighter text-sm sm:text-base">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-right">
                            <button 
                              onClick={() => lineItems.length > 1 && setLineItems(lineItems.filter(i => i.id !== item.id))}
                              className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover/row:opacity-100 sm:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 sm:p-10 border-t border-white/10 bg-slate-950/80 backdrop-blur-md flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-12">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-12 w-full lg:w-auto">
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.5em]">Subtotal</p>
                  <p className="text-xl sm:text-4xl font-black text-white italic tracking-tighter font-mono leading-none">₹{calculateTotals().subtotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.5em]">Tax ({formData.taxRate}%)</p>
                  <p className="text-xl sm:text-4xl font-black text-primary italic tracking-tighter font-mono leading-none flex items-center"><span className="text-slate-500 text-xs sm:text-2xl mr-1 sm:mr-2">+</span>₹{calculateTotals().taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
                </div>
                <div className="space-y-1 sm:space-y-2 col-span-2 md:col-span-1 border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.5em]">Total Yield</p>
                  <p className="text-2xl sm:text-6xl font-black text-white tracking-tighter font-mono italic leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">₹{calculateTotals().total.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 sm:gap-10 w-full lg:w-auto">
                <div className="hidden lg:block w-[1px] h-16 bg-white/10" />
                <motion.button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.05, y: -5 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                  className={`px-6 sm:px-12 py-4 sm:py-6 premium-button rounded-2xl sm:rounded-[28px] shadow-2xl relative overflow-hidden group w-full ${isSubmitting ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4">
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                    <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em]">{isSubmitting ? 'Processing...' : 'Authorize Issuance'}</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
