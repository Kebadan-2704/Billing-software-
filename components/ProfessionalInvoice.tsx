'use client'

import { motion } from 'framer-motion'
import { Company } from '@/lib/auth-context'
import { Download, Printer, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useRef } from 'react'

interface ProfessionalInvoiceProps {
  company: Company
}

export default function ProfessionalInvoice({ company }: ProfessionalInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  const invoiceData = {
    invoiceNumber: 'INV-2026-001',
    invoiceDate: 'March 15, 2026',
    dueDate: 'April 15, 2026',
    items: [
      { description: 'Professional Services - Consulting', quantity: 10, rate: 150000, amount: 1500000 },
      { description: 'Project Management & Oversight', quantity: 5, rate: 200000, amount: 1000000 },
      { description: 'Infrastructure Development', quantity: 20, rate: 85000, amount: 1700000 },
    ],
    tax: 0.18,
  }

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = subtotal * invoiceData.tax
  const total = subtotal + taxAmount

  const handlePrint = () => {
    if (invoiceRef.current) {
      window.print()
    }
  }

  const handlePdfExport = async () => {
    if (invoiceRef.current) {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 277)
      pdf.save(`${company.name}-Invoice-${invoiceData.invoiceNumber}.pdf`)
    }
  }

  const handleOdfExport = () => {
    // Create a simple ODF document structure
    const odfContent = `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                 xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
                 xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                 office:version="1.2">
  <office:body>
    <office:text>
      <text:p><text:h text:outline-level="1">${company.name}</text:h></text:p>
      <text:p>Invoice Number: ${invoiceData.invoiceNumber}</text:p>
      <text:p>Invoice Date: ${invoiceData.invoiceDate}</text:p>
      <text:p>Due Date: ${invoiceData.dueDate}</text:p>
      <text:p></text:p>
      <text:p><text:h text:outline-level="2">Invoice Items</text:h></text:p>
      <table:table table:name="InvoiceTable">
        <table:table-column/>
        <table:table-column/>
        <table:table-column/>
        <table:table-column/>
        <table:table-row>
          <table:table-cell><text:p>Description</text:p></table:table-cell>
          <table:table-cell><text:p>Quantity</text:p></table:table-cell>
          <table:table-cell><text:p>Rate</text:p></table:table-cell>
          <table:table-cell><text:p>Amount</text:p></table:table-cell>
        </table:table-row>
        ${invoiceData.items.map(item => `
        <table:table-row>
          <table:table-cell><text:p>${item.description}</text:p></table:table-cell>
          <table:table-cell><text:p>${item.quantity}</text:p></table:table-cell>
          <table:table-cell><text:p>$${item.rate.toLocaleString()}</text:p></table:table-cell>
          <table:table-cell><text:p>$${item.amount.toLocaleString()}</text:p></table:table-cell>
        </table:table-row>
        `).join('')}
        <table:table-row>
          <table:table-cell><text:p></text:p></table:table-cell>
          <table:table-cell><text:p></text:p></table:table-cell>
          <table:table-cell><text:p>Subtotal:</text:p></table:table-cell>
          <table:table-cell><text:p>$${subtotal.toLocaleString()}</text:p></table:table-cell>
        </table:table-row>
        <table:table-row>
          <table:table-cell><text:p></text:p></table:table-cell>
          <table:table-cell><text:p></text:p></table:table-cell>
          <table:table-cell><text:p>Tax (18%):</text:p></table:table-cell>
          <table:table-cell><text:p>$${taxAmount.toLocaleString()}</text:p></table:table-cell>
        </table:table-row>
        <table:table-row>
          <table:table-cell><text:p></text:p></table:table-cell>
          <table:table-cell><text:p></text:p></table:table-cell>
          <table:table-cell><text:p><text:h text:outline-level="3">Total:</text:h></text:p></table:table-cell>
          <table:table-cell><text:p><text:h text:outline-level="3">$${total.toLocaleString()}</text:h></text:p></table:table-cell>
        </table:table-row>
      </table:table>
      <text:p></text:p>
      <text:p>Thank you for your business!</text:p>
    </office:text>
  </office:body>
</office:document>`

    const blob = new Blob([odfContent], { type: 'application/vnd.oasis.opendocument.text' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${company.name}-Invoice-${invoiceData.invoiceNumber}.odt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Control Buttons */}
      <motion.div
        className="flex gap-4 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={handlePrint}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
        >
          <Printer size={20} />
          Print Invoice
        </motion.button>

        <motion.button
          onClick={handlePdfExport}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold shadow-md"
        >
          <Download size={20} />
          Export as PDF
        </motion.button>

        <motion.button
          onClick={handleOdfExport}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-md"
        >
          <FileText size={20} />
          Export as ODF
        </motion.button>
      </motion.div>

      {/* Invoice Document */}
      <motion.div
        ref={invoiceRef}
        className="bg-white rounded-2xl shadow-2xl p-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Header */}
        <div className="mb-8 pb-8 border-b-2 border-gray-300">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{company.icon} {company.name}</h1>
              <p className="text-gray-600">{company.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Invoice</p>
              <p className="text-2xl font-bold text-gray-900">{invoiceData.invoiceNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-sm text-gray-600 mb-1">Invoice Date</p>
              <p className="font-semibold text-gray-900">{invoiceData.invoiceDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Due Date</p>
              <p className="font-semibold text-gray-900 text-red-600">{invoiceData.dueDate}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left py-4 px-4 font-bold text-gray-900">Description</th>
                <th className="text-right py-4 px-4 font-bold text-gray-900">Quantity</th>
                <th className="text-right py-4 px-4 font-bold text-gray-900">Rate</th>
                <th className="text-right py-4 px-4 font-bold text-gray-900">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900">{item.description}</td>
                  <td className="text-right py-4 px-4 text-gray-900">{item.quantity}</td>
                  <td className="text-right py-4 px-4 text-gray-900">${item.rate.toLocaleString()}</td>
                  <td className="text-right py-4 px-4 text-gray-900 font-semibold">${item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-sm">
            <div className="flex justify-between py-3 border-b border-gray-300">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-semibold text-gray-900">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b-2 border-gray-300">
              <span className="text-gray-700">Tax (18%)</span>
              <span className="font-semibold text-gray-900">${taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 rounded-lg mt-4">
              <span className="text-lg font-bold">Total Due</span>
              <span className="text-2xl font-bold">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>Thank you for your business!</p>
          <p className="mt-2">For inquiries, please contact: info@mdconstruction.com</p>
          <p className="mt-4 text-xs text-gray-500">© 2026 {company.name}. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .motion-div {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
