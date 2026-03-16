'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
  currentCompany: Company | null
  isAuthenticated: boolean
  login: (company: Company, password: string) => boolean
  logout: () => void
}

export interface Company {
  id: number
  name: string
  password: string
  description: string
  icon: string
  color: string
  taxId?: string
  email?: string
  phone?: string
  gstNumber?: string
  logo?: string
  address?: string
  city?: string
  state?: string
  projects?: number
  budget?: number
  spent?: number
  teamMembers?: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const COMPANIES: Company[] = [
  {
    id: 1,
    name: 'MD AUTO MINDS',
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
    logo: '/MD logo-01.png',
    projects: 24,
    budget: 8500000,
    spent: 5800000,
    teamMembers: 78,
  },
  {
    id: 2,
    name: 'MD AUTO ACADEMY',
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
    logo: '/MD logo-02.png',
    projects: 18,
    budget: 6200000,
    spent: 4100000,
    teamMembers: 65,
  },
]

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = (company: Company, password: string): boolean => {
    if (company.password === password) {
      setCurrentCompany(company)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentCompany(null)
    setIsAuthenticated(false)
  }

  const value: AuthContextType = {
    currentCompany,
    isAuthenticated,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
