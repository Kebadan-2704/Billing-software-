import { supabase } from './supabase'
import { Invoice, Client } from './types'

export const invoiceService = {
  async getInvoices(companyId: number) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []).map((i: any) => ({
      ...i,
      invoiceNumber: i.invoice_number,
      issueDate: i.issue_date,
      dueDate: i.due_date,
      clientId: i.client_id,
      taxRate: i.tax_rate,
      taxAmount: i.tax_amount,
      createdAt: i.created_at,
      paymentTerms: i.payment_terms,
      client: i.client ? {
        ...i.client,
        gstNumber: i.client.gst_number,
        zipCode: i.client.zip_code
      } : null
    })) as Invoice[]
  },

  async createInvoice(companyId: number, invoice: Omit<Invoice, 'id'>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...invoice, company_id: companyId }])
      .select()
    
    if (error) throw error
    return data[0] as Invoice
  },

  async updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .select()
    
    if (error) throw error
    return data[0] as Invoice
  },

  async deleteInvoice(invoiceId: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
    
    if (error) throw error
  }
}

export const clientService = {
  async getClients(companyId: number) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
    
    if (error) throw error
    return data as Client[]
  },

  async createClient(companyId: number, client: Omit<Client, 'id'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ ...client, company_id: companyId }])
      .select()
    
    if (error) throw error
    const c = data[0]
    return {
      ...c,
      gstNumber: c.gst_number,
      zipCode: c.zip_code
    } as Client
  },

  async deleteClient(clientId: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
    
    if (error) throw error
  }
}

export const expenseService = {
  async getExpenses(companyId: number) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('company_id', companyId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createExpense(companyId: number, expense: any) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, company_id: companyId }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteExpense(expenseId: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
    
    if (error) throw error
  },

  async updateExpense(expenseId: string, updates: any) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', expenseId)
      .select()
    
    if (error) throw error
    return data[0]
  }
}

export const companyService = {
  async getCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      console.error("Error fetching companies:", error)
      return []
    }
    
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      password: c.password,
      description: c.description,
      icon: c.icon,
      color: c.color,
      gstNumber: c.gst_number,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      state: c.state,
      logo: c.logo_url,
      smtp_host: c.smtp_host,
      smtp_port: c.smtp_port,
      smtp_user: c.smtp_user,
      smtp_pass: c.smtp_pass,
      bank_name: c.bank_name,
      bank_account: c.bank_account,
      bank_ifsc: c.bank_ifsc,
      bank_branch: c.bank_branch,
      pan_number: c.pan_number,
      authorized_signatory: c.authorized_signatory
    }))
  },

  async updateCompany(companyId: number, updates: any) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async createCompany(company: any) {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteCompany(companyId: number) {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
    
    if (error) throw error
  }
}
