// Update the TransactionCompleteDialog component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface TransactionDetails {
  sourceAddress: string;
  txHash: string;
}

interface TransactionCompleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transactionDetails: TransactionDetails | null;
}

export function TransactionCompleteDialog({ 
  isOpen, 
  onOpenChange, 
  transactionDetails 
}: TransactionCompleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1c1d2a] border-[#2a2c3e] text-white max-w-[90vw] w-[400px] mx-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="text-center">Transaction Complete</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Your payment has been successfully processed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {transactionDetails && (
            <>
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Source Address:</span>
                <span className="text-sm font-mono break-all">{transactionDetails.sourceAddress}</span>
              </div>
              
              <div className="flex flex-col space-y-1 mt-3">
                <span className="text-gray-400">Transaction Hash:</span>
                <span className="text-sm font-mono break-all">{transactionDetails.txHash}</span>
              </div>
              
              <div className="flex items-center justify-center mt-6">
                <div className="w-16 h-16 rounded-full bg-[#1a3a1a] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}