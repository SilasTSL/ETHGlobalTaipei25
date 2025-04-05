"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/contexts/authContext"

export default function Home() {
  const router = useRouter()
  const authContext = useAuth()
  const { ensName, isLoading } = authContext
  const [showOptions, setShowOptions] = useState(false)

  // If we have an ENS name and user hasn't clicked "Setup another account"
  const hasExistingAccount = ensName && !showOptions

  const handleContinue = () => {
    // TODO: Call your API to verify the existing account
    // For now, just redirect to dashboard
    router.push("/feed")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md">
        {/* <div className="mb-8">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold">w</div>
        </div> */}

        <div className="bg-gray-900 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome</h2>

          {hasExistingAccount ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold mb-3">
                  {ensName.charAt(0).toUpperCase()}
                </div>
                <p className="text-lg font-medium">{ensName}</p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
              >
                Continue as {ensName}
              </button>

              <button
                onClick={() => setShowOptions(true)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
              >
                Setup Another Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
              >
                Import Existing Seedphrase
              </button>

              <button
                onClick={() => router.push("/register")}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
              >
                Register for an Account
              </button>

              {showOptions && ensName && (
                <button
                  onClick={() => setShowOptions(false)}
                  className="w-full bg-transparent hover:bg-gray-800 text-gray-400 py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  Back to {ensName}
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

