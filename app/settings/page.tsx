'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const { isAuthenticated, currentCompany, logout } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: currentCompany?.name || '',
    gstNumber: currentCompany?.gstNumber || '',
    email: currentCompany?.email || '',
    phone: currentCompany?.phone || '',
    address: currentCompany?.address || '',
    city: currentCompany?.city || '',
    state: currentCompany?.state || '',
  })
  const [saved, setSaved] = useState(false)

  if (!isAuthenticated || !currentCompany) {
    router.push('/company-selection')
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    logout()
    router.push('/company-selection')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 shadow-xl"
      >
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">Company Settings</h1>
          <p className="text-gray-300 mt-2">Manage company information and GST details</p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
        >
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* GST & Tax Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tax Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GST Registration Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 27AABCU9003R1Z0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
                <p className="text-xs text-gray-600 mt-2">
                  This GST number will be displayed on all invoices. Format: 15-digit GSTIN
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
          >
            <p className="font-semibold mb-2">Important Information:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>GST number must be valid as per Indian Government regulations</li>
              <li>All changes are saved automatically when you update</li>
              <li>These settings will be reflected on all future invoices</li>
              <li>Ensure GST compliance for your jurisdiction</li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Save size={20} />
              Save Changes
            </button>
            <button
              onClick={handleLogout}
              className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Logout
            </button>
          </motion.div>

          {/* Success Message */}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center"
            >
              ✓ Settings saved successfully!
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
