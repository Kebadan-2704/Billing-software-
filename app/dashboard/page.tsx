'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import EnhancedBillingDashboard from '@/components/EnhancedBillingDashboard'

export default function DashboardPage() {
  const { isAuthenticated, currentCompany, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !currentCompany)) {
      router.push('/company-selection')
    }
  }, [isLoading, isAuthenticated, currentCompany, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_40px_-10px_#D4AF37]"
        />
      </div>
    )
  }

  if (!isAuthenticated || !currentCompany) {
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
