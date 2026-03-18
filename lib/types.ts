export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxable: boolean
}

export interface Client {
  id: string
  company_id: number
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  gstNumber?: string
}

export interface Invoice {
  id: string
  company_id: number
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
  poNumber?: string
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
  smtp_host?: string
  smtp_port?: string
  smtp_user?: string
  smtp_pass?: string
  bank_name?: string
  bank_account?: string
  bank_ifsc?: string
  bank_branch?: string
  pan_number?: string
  authorized_signatory?: string
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

export interface Expense {
  id: string
  company_id: number
  description: string
  amount: number
  date: string
  category?: string
  created_at?: string
}
