import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TabNavigation } from "@/components/tab-navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Web3 Social",
  description: "Short-form video social media with Web3 integration",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-black">
            <main className="flex-1 overflow-hidden bg-black">{children}</main>
            <TabNavigation />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

