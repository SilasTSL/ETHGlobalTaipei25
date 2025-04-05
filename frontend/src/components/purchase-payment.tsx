"use client"

import { useState, useEffect } from "react"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchWalletBalanceTestNet, fetchAmountOfCryptoToTransfer } from "../api/walletApi"
import { postPurchasePaymentSameChain, postPurchasePaymentBridgeChain } from "../api/paymentApi"
import { ProcessingPaymentDialog } from "./processing-payment-dialog"
import { TransactionCompleteDialog } from "./transaction-complete-dialog"
import { useRouter } from "next/navigation"
import { useNotification } from "@/components/helper/notification-provider"


//CONTROL HERE TO USE MAINNET OR TESTNET FOR THE VISUAL
const USE_MAINNET = false

// Add the RefreshTimer component
const RefreshTimer = ({ onRefresh, resetKey, disabled }: { onRefresh: () => void; resetKey?: any; disabled?: boolean }) => {
  const [seconds, setSeconds] = useState(600)

  // Reset timer when resetKey changes
  useEffect(() => {
    setSeconds(600)
  }, [resetKey])

  // Separate useEffect for countdown logic
  useEffect(() => {
    if (disabled) return; // Don't start timer if disabled

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          onRefresh(); // Call refresh when timer hits 0
          return 600; // Reset to 30 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh, disabled]);

  if (disabled) return null; // Don't render timer if disabled

  return <span className="ml-1 font-mono text-xs">{seconds}s</span>;
}


export function PurchasePayment({ ensName, price }: { ensName: string, price: string }) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [recipientEnsName, setRecipientEnsName] = useState(ensName ? ensName : "")
  const [recipientChain, setRecipientChain] = useState<string | null>(null)
  const [isCheckingAddress, setIsCheckingAddress] = useState(false)
  const [selectedChain, setSelectedChain] = useState<string | null>(null)
  const [isLoadingAssets, setIsLoadingAssets] = useState(false)
  const [payGasWithUSDC, setPayGasWithUSDC] = useState(false);
  const [amountUSD, setAmountUSD] = useState(price ? price : "")

  const [isCalculating, setIsCalculating] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [gasFee, setGasFee] = useState("0.0012 ETH ($2.16)")

  // States affected by API calls
  const [walletAssets, setWalletAssets] = useState<Array<{ //Tracks the crypto amount in the users' wallet
    symbol: string;
    name: string;
    balance: number;
    contractAddress: string;
  }>>([])
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null) //Tracks the symbol of selected crypto
  const [cryptoAmount, setCryptoAmount] = useState<number | null>(null) // Tracks the crypto amount to be transferred based on USD amount

  // New states for transaction processing
  const [isProcessingPayment, setIsProcessingPayment] = useState(false) 
  const [transactionComplete, setTransactionComplete] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<{
    sourceAddress: string;
    destinationAddress: string;
    txHash: string;
  } | null>(null)

  //TODO: To Check recipient address and determine chain
  useEffect(() => {
    if (recipientEnsName.length > 5) {
      setIsCheckingAddress(true)

      // Simulate API call to check address
      setTimeout(() => {
        // For demo purposes, addresses starting with 0x0 are Base, others are Ethereum
        const DETECTED_CHAIN = "ETH"
        setRecipientChain(DETECTED_CHAIN)
        setIsCheckingAddress(false)
      }, 1000)
    } else {
      setRecipientChain(null)
    }
  }, [recipientEnsName])

  // Load assets when chain is selected
  useEffect(() => {
    if (selectedChain) {
      setIsLoadingAssets(true)

      const loadAssets = async () => {
        try {
          const assets = await fetchWalletBalanceTestNet(selectedChain)
          setWalletAssets(assets)
        } catch (error) {
          console.error('Failed to fetch wallet balance:', error)
        } finally {
          setIsLoadingAssets(false)
        }
      }
      loadAssets()
    }
  }, [selectedChain])

    // Recaculate amount of crypto to be transferred when amount in USD or selected asset changes
    useEffect(() => {
      if (selectedChain && amountUSD && selectedAsset) {
        setIsCalculating(true); 
        const debounceTimer = setTimeout(() => {
          calculateCryptoAmount();
        }, 500); // 500ms delay
        setIsCalculating(false); 
        // Cleanup the timer if the dependencies change before the delay is over
        return () => clearTimeout(debounceTimer);
      } 
    }, [amountUSD, selectedAsset, selectedChain]);

    // Add effect to reset selected asset when chains change
    useEffect(() => {
      // Reset selected asset when chains change
      if (recipientChain && selectedChain) {
        setSelectedAsset(null);
      }
    }, [recipientChain, selectedChain]);

  // Extract the calculation logic into a reusable function
  const calculateCryptoAmount = async () => {    
    if (!selectedChain || !amountUSD || !selectedAsset) return;
    setIsCalculating(true);

    try {
      const tokenAmount = await fetchAmountOfCryptoToTransfer(amountUSD, selectedAsset, selectedChain);
      if (tokenAmount) {
        setCryptoAmount(tokenAmount);
      }
    } catch (error) {
      console.error('Error in calculating crypto amount');
    } finally {
      setIsCalculating(false);
    }
  };

  const getFilteredAssets = () => {
    // If recipient chain is different from selected chain (cross-chain transaction)
    if (recipientChain && selectedChain && recipientChain !== selectedChain && !USE_MAINNET) {
      // Only allow USDC for cross-chain transactions
      return walletAssets.filter(asset => asset.symbol === "USDC");
    }
    // Otherwise return all assets
    return walletAssets;
  }

  // Handle pay button click
  const handlePay = () => {
    setShowConfirmation(true)
  }

  const handleReturnToWallet = () => {
    setIsProcessingPayment(false);
    router.push("/wallet");
  };


  const handleConfirm = async () => {
    if (recipientEnsName && cryptoAmount && selectedChain && recipientChain && selectedAsset) {
      // Determine the chainsInvolved value
      let chainsInvolved = `${selectedChain}_${recipientChain}`;
      
      // If both chains are BASE and payGasWithUSDC is true, use special value
      if (recipientChain === "BASE" && selectedChain === "BASE" && payGasWithUSDC) {
        chainsInvolved = "BASE_BASE_CIRCLEMASTER";
      }
      
      setIsProcessingPayment(true);
      setShowConfirmation(false);
      
      try {
        let result;
        
        // Determine if bridging is needed (chains are different)
        if (recipientChain !== selectedChain) {
          result = await postPurchasePaymentBridgeChain(
            recipientEnsName, 
            cryptoAmount, 
            chainsInvolved, 
            selectedAsset,
          );
        } else {
          result = await postPurchasePaymentSameChain(
            recipientEnsName, 
            cryptoAmount, 
            chainsInvolved, 
            selectedAsset,
          );
        }
        
        // Show success notification with transaction hash
        showNotification(
          "success", 
          `Transaction to ${result.destinationEnsName} complete! Hash: ${result.txHash.slice(0, 6)}...${result.txHash.slice(-4)}`
        );

        // Set transaction details
        setTransactionDetails({
          sourceAddress: result.sourceAddress,
          destinationAddress: result.destinationEnsName,
          txHash: result.txHash
        });
        
        setTransactionComplete(true);
      } catch (error) {
        // Show error notification
        showNotification("error", "Transaction failed. Please try again.");
        console.error('Payment processing failed:', error);
      } finally {
        setIsProcessingPayment(false);
      }
    } else {
      setShowConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Send Payment</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white"
            onClick={() => router.back()}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <div className="relative">
              <Input
                id="recipient"
                placeholder="0x..."
                className="bg-[#1c1d2a] border-[#2a2c3e] text-white"
                value={recipientEnsName}
                onChange={(e) => setRecipientEnsName(e.target.value)}
              />
              {isCheckingAddress && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {recipientChain && (
              <p className="text-sm text-gray-400">
                Chain detected:{" "}
                <span className="text-white">{recipientChain === "ETH" ? "Ethereum" : "Base"}</span>
              </p>
            )}
          </div>

          {/* Source Chain */}
          <div className="space-y-2">
            <Label htmlFor="chain">Select Chain</Label>
            <Select onValueChange={setSelectedChain} value={selectedChain || undefined}>
              <SelectTrigger className="bg-[#1c1d2a] border-[#2a2c3e] text-white">
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1d2a] border-[#2a2c3e] text-white">
                <SelectItem value="ETH">Ethereum</SelectItem>
                <SelectItem value="BASE">Base</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Asset Selection */}
          <div className="space-y-2">
            <Label htmlFor="asset">Select Asset</Label>
            <Select
              onValueChange={setSelectedAsset}
              value={selectedAsset || undefined}
              disabled={!selectedChain || isLoadingAssets}
            >
              <SelectTrigger className="bg-[#1c1d2a] border-[#2a2c3e] text-white">
                {isLoadingAssets ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading assets...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select asset" />
                )}
              </SelectTrigger>
              <SelectContent className="bg-[#1c1d2a] border-[#2a2c3e] text-white">
                {getFilteredAssets().map((asset: { symbol: string, name: string, balance: number, contractAddress: string }) => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-500 mr-2 flex items-center justify-center">
                        {asset.symbol === "ETH" ? "Ξ" : "$"}
                      </div>
                      <span>
                        {asset.name} ({asset.symbol})
                      </span>
                      <span className="ml-auto text-gray-400">
                        {asset.balance} {asset.symbol}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Show message for cross-chain transactions */}
            {recipientChain && selectedChain && recipientChain !== selectedChain && !USE_MAINNET && (
              <p className="text-xs text-amber-400">
                Cross-chain transactions only support USDC
              </p>
            )}
          </div>

          {/* Amount in USD */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="bg-[#1c1d2a] border-[#2a2c3e] text-white pl-6"
                value={amountUSD}
                onChange={(e) => setAmountUSD(e.target.value)}
                disabled={!selectedAsset}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            </div>
          </div>

          {/* Crypto Amount with Timer */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Crypto Amount</Label>
              {cryptoAmount !== null && Number(amountUSD) > 0 && (
                <div className="text-xs text-gray-400 flex items-center">
                  <span>Refreshing in </span>
                  <RefreshTimer
                    onRefresh={calculateCryptoAmount}
                    resetKey={amountUSD}
                    disabled={!amountUSD || Number(amountUSD) <= 0}
                  />
                </div>
              )}
            </div>
            <div className="bg-[#1c1d2a] border border-[#2a2c3e] rounded-md p-3 flex items-center">
              {isCalculating ? (
                <div className="flex items-center text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Calculating...</span>
                </div>
              ) : cryptoAmount !== null ? (
                <div className="flex items-center justify-between w-full">
                  <span>
                    {cryptoAmount} {selectedAsset}
                  </span>
                  <span className="text-gray-400">${amountUSD}</span>
                </div>
              ) : (
                <span className="text-gray-400">Enter amount in USD</span>
              )}
            </div>

            {/* Gas Fee as smaller text */}
            {cryptoAmount !== null && (
              <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                <span>Estimated Gas Fee:</span>
                <span>{gasFee}</span>
              </div>
            )}
          </div>
          
          {/* USDC Gas Fee Option */}
          {cryptoAmount !== null && selectedChain === "BASE" && recipientChain === "BASE" && (
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              id="payGasWithUSDC"
              checked={payGasWithUSDC}
              onChange={(e) => setPayGasWithUSDC(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#d13b3b] focus:ring-[#d13b3b]"
            />
            <Label htmlFor="payGasWithUSDC" className="text-xs text-gray-400">
              Pay gas fees with USDC
            </Label>
          </div>
          )}

          {/* Pay Button */}
          <Button
            className="w-full bg-[#d13b3b] hover:bg-[#b83232] text-white"
            disabled={!recipientEnsName || !selectedChain || !selectedAsset || !amountUSD || cryptoAmount === null}
            onClick={handlePay}
          >
            Pay
          </Button>
        </div>
      </div>

      <ProcessingPaymentDialog isOpen={isProcessingPayment} onReturn={handleReturnToWallet}/>
      <TransactionCompleteDialog 
        isOpen={transactionComplete}
        onOpenChange={(open) => {
          if (!open) {
            setTransactionComplete(false);
            setTransactionDetails(null);
            router.push("/wallet");
          }
        }}
        transactionDetails={transactionDetails}
      />
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-[#1c1d2a] border-[#2a2c3e] text-white">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please review the transaction details before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Recipient</span>
              <span className="text-sm">
                {recipientEnsName.substring(0, 6)}...{recipientEnsName.substring(recipientEnsName.length - 4)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Amount</span>
              <div className="text-right">
                <div>
                  {cryptoAmount} {selectedAsset}
                </div>
                <div className="text-sm text-gray-400">${amountUSD}</div>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Network</span>
              <span>{`${recipientChain}-${selectedChain}`}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Gas Fee</span>
              <span>{gasFee}</span>
            </div>

            <div className="border-t border-[#2a2c3e] pt-4">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <div className="text-right">
                  <div>
                    {(cryptoAmount || 0) + 0.0012} {selectedAsset}
                  </div>
                  <div className="text-sm text-gray-400">
                    ${(Number.parseFloat(amountUSD || "0") + 2.16).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="border-[#2a2c3e] text-white"
            >
              Cancel
            </Button>
            <Button className="bg-[#d13b3b] hover:bg-[#b83232] text-white" onClick={handleConfirm}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

