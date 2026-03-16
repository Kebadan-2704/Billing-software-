'use client'

import { motion } from 'framer-motion'
import React, { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useAuth } from '@/lib/auth-context'
import { Download, Mail, FileText, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { InvoiceItem, Client } from '@/lib/types'

// Animated Counter Component
function AnimatedCounter({ value, prefix = '₹' }: { value: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1500
    const increment = end / (duration / 50)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 50)

    return () => clearInterval(timer)
  }, [value])

  return <span>{prefix}{displayValue.toLocaleString('en-IN')}</span>
}

interface ProfessionalInvoiceProps {
  invoiceNumber?: string
  issueDate?: string
  dueDate?: string
  client?: Client
  items?: InvoiceItem[]
}

export default function ProfessionalInvoiceComponent(props: ProfessionalInvoiceProps) {
  const { currentCompany } = useAuth()
  const invoiceRef = useRef<HTMLDivElement>(null)

  // Sample invoice data
  const invoiceData = {
    invoiceNumber: props.invoiceNumber || `INV-${new Date().getFullYear()}-001`,
    issueDate: props.issueDate || new Date().toLocaleDateString('en-IN'),
    dueDate: props.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
    client: props.client || {
      id: '1',
      name: 'Sample Client Company',
      email: 'contact@client.com',
      phone: '+91-9876543210',
      address: '456 Business Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
    },
    items: props.items || [
      {
        id: '1',
        description: 'Professional Consulting Services',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000,
        taxable: true,
      },
      {
        id: '2',
        description: 'Implementation and Deployment',
        quantity: 2,
        unitPrice: 75000,
        amount: 150000,
        taxable: true,
      },
      {
        id: '3',
        description: 'Quality Assurance and Testing',
        quantity: 1,
        unitPrice: 30000,
        amount: 30000,
        taxable: true,
      },
    ],
  }

  // Calculate totals
  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0)
  const taxRate = 0.18 // 18% GST
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  const downloadPDF = async () => {
    if (!invoiceRef.current) return

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`${invoiceData.invoiceNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  } as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 opacity-10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 opacity-10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
        variants={containerVariants}
      >
        {/* Top Status Bar */}
        <motion.div
          variants={itemVariants}
          className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FileText size={32} className="text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Invoice Generation</h2>
                <p className="text-blue-100">Professional billing document</p>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white bg-opacity-20 rounded-full p-3"
            >
              <CheckCircle size={24} className="text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex gap-4 mb-8 justify-end flex-wrap">
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadPDF}
            className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold shadow-xl hover:shadow-2xl transition-all group"
          >
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.5 }}
              className="group-hover:scale-125 transition-transform"
            >
              <Download size={22} />
            </motion.div>
            <span>Download PDF</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: '0 20px 40px rgba(34, 197, 94, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-lg font-semibold shadow-xl hover:shadow-2xl transition-all group"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
              className="group-hover:scale-125 transition-transform"
            >
              <Mail size={22} />
            </motion.div>
            <span>Send Email</span>
          </motion.button>
        </motion.div>

        {/* Invoice */}
        <motion.div
          ref={invoiceRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-200"
        >
          {/* Header */}
          <motion.div 
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-12 relative overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600 opacity-5 rounded-full -ml-20 -mb-20"></div>

            <motion.div 
              className="flex justify-between items-start mb-8 relative z-10"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="flex-1">
                {currentCompany?.logo ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-40 h-24 mb-6 bg-white rounded-lg p-3 shadow-lg"
                  >
                    <Image
                      src={currentCompany.logo}
                      alt={currentCompany.name}
                      fill
                      className="object-contain"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-40 h-24 mb-6 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg"
                  >
                    <span className="text-2xl font-bold text-white">LOGO</span>
                  </motion.div>
                )}
                <motion.h1 
                  variants={itemVariants}
                  className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
                >
                  {currentCompany?.name}
                </motion.h1>
                <motion.p 
                  variants={itemVariants}
                  className="text-blue-200 text-sm mt-2 font-light tracking-wide"
                >
                  {currentCompany?.description}
                </motion.p>
              </motion.div>
              <motion.div 
                variants={itemVariants}
                className="text-right text-sm bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 shadow-lg"
              >
                <p className="text-slate-900 text-xs font-bold uppercase tracking-widest mb-2">Tax Registration</p>
                <p className="text-xl font-black text-slate-900">{currentCompany?.gstNumber}</p>
              </motion.div>
            </motion.div>

            {/* Company Contact Info */}
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-2 gap-8 text-sm border-t border-indigo-400 border-opacity-30 pt-6 relative z-10"
            >
              <motion.div variants={itemVariants} className="group">
                <p className="text-indigo-300 text-xs uppercase tracking-widest font-bold mb-2 group-hover:text-white transition-colors">📧 Email</p>
                <p className="text-white font-semibold">{currentCompany?.email}</p>
              </motion.div>
              <motion.div variants={itemVariants} className="group">
                <p className="text-indigo-300 text-xs uppercase tracking-widest font-bold mb-2 group-hover:text-white transition-colors">📞 Phone</p>
                <p className="text-white font-semibold">{currentCompany?.phone}</p>
              </motion.div>
              <motion.div variants={itemVariants} className="group">
                <p className="text-indigo-300 text-xs uppercase tracking-widest font-bold mb-2 group-hover:text-white transition-colors">📍 Address</p>
                <p className="text-white font-semibold">{currentCompany?.address}</p>
              </motion.div>
              <motion.div variants={itemVariants} className="group">
                <p className="text-indigo-300 text-xs uppercase tracking-widest font-bold mb-2 group-hover:text-white transition-colors">🏙️ Location</p>
                <p className="text-white font-semibold">{currentCompany?.city}, {currentCompany?.state}</p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Invoice Details */}
          <motion.div className="p-12 space-y-8">
            {/* Invoice Number and Dates */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 bg-gradient-to-r from-slate-50 to-blue-50 p-8 rounded-xl border-2 border-indigo-200 shadow-md"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="border-l-4 border-indigo-600 pl-4 hover:pl-6 transition-all"
              >
                <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-2">🔢 Invoice Number</p>
                <p className="text-2xl font-black text-slate-900 font-mono">{invoiceData.invoiceNumber}</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="border-l-4 border-blue-600 pl-4 hover:pl-6 transition-all"
              >
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">📅 Issue Date</p>
                <p className="text-2xl font-black text-slate-900">{invoiceData.issueDate}</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="border-l-4 border-red-600 pl-4 hover:pl-6 transition-all"
              >
                <p className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2">⏰ Due Date</p>
                <p className="text-2xl font-black text-slate-900">{invoiceData.dueDate}</p>
              </motion.div>
            </motion.div>

            {/* Bill From and Bill To */}
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-2 gap-8"
            >
              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border-2 border-indigo-300 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏢</span>
                  <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Bill From</h3>
                </div>
                <div className="text-sm text-slate-700 space-y-2 border-t border-indigo-300 pt-4">
                  <p className="font-bold text-lg text-slate-900">{currentCompany?.name}</p>
                  <p className="text-slate-600">{currentCompany?.address}</p>
                  <p className="text-slate-600">{currentCompany?.city}, {currentCompany?.state}</p>
                  <p className="text-slate-600 break-all">{currentCompany?.email}</p>
                  <p className="text-slate-600">{currentCompany?.phone}</p>
                </div>
              </motion.div>
              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-300 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">👤</span>
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Bill To</h3>
                </div>
                <div className="text-sm text-slate-700 space-y-2 border-t border-blue-300 pt-4">
                  <p className="font-bold text-lg text-slate-900">{invoiceData.client.name}</p>
                  <p className="text-slate-600">{invoiceData.client.address}</p>
                  <p className="text-slate-600">{invoiceData.client.city}, {invoiceData.client.state}</p>
                  <p className="text-slate-600 break-all">{invoiceData.client.email}</p>
                  <p className="text-slate-600">{invoiceData.client.phone}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Items Table */}
            <motion.div className="space-y-4">
              <motion.h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Invoice Items
              </motion.h3>
              <motion.div className="overflow-hidden rounded-lg shadow-lg border-2 border-indigo-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                      <th className="py-5 px-6 text-left font-semibold text-sm">Description</th>
                      <th className="py-5 px-6 text-center font-semibold text-sm">Quantity</th>
                      <th className="py-5 px-6 text-right font-semibold text-sm">Unit Price</th>
                      <th className="py-5 px-6 text-right font-semibold text-sm">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100">
                    {invoiceData.items.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', x: 5 }}
                        className="hover:shadow-md transition-all group"
                      >
                        <td className="py-5 px-6 text-slate-900 font-medium text-sm group-hover:text-indigo-600 transition-colors">{item.description}</td>
                        <td className="py-5 px-6 text-center text-slate-700 text-sm font-semibold">{item.quantity}</td>
                        <td className="py-5 px-6 text-right text-slate-700 text-sm font-mono group-hover:text-indigo-600 transition-colors">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-5 px-6 text-right text-slate-900 font-bold text-sm font-mono group-hover:text-indigo-700 transition-colors">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </motion.div>

            {/* Totals Section */}
            <motion.div className="flex justify-end">
              <motion.div className="w-full max-w-md">
                <motion.div 
                  className="space-y-3 p-8 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl border-2 border-indigo-300 shadow-xl"
                >
                  <motion.div 
                    className="flex justify-between text-slate-700 text-sm group hover:bg-white hover:p-2 transition-all rounded"
                  >
                    <span className="font-semibold">Subtotal:</span>
                    <motion.span 
                      className="font-mono font-bold text-slate-900"
                      key={subtotal}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      <AnimatedCounter value={subtotal} />
                    </motion.span>
                  </motion.div>
                  <motion.div 
                    className="flex justify-between text-slate-700 text-sm border-t-2 border-indigo-300 pt-3 group hover:bg-yellow-50 hover:p-2 transition-all rounded"
                  >
                    <span className="font-semibold">GST at 18%:</span>
                    <motion.span 
                      className="font-mono font-bold text-amber-600"
                      key={taxAmount}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      <AnimatedCounter value={taxAmount} />
                    </motion.span>
                  </motion.div>
                  <motion.div 
                    className="flex justify-between text-slate-900 text-lg font-black border-t-4 border-indigo-600 pt-4 bg-gradient-to-r from-indigo-100 to-blue-100 p-4 rounded-lg"
                  >
                    <span>TOTAL AMOUNT:</span>
                    <motion.span 
                      className="font-mono text-indigo-700 text-2xl"
                      key={total}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                    >
                      <AnimatedCounter value={total} />
                    </motion.span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div className="border-t-4 border-indigo-300 pt-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚖️</span>
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Payment Terms & Conditions</h4>
              </div>
              <motion.ul 
                className="text-xs text-slate-700 space-y-3 list-disc list-inside"
              >
                <motion.li className="hover:text-indigo-600 transition-colors">Payment due within 30 days from invoice date</motion.li>
                <motion.li className="hover:text-indigo-600 transition-colors">Late payment penalties: 1.5% per month on outstanding amount</motion.li>
                <motion.li className="hover:text-indigo-600 transition-colors">GST calculated as per Indian Government regulations (18%)</motion.li>
                <motion.li className="hover:text-indigo-600 transition-colors">All disputes subject to jurisdiction of courts in India</motion.li>
                <motion.li className="hover:text-indigo-600 transition-colors">Please include invoice number with payment</motion.li>
              </motion.ul>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="bg-gradient-to-r from-slate-900 to-slate-800 border-t-4 border-indigo-600 p-8 text-center text-xs text-slate-300 relative overflow-hidden"
          >
            {/* Decorative footer elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600 opacity-5 rounded-full -ml-16 -mt-16"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600 opacity-5 rounded-full -mr-16 -mb-16"></div>

            <motion.p 
              className="font-semibold mb-3 text-white relative z-10"
            >
              {currentCompany?.name} | GST: {currentCompany?.gstNumber}
            </motion.p>
            <motion.p className="text-slate-400 relative z-10">
              This is an electronically generated document and does not require signature.
            </motion.p>
            <motion.p className="mt-2 text-slate-400 relative z-10">
              For support: {currentCompany?.email} | {currentCompany?.phone}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
