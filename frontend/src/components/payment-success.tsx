"use client"

import { CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PaymentSuccessProps {
  isOpen: boolean
  onClose: () => void
  merchantName: string
  amount: string
}

export function PaymentSuccess({ isOpen, onClose, merchantName, amount }: PaymentSuccessProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="rounded-full bg-green-500/20 p-3 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <DialogTitle className="text-xl">Payment Successful!</DialogTitle>
          <DialogDescription>Your payment to {merchantName} has been processed successfully.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <div className="text-3xl font-bold mb-1">{amount}</div>
          <p className="text-sm text-gray-400">Transaction ID: 0x8f7e...3d2a</p>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

