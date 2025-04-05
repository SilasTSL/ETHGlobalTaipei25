import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TabNavigation } from "@/components/tab-navigation"


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
              <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-black">
                <main className="flex-1 overflow-hidden">{children}</main>
                <TabNavigation />
              </div>
      </body>
    </html>
  )
}

