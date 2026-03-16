'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Download, TrendingUp, DollarSign, FolderOpen, AlertCircle, Settings, FileText, LogOut } from 'lucide-react'
import Image from 'next/image'

interface MonthlyStatement {
  month: string
  projects: number
  received: number
  pending: number
  total: number
}

export default function ProfessionalDashboard() {
  const { currentCompany, logout } = useAuth()
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months'>('6months')

  // Sample financial data for 6 months
  const monthlyStatements: MonthlyStatement[] = [
    { month: 'September 2025', projects: 3, received: 450000, pending: 180000, total: 630000 },
    { month: 'October 2025', projects: 4, received: 680000, pending: 250000, total: 930000 },
    { month: 'November 2025', projects: 5, received: 920000, pending: 320000, total: 1240000 },
    { month: 'December 2025', projects: 6, received: 1200000, pending: 480000, total: 1680000 },
    { month: 'January 2026', projects: 7, received: 1450000, pending: 580000, total: 2030000 },
    { month: 'February 2026', projects: 8, received: 1680000, pending: 620000, total: 2300000 },
  ]

  const displayedStatements = selectedPeriod === '3months' 
    ? monthlyStatements.slice(-3) 
    : monthlyStatements

  const totalReceivedAmount = displayedStatements.reduce((sum, s) => sum + s.received, 0)
  const totalPendingAmount = displayedStatements.reduce((sum, s) => sum + s.pending, 0)
  const totalProjects = displayedStatements.reduce((sum, s) => sum + s.projects, 0)
  const totalAmount = totalReceivedAmount + totalPendingAmount

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const downloadStatement = () => {
    const csvContent = [
      [currentCompany?.name, ''],
      ['GST Number:', currentCompany?.gstNumber],
      ['Statement Period:', selectedPeriod === '3months' ? 'Last 3 Months' : 'Last 6 Months'],
      ['', ''],
      ['Month', 'Projects', 'Amount Received', 'Amount Pending', 'Total Amount'],
      ...displayedStatements.map(s => [
        s.month,
        s.projects.toString(),
        `₹${s.received.toLocaleString('en-IN')}`,
        `₹${s.pending.toLocaleString('en-IN')}`,
        `₹${s.total.toLocaleString('en-IN')}`,
      ]),
      ['', ''],
      ['TOTAL', totalProjects.toString(), `₹${totalReceivedAmount.toLocaleString('en-IN')}`, `₹${totalPendingAmount.toLocaleString('en-IN')}`, `₹${totalAmount.toLocaleString('en-IN')}`],
      ['', ''],
      [`Generated on: ${new Date().toLocaleDateString('en-IN')}`],
    ]

    const csv = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `financial-statement-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const kpiCards = [
    {
      title: 'Total Projects',
      value: totalProjects.toString(),
      icon: FolderOpen,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Amount Received',
      value: formatAmount(totalReceivedAmount),
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Amount Pending',
      value: formatAmount(totalPendingAmount),
      icon: AlertCircle,
      color: 'from-orange-600 to-orange-700',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Total Amount',
      value: formatAmount(totalAmount),
      icon: TrendingUp,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 shadow-xl"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-4">
                {currentCompany?.logo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-16 h-16 bg-white rounded-lg p-2"
                  >
                    <Image
                      src={currentCompany.logo}
                      alt={currentCompany.name}
                      fill
                      className="object-contain"
                    />
                  </motion.div>
                )}
                <div>
                  <h1 className="text-4xl font-bold mb-2">{currentCompany?.name}</h1>
                  <p className="text-gray-300 text-sm">{currentCompany?.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">GST Number</p>
                  <p className="font-mono font-semibold text-yellow-300 mt-1">{currentCompany?.gstNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Email</p>
                  <p className="text-gray-200 mt-1">{currentCompany?.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Phone</p>
                  <p className="text-gray-200 mt-1">{currentCompany?.phone}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Location</p>
                  <p className="text-gray-200 mt-1">{currentCompany?.city}, {currentCompany?.state}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/invoice')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                <FileText size={18} />
                Create Invoice
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/settings')}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                <Settings size={18} />
                Settings
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  logout()
                  router.push('/company-selection')
                }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                <LogOut size={18} />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          {kpiCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`${card.bgColor} rounded-xl p-6 shadow-lg border border-gray-200`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600">{card.title}</h3>
                  <div className={`bg-gradient-to-br ${card.color} p-3 rounded-lg text-white`}>
                    <Icon size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Financial Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Financial Statement</h2>
              <p className="text-sm text-gray-600 mt-1">Comprehensive monthly financial breakdown</p>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as '3months' | '6months')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadStatement}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Download size={18} />
                Download
              </motion.button>
            </div>
          </div>

          {/* Statement Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Month</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">Projects</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700">Amount Received</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700">Amount Pending</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {displayedStatements.map((statement, index) => (
                  <motion.tr
                    key={statement.month}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-900 font-medium">{statement.month}</td>
                    <td className="py-4 px-4 text-center text-gray-700">{statement.projects}</td>
                    <td className="py-4 px-4 text-right text-green-600 font-semibold">{formatAmount(statement.received)}</td>
                    <td className="py-4 px-4 text-right text-orange-600 font-semibold">{formatAmount(statement.pending)}</td>
                    <td className="py-4 px-4 text-right text-purple-600 font-bold">{formatAmount(statement.total)}</td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="py-4 px-4 font-bold text-gray-900">TOTAL</td>
                  <td className="py-4 px-4 text-center font-bold text-gray-900">{totalProjects}</td>
                  <td className="py-4 px-4 text-right font-bold text-green-600">{formatAmount(totalReceivedAmount)}</td>
                  <td className="py-4 px-4 text-right font-bold text-orange-600">{formatAmount(totalPendingAmount)}</td>
                  <td className="py-4 px-4 text-right font-bold text-purple-600 text-lg">{formatAmount(totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
            <p className="mb-2">
              <span className="font-semibold">Generated:</span> {new Date().toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-500">
              This financial statement is generated for internal records and GST compliance purposes.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
