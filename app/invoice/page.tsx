'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import ProfessionalInvoiceComponent from '@/components/EnhancedProfessionalInvoice'

export default function InvoicePage() {
  const { isAuthenticated, currentCompany } = useAuth()
  const router = useRouter()

  if (!isAuthenticated || !currentCompany) {
    router.push('/company-selection')
    return null
  }

  return <ProfessionalInvoiceComponent />
}
