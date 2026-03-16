'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, COMPANIES } from '@/lib/auth-context'
import { Lock, X } from 'lucide-react'

export default function CompanySelection() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const selectedCompany = COMPANIES.find(c => c.id === selectedCompanyId)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    setTimeout(() => {
      if (selectedCompany && login(selectedCompany, password)) {
        setIsLoading(false)
        router.push('/dashboard')
      } else {
        setError('Invalid credentials. Please try again.')
        setPassword('')
        setIsLoading(false)
      }
    }, 600)
  }

  const closePasswordModal = () => {
    setSelectedCompanyId(null)
    setPassword('')
    setError('')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Professional Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.05)_25%,rgba(68,68,68,.05)_50%,transparent_50%,transparent_75%,rgba(68,68,68,.05)_75%,rgba(68,68,68,.05))] bg-[length:60px_60px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center pt-20 pb-16 border-b border-slate-700 border-opacity-30"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-7xl font-black text-white mb-3 tracking-tight">MD GROUPS AND ENTERPRISES</h1>
            <div className="w-32 h-1 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 mx-auto rounded-full mb-6" />
            <p className="text-2xl font-light text-gray-300">Professional Billing Management System</p>
            <p className="text-sm text-gray-500 mt-3">Enterprise Edition</p>
          </motion.div>
        </motion.div>

        {/* Company Selection */}
        <div className="max-w-3xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <p className="text-gray-400 text-lg">Select your organization to continue</p>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.12, delayChildren: 0.5 }}
          >
            {COMPANIES.map((company) => (
              <motion.button
                key={company.id}
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 12, scale: 1.01 }}
                onClick={() => setSelectedCompanyId(company.id)}
                className="w-full text-left group relative"
              >
                <motion.div
                  className={`bg-gradient-to-br ${company.color} rounded-xl p-8 text-white shadow-xl border border-white border-opacity-10 overflow-hidden`}
                  whileHover={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-all" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-1 tracking-tight">{company.name}</h3>
                      <p className="text-sm opacity-80">{company.description}</p>
                    </div>
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="ml-6"
                    >
                      <Lock size={22} className="opacity-60" />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-6 pt-6 border-t border-white border-opacity-15 relative z-10">
                    <div>
                      <p className="text-xs uppercase tracking-wider opacity-70 mb-1">GST Number</p>
                      <p className="text-sm font-mono font-semibold">{company.gstNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Location</p>
                      <p className="text-sm">{company.city}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          className="text-center py-6 text-gray-600 text-xs border-t border-slate-700 border-opacity-30 fixed bottom-0 w-full bg-slate-950 bg-opacity-80 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>© 2026 MD Group of Enterprises. All rights reserved.</p>
        </motion.div>
      </div>

      {/* Password Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedCompanyId ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm ${
          selectedCompanyId ? '' : 'pointer-events-none'
        }`}
        onClick={closePasswordModal}
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0, y: 60 }}
          animate={selectedCompanyId ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.4, opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedCompany?.name}</h2>
              <p className="text-sm text-gray-600">{selectedCompany?.description}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={closePasswordModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </motion.button>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-xs text-indigo-800">
              <p className="font-semibold mb-2">Organization Details</p>
              <p className="mb-1"><strong>GST:</strong> {selectedCompany?.gstNumber}</p>
              <p><strong>State:</strong> {selectedCompany?.state}</p>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !password}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isLoading || !password
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-700 to-indigo-600 text-white hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <motion.span animate={{ opacity: [1, 0.6] }} transition={{ duration: 0.6, repeat: Infinity }}>
                  Authenticating...
                </motion.span>
              ) : (
                'Access System'
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </main>
  )
}
