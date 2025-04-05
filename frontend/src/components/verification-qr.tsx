"use client"

import { useState, useEffect } from "react"
import { QrCode, Shield, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface VerificationQRProps {
  isOpen: boolean
  onClose: () => void
  onVerificationComplete: () => void
  isVerifying: boolean
}

export function VerificationQR({ isOpen, onClose, onVerificationComplete, isVerifying }: VerificationQRProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("/placeholder.svg?height=300&width=300")

  // In a real implementation, you would generate a QR code for the Self Protocol
  useEffect(() => {
    // Simulate QR code generation
    // In a real app, you would generate a QR code for the Self Protocol by Celo
    if (isOpen) {
      // This is just a placeholder. In a real app, you would generate a real QR code
      setQrCodeUrl("/placeholder.svg?height=300&width=300")
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verify with Self Protocol
          </DialogTitle>
          <DialogDescription>
            Scan this QR code with the Self Protocol app by Celo to verify your identity
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4">
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-center text-gray-300">Verifying your identity...</p>
            </div>
          ) : (
            <>
              <div className="relative w-64 h-64 bg-white p-4 rounded-lg mb-4">
                <QrCode className="w-full h-full text-black" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={qrCodeUrl || "/placeholder.svg"} alt="Verification QR Code" className="w-48 h-48" />
                </div>
              </div>
              <div className="text-sm text-gray-300 text-center mb-4">
                <p className="mb-2">1. Open the Self Protocol app on your mobile device</p>
                <p className="mb-2">2. Tap the scan button and point your camera at this QR code</p>
                <p>3. Follow the instructions in the app to complete verification</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isVerifying}>
            Cancel
          </Button>
          {!isVerifying && <Button onClick={onVerificationComplete}>I've Scanned the Code</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

