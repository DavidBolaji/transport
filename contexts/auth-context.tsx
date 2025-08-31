"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
// import type { User } from "@/types"
import { User } from "@prisma/client"
import { LoginCredentials, RegisterData } from "@/auth-action"
import { AuthService } from "@/lib/auth-service"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData, nin: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const authService = AuthService.getInstance()

  useEffect(() => {
    // Initialize auth state from localStorage
    authService.initializeAuth()
    const currentUser = authService.getCurrentUser()
    const authenticated = authService.isAuthenticated()

    setUser(currentUser)
    setIsAuthenticated(authenticated)
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials)
    if (result.success && result.user) {
      setUser(result.user)
      setIsAuthenticated(true)
    }
    return { success: result.success, error: result.error }
  }

  const register = async (data: RegisterData, nin: string) => {
    const result = await authService.register(data, nin)
    if (result.success && result.user) {
      setUser(result.user)
      setIsAuthenticated(true)
    }
    return { success: result.success, error: result.error }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
