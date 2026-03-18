'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

import { companyService } from './services'

export type Company = {
  id: number
  name: string
  password: string
  description: string
  icon: string
  color: string
  gstNumber?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  logo?: string
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

interface AuthContextType {
  currentCompany: Company | null
  companies: Company[]
  isAuthenticated: boolean
  login: (company: Company, password: string) => boolean
  logout: () => void
  refresh: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch companies from Supabase
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true)
      const data = await companyService.getCompanies()
      
      const DEFAULT_COMPANIES = [
        {
          id: 1,
          name: 'MD AUTOMIND SOLUTIONS',
          password: 'admin123',
          description: 'Automotive Solutions & Innovation',
          icon: '',
          color: 'from-indigo-700 to-indigo-600',
          gstNumber: '27AABCU9003R1Z0',
          email: 'billing@mdautominds.com',
          phone: '+91-9876543210',
          address: 'Plot No. 123, Industrial Complex, Miyapur',
          city: 'Hyderabad',
          state: 'Telangana',
          logo: '/logo-solutions.png',
        },
        {
          id: 2,
          name: 'MD AUTOMIND ACADEMY',
          password: 'academy123',
          description: 'Automotive Education & Training',
          icon: '',
          color: 'from-blue-700 to-blue-600',
          gstNumber: '27AABCU9003R1Z1',
          email: 'info@mdautoacademy.com',
          phone: '+91-9876543211',
          address: 'Plot No. 456, Education Hub, Kukatpally',
          city: 'Hyderabad',
          state: 'Telangana',
          logo: '/logo-academy.png',
        },
        {
          id: 3,
          name: 'MD GROUP OF ENTERPRISES',
          password: 'enterprise123',
          description: 'Global Infrastructure & Trade',
          icon: '',
          color: 'from-emerald-700 to-emerald-600',
          gstNumber: '27AABCU9003R1Z2',
          email: 'admin@mdgroups.com',
          phone: '+91-9876543212',
          address: 'Building 10, Hi-Tech City, Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          logo: '/logo-enterprises.png',
        },
      ]

      // Merge database data with defaults, ensuring one entry per ID
      const FINAL_COMPANIES = [...DEFAULT_COMPANIES]
      data.forEach((dbComp: any) => {
        const index = FINAL_COMPANIES.findIndex(c => c.id === dbComp.id)
        if (index !== -1) {
          // Prioritize default name and logo if the DB version looks suspicious or is null
          const mergedLogo = dbComp.logo_url && dbComp.logo_url.startsWith('http') 
            ? dbComp.logo_url 
            : FINAL_COMPANIES[index].logo
            
          FINAL_COMPANIES[index] = { 
            ...FINAL_COMPANIES[index], 
            ...dbComp, 
            name: FINAL_COMPANIES[index].name, // Keep the standardized name
            logo: mergedLogo
          }
        } else {
          FINAL_COMPANIES.push({
            ...dbComp,
            logo: dbComp.logo_url || '/md-logo-01.png'
          })
        }
      })

      setCompanies(FINAL_COMPANIES)
      
      // Sync current company if session exists
      const saved = localStorage.getItem('active_company')
      if (saved) {
        try {
          const savedCompany = JSON.parse(saved)
          const refreshed = FINAL_COMPANIES.find((c: Company) => c.id === savedCompany.id)
          if (refreshed) {
            setCurrentCompany(refreshed)
            setIsAuthenticated(true)
          }
        } catch (e) {
          console.error("Auth hydration failed:", e)
        }
      }
      setIsLoading(false)
    }

    fetchCompanies()
  }, [])

  const login = (company: Company, password: string): boolean => {
    if (company.password === password) {
      setCurrentCompany(company)
      setIsAuthenticated(true)
      localStorage.setItem('active_company', JSON.stringify(company))
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentCompany(null)
    setIsAuthenticated(false)
    localStorage.removeItem('active_company')
  }

  const refresh = async () => {
    const data = await companyService.getCompanies()
    setCompanies(data)
    if (currentCompany) {
      const updated = data.find(c => c.id === currentCompany.id)
      if (updated) {
        setCurrentCompany(updated)
        localStorage.setItem('active_company', JSON.stringify(updated))
      }
    }
  }

  return (
    <AuthContext.Provider value={{ currentCompany, companies, isAuthenticated, login, logout, refresh, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
