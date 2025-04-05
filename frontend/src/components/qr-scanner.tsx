"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: (merchantName: string, amount: string) => void
}

export function QRScanner({ isOpen, onClose, onPaymentComplete }: QRScannerProps) {
  const [cameraActive, setCameraActive] = useState(false)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("25.00")
  const [merchantName, setMerchantName] = useState("Coffee Shop")
  const [processingPayment, setProcessingPayment] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera when component mounts
  useEffect(() => {
    if (isOpen && !cameraActive) {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, cameraActive])

  // Simulate QR code detection after a delay
  useEffect(() => {
    if (cameraActive && !scannedCode) {
      const timer = setTimeout(() => {
        // Simulate finding a QR code
        setScannedCode("merchant:coffee-shop:eth")
        setCameraActive(false)
        setShowPaymentConfirmation(true)
        stopCamera()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [cameraActive, scannedCode])

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      // Fallback for demo purposes
      setCameraActive(true)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const handleClose = () => {
    stopCamera()
    setScannedCode(null)
    setShowPaymentConfirmation(false)
    onClose()
  }

  const handleConfirmPayment = () => {
    setProcessingPayment(true)

    // Simulate payment processing
    setTimeout(() => {
      setProcessingPayment(false)
      setShowPaymentConfirmation(false)
      onPaymentComplete(merchantName, `${paymentAmount} USDC`)
      handleClose()
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            {!showPaymentConfirmation
              ? "Position the QR code within the frame to scan and make a payment"
              : "Confirm payment details"}
          </DialogDescription>
        </DialogHeader>

        {!showPaymentConfirmation ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-full aspect-square max-w-xs bg-black rounded-lg overflow-hidden mb-4">
              {cameraActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-primary/50 rounded-lg" />
                  <div className="absolute inset-16 border border-primary rounded-lg" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-600" />
                </div>
              )}

              {cameraActive && (
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/50 text-white h-8 w-8"
                    onClick={stopCamera}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {!cameraActive && (
              <Button onClick={startCamera} className="mb-2">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            )}

            <p className="text-sm text-gray-400 text-center">
              {cameraActive ? "Scanning for QR code..." : "Camera access is required to scan QR codes"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Merchant</span>
                    <span className="text-sm font-medium">{merchantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Amount</span>
                    <span className="text-sm font-medium">{paymentAmount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Network Fee</span>
                    <span className="text-sm font-medium">0.01 USDC</span>
                  </div>
                  <div className="pt-2 border-t border-gray-700 flex justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-sm font-medium text-primary">
                      {(Number.parseFloat(paymentAmount) + 0.01).toFixed(2)} USDC
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="payment-note">Add a note (optional)</Label>
              <Input id="payment-note" placeholder="Coffee and pastry" className="bg-gray-800 border-gray-700" />
            </div>
          </div>
        )}

        <DialogFooter>
          {showPaymentConfirmation ? (
            <Button onClick={handleConfirmPayment} className="w-full" disabled={processingPayment}>
              {processingPayment ? "Processing..." : "Confirm Payment"}
              {!processingPayment && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose} className="w-full">
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

