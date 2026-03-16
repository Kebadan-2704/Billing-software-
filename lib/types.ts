// Types for Invoice Items
export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxable: boolean
}

// Types for Client
export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  taxId?: string
}

// Types for Invoice
export interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  clientId: string
  client: Client
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  amountPaid?: number
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled' | 'Partial'
  notes?: string
  termsAndConditions?: string
  paymentTerms?: string
  createdAt: string
  updatedAt: string
}

// Types for Company Settings with GST and Financial Tracking
export interface CompanySettings {
  companyName: string
  email: string
  phone: string
  gstNumber?: string
  companyLogo?: string
  address?: string
  city?: string
  state?: string
}

// Types for Monthly Financial Data
export interface MonthlyData {
  month: string
  projectsCount: number
  amountReceived: number
  amountPending: number
  totalAmount: number
}

// Types for Company Financial Overview
export interface CompanyFinancials {
  totalProjects: number
  totalAmountReceived: number
  totalAmountPending: number
  totalAmount: number
  monthlyData: MonthlyData[]
}
