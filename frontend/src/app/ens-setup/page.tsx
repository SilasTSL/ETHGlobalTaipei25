"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { useAuth } from "@/components/contexts/authContext"
import { registerUser, checkLabelExists } from "@/api/authApi"

export default function SetupENS() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setEnsName } = useAuth()
  const [ensName, setEnsNameValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState("")

  const debouncedEnsName = useDebounce(ensName, 500)

  // Get the seedphrase from URL parameters
  const seedphrase = searchParams.get('seedphrase')

  useEffect(() => {
    // Redirect to login if no seedphrase is provided
    if (!seedphrase) {
      router.push('/login')
    }
  }, [seedphrase, router])

  // Check ENS availability when the debounced value changes
  useEffect(() => {
    const checkENSAvailability = async () => {
      if (!debouncedEnsName) {
        setIsAvailable(null)
        return
      }

      setIsChecking(true)

      try {
        const response = await checkLabelExists(debouncedEnsName)
        console.log('exists', response)
        // If label exists, it's not available. If it doesn't exist (false), it's available
        setIsAvailable(!response.exists)
      } catch (err) {
        console.error(err)
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }

    checkENSAvailability()
  }, [debouncedEnsName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!ensName.trim()) {
      setError("Please enter an ENS name")
      return
    }

    if (!isAvailable) {
      setError("This ENS name is not available")
      return
    }

    if (!seedphrase) {
      setError("Missing authentication data")
      return
    }

    setIsLoading(true)

    try {
      // TODO: Call your API to register the ENS name with both the ENS name and seedphrase
      // const response = await fetch('/api/ens/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     ensName,
      //     seedphrase 
      //   }),
      // });

      const response = await registerUser(seedphrase, debouncedEnsName)

      const { ensName, address } = response
      // if (!response.ok) throw new Error('Failed to register ENS name');


      // Save the ENS name to context
      setEnsName(ensName)

      // Redirect to dashboard after successful registration
      router.push("/feed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          {/* <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold">w</div> */}
          <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Choose Your ENS Name</h2>
          <p className="text-gray-400 mb-8">Select a unique Ethereum Name Service (ENS) domain for your wallet</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="ens-name" className="block text-sm font-medium text-gray-400 mb-2">
                ENS Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="ens-name"
                  className={`w-full bg-gray-800 border rounded-lg p-3 pr-12 text-white focus:ring-2 focus:outline-none ${
                    isAvailable === true
                      ? "border-green-500 focus:ring-green-500"
                      : isAvailable === false
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-700 focus:ring-blue-500"
                  }`}
                  placeholder="yourname.eth"
                  value={ensName}
                  onChange={(e) => setEnsNameValue(e.target.value)}
                  disabled={isLoading}
                />
                {isChecking ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : ensName && isAvailable !== null ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isAvailable ? (
                      <svg
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    )}
                  </div>
                ) : null}
              </div>
              {ensName && isAvailable !== null && (
                <p className={`text-sm mt-2 ${isAvailable ? "text-green-500" : "text-red-500"}`}>
                  {isAvailable ? "This name is available!" : "This name is already taken"}
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isChecking || !isAvailable}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? "Registering..." : "Register ENS Name"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm">Your ENS name will be your identity on the Ethereum network</p>
      </div>
    </div>
  )
}

