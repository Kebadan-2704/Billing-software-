'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, IndianRupee, Tag, Calendar, FileText, Upload, CheckCircle2, AlertCircle, Loader2, Scan, Image as ImageIcon } from 'lucide-react'
import { Expense } from '@/lib/types'
import { createWorker } from 'tesseract.js'
import Image from 'next/image'

interface ExpenseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (expense: Partial<Expense>) => void
  initialData?: Expense | null
}

export default function ExpenseFormModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: ExpenseFormModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'General'
  })

  // EXTRACTION STATE
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionResult, setExtractionResult] = useState<any>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description || '',
        amount: initialData.amount || 0,
        date: initialData.date || new Date().toISOString().split('T')[0],
        category: initialData.category || 'General'
      })
    } else {
      setFormData({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: 'General'
      })
    }
    setExtractionResult(null)
    setReceiptImage(null)
    setOcrProgress(0)
    setShowConfirmation(false)
    setIsExtracting(false)
    setIsSubmitting(false)
  }, [initialData, isOpen])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setReceiptImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const performOcr = async () => {
    if (!receiptImage) return
    setIsExtracting(true)
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

      console.log('--- OCR RAW TEXT ---', text)
      const ocrLines = text.split('\n').filter(line => line.trim().length > 0)
      console.log('--- OCR LINES ---', ocrLines)
      
      const detectedItems: string[] = []
      let totalAmount = 0
      let pendingName = ''
      let isTableStarted = false
      let isTableFinished = false

      ocrLines.forEach((line, idx) => {
        const trimmedLine = line.trim()
        const upperLine = trimmedLine.toUpperCase()

        console.log(`Line ${idx}: "${trimmedLine}" (TableStarted: ${isTableStarted})`)

        // TRIGGER: Start of table
        if (!isTableStarted && (upperLine.includes('PRODUCT') || upperLine.includes('SERVICE') || upperLine.includes('DESCRIPTION') || upperLine.includes('NAME'))) {
          if (upperLine.includes('RATE') || upperLine.includes('PRICE') || upperLine.includes('AMOUNT')) {
            isTableStarted = true
            console.log(`  >>> TABLE STARTED <<<`)
            return
          }
        }

        // TRIGGER: End of table
        if (isTableStarted && !isTableFinished && (upperLine.startsWith('TOTAL') || upperLine.includes('SUBTOTAL') || upperLine.startsWith('GRAND'))) {
          // We don't return here because the total line itself might have the final amount
          isTableStarted = false
          isTableFinished = true
          console.log(`  >>> TABLE FINISHED <<<`)
        }

        // Skip metadata noise if we haven't reached the table yet or passed it
        const isMetadata = upperLine.includes('DATE') || 
                           upperLine.includes('SHIPPING') ||
                           upperLine.includes('VENDOR') ||
                           upperLine.includes('GSTIN') ||
                           upperLine.includes('CODE') ||
                           upperLine.includes('ADDRESS') ||
                           upperLine.includes('EMAIL') ||
                           upperLine.includes('PHONE') ||
                           upperLine.includes('HSN')

        if (isMetadata) {
          console.log(`  -> Skipped (Metadata/Noise)`)
          return
        }

        // Price regex: Require decimals for items to avoid capturing line numbers (1, 2, 3)
        // For total lines, we'll allow optional decimals if triggered by summary keywords
        const priceMatches = trimmedLine.match(/((\d{1,3}(?:[,\s]\d{3})*|\d+)(?:[\.,]\d{2}))/g)
        const summaryPriceMatches = trimmedLine.match(/((\d{1,3}(?:[,\s]\d{3})*|\d+)(?:[\.,]\d{2})?)/g)
        
        const isSummary = /^(TOTAL|SUBTOTAL|TOTA|TOTL|NET|BALANCE|GRAND|GST|TAX|VAT)/i.test(upperLine) || 
                          /(TOTAL AMOUNT|TOTAL VALUE|GRAND TOTAL|GROSS TOTAL)/i.test(upperLine)

        if (isSummary && summaryPriceMatches) {
          const mainPriceStr = summaryPriceMatches[summaryPriceMatches.length - 1]
          const price = parseFloat(mainPriceStr.replace(/,/g, '').replace(/\s/g, '').replace(',', '.'))
          if (/(TOTAL|TOTA|TOTL|NET|BALANCE|AMOUNT)/i.test(upperLine)) {
            totalAmount = Math.max(totalAmount, price)
            console.log(`  -> Summary Found: ${price}`)
          }
          return
        }

        if (isTableStarted && priceMatches && priceMatches.length > 0) {
          const mainPriceStr = priceMatches[priceMatches.length - 1]
          const price = parseFloat(mainPriceStr.replace(/,/g, '').replace(/\s/g, '').replace(',', '.'))
          console.log(`  -> Found Item Price: ${price}`)
          
          // Item row: Name is everything before the FIRST detected price
          const firstPriceStr = priceMatches[0]
          const firstPriceIdx = trimmedLine.indexOf(firstPriceStr)
          let name = trimmedLine.substring(0, firstPriceIdx).replace(/^[\d\s\.\|/-]+/, '').replace(/[^\w\s].*$/g, '').trim()
          
          console.log(`  -> Extracted Name: "${name}"`)

          if (name.length < 3 && pendingName) {
            name = pendingName
            pendingName = ''
            console.log(`  -> Using pendingName: "${name}"`)
          }

          if (name.length >= 3 && !/^\d+$/.test(name)) {
            detectedItems.push(`${name.toUpperCase()} - ₹${price.toLocaleString('en-IN')}`)
            console.log(`  -> Added to Items`)
            pendingName = ''
          }
        } else if (isTableStarted && !isSummary && trimmedLine.length > 3) {
          // No price, buffer as potential name component
          const potentialName = trimmedLine.replace(/^[\d\s\.\|/-]+/, '').trim()
          if (potentialName.length >= 3 && !/^\d+$/.test(potentialName) && !upperLine.includes('AMOUNT')) {
            pendingName = potentialName
            console.log(`  -> Buffered as pendingName: "${pendingName}"`)
          }
        }
      })

      const finalResult = {
        description: (detectedItems[0]?.split(' - ')[0] || 'Extracted Expense').toUpperCase(),
        amount: totalAmount || (detectedItems.length > 0 ? parseFloat(detectedItems[0].split('₹')[1].replace(/,/g, '')) : 0),
        category: 'General',
        items: detectedItems.length > 0 ? detectedItems : ['No items detected']
      }

      setExtractionResult(finalResult)
      setFormData({
        ...formData,
        description: finalResult.description,
        amount: finalResult.amount,
        category: finalResult.category
      })
      setIsExtracting(false)
      setShowConfirmation(true)
    } catch (err) {
      console.error("OCR Error:", err)
      setIsExtracting(false)
      alert("Failed to process receipt image.")
    }
  }

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
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[200] p-4 lg:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: 5 }}
            transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
            className="glass-card !bg-slate-900/60 border border-white/10 rounded-[40px] shadow-[0_0_100px_-20px_rgba(244,63,94,0.15)] max-w-2xl w-full overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.05] via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            {/* PROGRESS OVERLAY */}
            <AnimatePresence>
              {isExtracting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="relative mb-10">
                    <div className="absolute -inset-8 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
                    <Loader2 className="text-rose-500 animate-spin relative z-10" size={64} />
                  </div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Scanning <span className="text-rose-500">Resource</span> Data</h3>
                  <p className="text-slate-500 text-[10px] mt-4 uppercase tracking-[0.4em] font-black">Decrypting parameters: {ocrProgress}%</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-10 border-b border-white/10 flex justify-between items-center bg-slate-950/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10 transition-all">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                  {showConfirmation ? 'Audit' : initialData ? 'Sync' : 'Log'} <span className="text-rose-500">Expenditure</span>
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Operational Asset Allocation</p>
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
              {!showConfirmation ? (
                <>
                  {/* UPLOAD TRIGGER */}
                  <div 
                    className="group border-2 border-dashed border-white/5 rounded-[32px] p-8 text-center hover:border-rose-500/40 hover:bg-rose-500/[0.03] transition-all duration-500 cursor-default relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    {receiptImage ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-8">
                        <Image 
                          src={receiptImage} 
                          alt="Receipt Preview" 
                          width={600} 
                          height={400} 
                          unoptimized
                          className="w-full h-full object-contain" 
                        />
                        <button 
                          onClick={() => setReceiptImage(null)}
                          className="absolute top-4 right-4 p-2 bg-slate-950/80 text-white rounded-full hover:bg-rose-500 transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto text-slate-700 group-hover:text-rose-500 mb-8 transition-all duration-500 group-hover:-translate-y-2" size={48} />
                        <h4 className="text-2xl font-black text-white mb-3 uppercase italic leading-none transition-all">Auto Mind Resource Extraction</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold leading-relaxed max-w-sm mx-auto mb-8">Upload purchase bills, sub-contracts, or utility invoices for Enterprise AI Synching</p>
                      </>
                    )}

                    <div className="flex gap-4 w-full relative z-10">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                      >
                         <ImageIcon size={16} /> {receiptImage ? 'Change Photo' : 'Select Photo'}
                      </button>
                      
                      {receiptImage && (
                        <button 
                          onClick={performOcr}
                          className="flex-1 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/20 transition-all"
                        >
                           <Scan size={16} /> Execute OCR
                        </button>
                      )}
                    </div>

                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="h-[1px] flex-1 bg-white/5" />
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.6em] leading-none">Enterprise Expense Registry</span>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>

                  <div className="space-y-6">
                    <div className="relative group">
                      <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-rose-500 transition-colors" size={20} />
                        <input
                         placeholder="Description / Asset Purpose"
                         value={formData.description}
                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                         className="w-full pl-16 pr-8 py-5 bg-slate-950/40 border border-white/10 rounded-[24px] text-white font-black outline-none focus:border-rose-500/50 transition-all text-lg uppercase placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="relative group">
                        <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-rose-500 transition-colors" size={20} />
                        <input
                          type="number"
                          placeholder="Amount (₹)"
                          value={formData.amount || ''}
                          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-16 pr-8 py-5 bg-slate-950/40 border border-white/10 rounded-[24px] text-rose-500 font-mono font-black outline-none focus:border-rose-500/50 transition-all text-2xl tracking-tighter placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                        />
                      </div>
                      <div className="relative group">
                         <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-rose-500 transition-colors" size={20} />
                         <select
                           value={formData.category}
                           onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                           className="w-full pl-16 pr-8 py-6 bg-slate-950/40 border border-white/10 rounded-[24px] text-white font-black outline-none focus:border-rose-500/50 transition-all text-[11px] uppercase tracking-[0.1em] appearance-none shadow-inner"
                         >
                           <option value="General" className="bg-slate-900">General</option>
                           <option value="Utilities" className="bg-slate-900">Utilities</option>
                           <option value="Infrastructure" className="bg-slate-900">Infrastructure</option>
                           <option value="Marketing" className="bg-slate-900">Marketing</option>
                           <option value="Salaries" className="bg-slate-900">Salaries</option>
                           <option value="Project Labor" className="bg-slate-900">Project Labor</option>
                         </select>
                      </div>
                    </div>

                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-rose-500 transition-colors" size={20} />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-16 pr-8 py-5 bg-slate-950/40 border border-white/10 rounded-[24px] text-white font-black outline-none focus:border-rose-500/50 transition-all uppercase placeholder:text-slate-700 placeholder:font-bold shadow-inner"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-6 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px]">
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={36} />
                    <div>
                      <h4 className="text-emerald-500 font-black uppercase text-xs tracking-[0.3em]">Validation Complete</h4>
                      <p className="text-slate-500 text-[10px] mt-2 uppercase font-black tracking-widest leading-none">Confirm extracted parameters for final commitment.</p>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] p-10 rounded-[40px] border border-white/10 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[60px]" />
                    
                    {receiptImage && (
                      <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 mb-8 group relative">
                        <Image 
                          src={receiptImage} 
                          alt="Validation Preview" 
                          width={600} 
                          height={400} 
                          unoptimized
                          className="w-full h-full object-contain" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                      </div>
                    )}

                    <div className="space-y-6 relative z-10">
                      <div className="flex flex-col md:flex-row md:justify-between items-start gap-6">
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] block mb-3">Target Description</span>
                          <p className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight break-words">{extractionResult.description}</p>
                        </div>
                        <div className="md:text-right shrink-0">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] block mb-3">Asset Value</span>
                          <p className="text-4xl font-black text-rose-500 tracking-tighter leading-none">₹{extractionResult.amount.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-white/5">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] block mb-6">Component Breakdown</span>
                         <div className="space-y-3">
                           {extractionResult.items?.map((item: string, i: number) => (
                             <div key={i} className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-wider bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-rose-500/20 transition-all group">
                               <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse group-hover:scale-125 transition-transform" />
                               <span className="flex-1">{item}</span>
                               <span className="text-slate-600 italic">VERIFIED</span>
                             </div>
                           ))}
                         </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-rose-500/[0.03] rounded-2xl border border-rose-500/10 relative z-10">
                       <Tag size={18} className="text-rose-500" />
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Division:</span>
                       <span className="px-4 py-2 bg-rose-500/10 rounded-full text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-500/20">{extractionResult.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-amber-500 p-6 bg-amber-500/5 rounded-3xl border border-amber-500/20">
                    <AlertCircle size={24} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">Cross-reference financial instruments before final ledger commitment.</p>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-6 pt-6">
                {showConfirmation ? (
                  <>
                    <button onClick={() => setShowConfirmation(false)} className="flex-1 px-8 py-5 bg-white/5 text-slate-500 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] border border-white/10 hover:bg-white/10 transition-all">Revise</button>
                    <button 
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="flex-1 px-8 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-[24px] font-black shadow-2xl shadow-emerald-500/30 uppercase tracking-[0.2em] text-[11px] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                      Commit Entry
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={onClose} className="flex-1 px-8 py-5 bg-white/5 text-slate-500 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] border border-white/10 hover:bg-white/10 transition-all">Cancel</button>
                    <button 
                      onClick={handleSave}
                      disabled={isSubmitting || !formData.description || !formData.amount}
                      className={`flex-1 px-8 py-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-2xl font-black shadow-2xl shadow-rose-500/30 uppercase tracking-[0.2em] text-[11px] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 ${isSubmitting || !formData.description || !formData.amount ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                      {isSubmitting ? 'Recording...' : 'Execute Entry'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
