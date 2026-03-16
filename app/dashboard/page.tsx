'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import EnhancedBillingDashboard from '@/components/EnhancedBillingDashboard'

export default function DashboardPage() {
  const { isAuthenticated, currentCompany } = useAuth()
  const router = useRouter()

  if (!isAuthenticated || !currentCompany) {
    router.push('/company-selection')
    return null
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <EnhancedBillingDashboard />
    </motion.main>
  )
}
