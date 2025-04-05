"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUserSession } from "@/api/authApi"

type AuthContextType = {
  ensName: string | null
  setEnsName: (name: string | null) => void
  clearEnsName: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ensName, setEnsName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await getUserSession();
        setEnsName(session.ensName);
      } catch (error) {
        setEnsName(null);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, [])

  const updateEnsName = (name: string | null) => {
    setEnsName(name)
  }

  const clearEnsName = () => {
    setEnsName(null)
  }

  return (
    <AuthContext.Provider
      value={{
        ensName,
        setEnsName: updateEnsName,
        clearEnsName,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  // Return default values if context is undefined
  return context || {
    ensName: null,
    setEnsName: () => {},
    clearEnsName: () => {},
    isLoading: false
  }
}