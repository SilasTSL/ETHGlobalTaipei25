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
import SelfQRCode from "@/components/SelfQRCode"
interface VerificationQRProps {
  isOpen: boolean
  onClose: () => void
  onVerificationComplete: () => void
  isVerifying: boolean
}

export function VerificationQR({ isOpen, onClose, onVerificationComplete, isVerifying }: VerificationQRProps) {

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 w-full justify-center mb-2">
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
              <div className="relative w-64 h-64 bg-white p-1 rounded-lg mb-4">
                <SelfQRCode />
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

