import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ProcessingPaymentDialogProps {
  isOpen: boolean;
  onReturn: () => void;
}

export function ProcessingPaymentDialog({ isOpen, onReturn }: ProcessingPaymentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-[#1c1d2a] border-[#2a2c3e] text-white">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-[#d13b3b] border-t-transparent animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-[#d13b3b] border-b-transparent animate-spin"></div>
            </div>
          </div>
          <h3 className="mt-6 text-xl font-medium">Processing Payment</h3>
          <p className="mt-2 text-sm text-gray-400 text-center">
            Your transaction is being processed. You can return to the wallet while we complete this transaction.
          </p>
          <Button 
            variant="outline" 
            className="mt-6 border-[#2a2c3e] text-white"
            onClick={onReturn}
          >
            Return to Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}