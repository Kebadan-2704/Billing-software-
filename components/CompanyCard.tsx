'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, Company } from '@/lib/auth-context'
import { Lock, X } from 'lucide-react'

interface CompanyCardProps {
  company: Company
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate verification delay
    setTimeout(() => {
      if (login(company, password)) {
        setIsLoading(false)
        router.push('/dashboard')
      } else {
        setError('Incorrect password. Try again.')
        setPassword('')
        setIsLoading(false)
      }
    }, 600)
  }

  return (
    <>
      {/* Company Card */}
      <motion.div
        whileHover={{ scale: 1.05, y: -10 }}
        whileTap={{ scale: 0.95 }}
        className="cursor-pointer"
        onClick={() => !showPassword && setShowPassword(true)}
      >
        <motion.div
          className={`bg-gradient-to-br ${company.color} rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden h-64 flex flex-col justify-between`}
          layoutId={`card-${company.id}`}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-white opacity-0"
            whileHover={{ opacity: 0.1 }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="text-5xl mb-4">{company.icon}</div>
            <h3 className="text-2xl font-bold mb-2">{company.name}</h3>
            <p className="text-sm opacity-90">{company.description}</p>
          </div>

          {/* Stats */}
          <motion.div 
            className="relative z-10 text-sm"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="opacity-90">Click to access billing system</p>
          </motion.div>

          {/* Glow effect */}
          <motion.div
            className="absolute -inset-1 bg-white opacity-0 blur-lg"
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>

      {/* Password Modal */}
      {showPassword && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setShowPassword(false)
            setPassword('')
            setError('')
          }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 w-96 shadow-2xl"
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowPassword(false)
                setPassword('')
                setError('')
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{company.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your password to access</p>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  autoFocus
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-lg font-bold text-white transition ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${company.color} hover:shadow-lg`
                }`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.div>
                ) : (
                  'Access Dashboard'
                )}
              </motion.button>
            </form>

            {/* Demo password hint */}
            <p className="text-xs text-gray-400 text-center mt-4">
              Demo: 1234 for first, 5678 for second, 9012 for third
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
