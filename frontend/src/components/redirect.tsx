"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function Redirect({ to }: { to: string }) {
  const router = useRouter()

  useEffect(() => {
    router.push(to)
  }, [router, to])

  return null
}

