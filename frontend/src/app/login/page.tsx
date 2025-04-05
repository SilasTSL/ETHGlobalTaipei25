"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/contexts/authContext"
import { loginUser } from "@/api/authApi"

export default function Login() {
  const router = useRouter()
  const { setEnsName } = useAuth()
  const [seedphrase, setSeedphrase] = useState<string[]>(Array(12).fill(""))
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 12)
  }, [])

  const handleInputChange = (index: number, value: string) => {
    // Update the seedphrase array
    const newSeedphrase = [...seedphrase]
    newSeedphrase[index] = value
    setSeedphrase(newSeedphrase)

    // If the user entered a value and it's not the last input, move to the next input
    if (value && index < 11) {
      setActiveIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // If the user presses backspace on an empty input, move to the previous input
    if (e.key === "Backspace" && !seedphrase[index] && index > 0) {
      setActiveIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    }

    // If the user presses tab, prevent default behavior and move to the next input
    if (e.key === "Tab" && !e.shiftKey && index < 11) {
      e.preventDefault()
      setActiveIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }

    // If the user presses shift+tab, prevent default behavior and move to the previous input
    if (e.key === "Tab" && e.shiftKey && index > 0) {
      e.preventDefault()
      setActiveIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const words = pastedText.trim().split(/\s+/)

    // Only use up to 12 words
    const validWords = words.slice(0, 12)

    // Fill the seedphrase array with the pasted words
    const newSeedphrase = [...seedphrase]
    validWords.forEach((word, index) => {
      if (index < 12) {
        newSeedphrase[index] = word
      }
    })

    setSeedphrase(newSeedphrase)

    // Focus the next empty input or the last input
    const nextEmptyIndex = newSeedphrase.findIndex((word) => !word)
    if (nextEmptyIndex !== -1) {
      setActiveIndex(nextEmptyIndex)
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      setActiveIndex(11)
      inputRefs.current[11]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Check if all inputs are filled
    const isComplete = seedphrase.every((word) => word.trim())
    if (!isComplete) {
      setError("Please enter all 12 words of your recovery phrase")
      return
    }

    setIsLoading(true)

    try {
      // Join the seedphrase array into a string
      const seedphraseString = seedphrase.join(" ")
      const response = await loginUser(seedphraseString)
      console.log('seedphraseString', seedphraseString)
      console.log('login response', response)

      if (response?.message === "Authenticated") {
        // If we have an ENS name from the API, save it
        setEnsName(response?.ensName);
        router.push("/feed")
      } else {
        console.log('response?.message', response?.message)
        // Pass the seedphrase as a query parameter, but make sure to encode it
        router.push(`/ens-setup?seedphrase=${encodeURIComponent(seedphraseString)}`)
      }
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
          <h2 className="text-2xl font-bold mb-6">Import Wallet</h2>
          <p className="text-gray-400 mb-8">Enter your 12-word recovery phrase to restore your wallet</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-4">Recovery Phrase</label>

              <div className="grid grid-cols-3 gap-3">
                {seedphrase.map((word, index) => (
                  <div key={index} className="relative">
                    <div className="absolute top-0 left-0 w-6 h-6 flex items-center justify-center text-xs text-gray-500 font-medium">
                      {index + 1}
                    </div>
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="password"
                      value={word}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-7 text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Paste your entire recovery phrase in the first box to auto-fill
              </p>
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
              {isLoading ? "Verifying..." : "Continue"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm">
          Don't have a wallet?{" "}
          <Link href="/register" className="text-blue-500 hover:text-blue-400">
            Create a new wallet
          </Link>
        </p>
      </div>
    </div>
  )
}

