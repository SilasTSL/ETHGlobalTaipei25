"use client"

import { Home, Database, Wallet, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function TabNavigation() {
  const pathname = usePathname()

  const tabs = [
    {
      name: "Feed",
      href: "/feed",
      icon: Home,
    },
    {
      name: "Data Vault",
      href: "/data-vault",
      icon: Database,
    },
    {
      name: "Wallet",
      href: "/wallet",
      icon: Wallet,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ]

  return (
    <div className="flex items-center justify-around border-t border-gray-800 bg-black py-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 text-xs",
              isActive ? "text-primary" : "text-gray-400",
            )}
          >
            <tab.icon className={cn("h-6 w-6 mb-1", isActive ? "text-primary" : "text-gray-400")} />
            <span>{tab.name}</span>
          </Link>
        )
      })}
    </div>
  )
}

