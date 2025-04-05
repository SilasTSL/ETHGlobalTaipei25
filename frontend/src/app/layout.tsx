import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TabNavigation } from "@/components/tab-navigation"
import { VerificationProvider } from '@/components/contexts/verificationContext';
import { NotificationProvider } from "@/components/helper/notification-provider"


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
          <VerificationProvider>
            <NotificationProvider>
              <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-black">
                <main className="flex-1 overflow-y-auto">{children}</main>
                <TabNavigation />
              </div>
            </NotificationProvider>
          </VerificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

