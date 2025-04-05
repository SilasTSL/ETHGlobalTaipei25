"use client"
import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TabNavigation } from "@/components/tab-navigation"
import { VerificationProvider } from '@/components/contexts/verificationContext';
import { NotificationProvider } from "@/components/helper/notification-provider"
import { AuthProvider } from "@/components/contexts/authContext"
import { usePathname } from "next/navigation"
import { loginUser } from "@/api/authApi"
import dotenv from "dotenv"

dotenv.config()

// Create a client component to handle the pathname check
function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNavigation = ['/login', '/register', '/setup-ens', '/home'].includes(pathname)

  const handleDebugLogin = async () => {
    try {
      console.log('seed phrase', process.env.NEXT_PUBLIC_SEED_PHRASE)
      // Using a test seedphrase - replace with your test account's seedphrase
      await loginUser(process.env.NEXT_PUBLIC_SEED_PHRASE)
      console.log("Debug login successful")
    } catch (error) {
      console.error("Debug login failed:", error)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-black">
      <button
        onClick={handleDebugLogin}
        className="fixed bottom-20 right-4 z-50 bg-red-500 text-white px-3 py-1 rounded-md text-sm"
        style={{ opacity: 0.7 }}
      >
        Debug Login
      </button>
      <main className="flex-1 overflow-y-auto">{children}</main>
      {!hideNavigation && <TabNavigation />}
    </div>
  )
}

// Make RootLayout a client component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <VerificationProvider>
              <NotificationProvider>
                <NavigationWrapper>
                  {children}
                </NavigationWrapper>
              </NotificationProvider>
            </VerificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

