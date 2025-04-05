"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Register() {
  const router = useRouter()
  const [userType, setUserType] = useState<"User" | "Merchant">("User")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    setIsLoading(true)

    try {
      // TODO: Call your API to register the user
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userType, email }),
      // });

      // if (!response.ok) throw new Error('Registration failed');
      // const data = await response.json();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // After registration, redirect to setup ENS page
      router.push("/setup-ens")
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
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold">w</div>
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
          <h2 className="text-2xl font-bold mb-6">Create Account</h2>
          <p className="text-gray-400 mb-8">Register for a new wallet account</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">User Type</label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  className={`py-3 px-4 rounded-lg text-center ${
                    userType === "User" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
                  }`}
                  onClick={() => setUserType("User")}
                >
                  User
                </button>
                <button
                  type="button"
                  className={`py-3 px-4 rounded-lg text-center ${
                    userType === "Merchant" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
                  }`}
                  onClick={() => setUserType("Merchant")}
                >
                  Merchant
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Continue"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm">
          Already have a wallet?{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-400">
            Import existing wallet
          </Link>
        </p>
      </div>
    </div>
  )
}

