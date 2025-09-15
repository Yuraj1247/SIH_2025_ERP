"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/storage"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()

    if (!user) {
      router.push("/login")
      return
    }

    if (!allowedRoles.includes(user.type)) {
      alert("You don't have permission to access this page")
      router.push("/login")
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [router, allowedRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-poppins font-normal">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
