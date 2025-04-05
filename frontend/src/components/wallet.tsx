"use client"

import { useEffect, useState } from "react"
import { Copy, ArrowUpRight, ArrowDownLeft, QrCode, CreditCard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { fetchLatestTransactions, fetchWalletBalanceTestNet } from "@/api/walletApi"
import { AssetSkeleton } from "@/components/helper/assetSkeleton"
import { TransactionSkeleton } from "@/components/helper/transactionSkeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Mock rewards data
const rewardsData = [
  {
    id: 1,
    amount: "5 USDC",
    value: "$5.00",
    source: "Referral Bonus",
    date: "Today, 2:15 PM",
  },
  {
    id: 2,
    amount: "10 USDC",
    value: "$10.00",
    source: "Staking Reward",
    date: "Yesterday, 9:30 AM",
  },
]

export function Wallet() {
  const router = useRouter()
  const [assets, setAssets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [rewards, setRewards] = useState(rewardsData)
  const [totalBalance, setTotalBalance] = useState(0)
  const [walletName, setWalletName] = useState("crypto.eth")
  const [dailyChange, setDailyChange] = useState("+2.4%")
  const [monthlyChange, setMonthlyChange] = useState("+8.7%")
  const [copyMessage, setCopyMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)


  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true)
  const [blockchain, setBlockchain] = useState("ETH")
  // Calculate total balance from assets
  useEffect(() => {
    fetchWalletBalance(blockchain)
  }, [blockchain])

    // Update the useEffect for transactions
  useEffect(() => {
      fetchTransactions(blockchain)
    }, [blockchain])

  const fetchWalletBalance = async (blockchain: string) => {
    setIsLoading(true)
    try {
      const assets = await fetchWalletBalanceTestNet(blockchain)
      setAssets(assets)

      // Calculate total balance
      const total = assets.reduce((acc, asset) => acc + asset.totalValue, 0)
      setTotalBalance(total)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async (blockchain: string) => {
    setIsTransactionsLoading(true)
    try {
      const transactions = await fetchLatestTransactions(blockchain)
      setTransactions(transactions)
    } finally {
      setIsTransactionsLoading(false)
    }
  }

  const handleBlockchainChange = (value: string) => {
    setBlockchain(value)
  }

  // Copy wallet address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText("0xb76d3afB4AECe9f9916EB5e727B7472b609332dE")
    setCopyMessage("Address copied!")
    setTimeout(() => setCopyMessage(""), 2000)
  }

  return (
    <div className="h-full bg-black text-white p-4 flex flex-col">
      {/* Wallet Header - Shows the wallet name and settings */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-xs font-bold">W</span>
          </div>
          <h1 className="text-lg font-bold">{walletName}</h1>
          <div className="relative">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-800" onClick={copyAddress}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy address</span>
            </Button>
            {copyMessage && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 rounded text-xs whitespace-nowrap">
                {copyMessage}
              </div>
            )}
          </div>
        </div>
      {/* Blockchain Dropdown */}
      <Select value={blockchain} onValueChange={handleBlockchainChange}>
          <SelectTrigger className="w-[110px] h-8 bg-gray-900 border-gray-800 text-xs">
            <SelectValue placeholder="Select chain" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-white">
            <SelectItem value="ETH" className="text-xs">
              Ethereum
            </SelectItem>
            <SelectItem value="BASE" className="text-xs">
              Base
            </SelectItem>
          </SelectContent>
        </Select>
      </div>



      {/* Balance Card - Shows the total balance and performance */}
      <Card className="bg-gray-900 border-gray-800 mb-4">
        <CardContent className="p-4 flex flex-col items-center">
          <p className="text-sm text-gray-400">Total Balance</p>
          <h2 className="text-3xl font-bold text-white">${totalBalance.toFixed(2)}</h2>

          <div className="flex gap-3 mt-1">
            <span className="text-xs text-green-400">{dailyChange} Today</span>
            <span className="text-xs text-green-400">{monthlyChange} Month</span>
          </div>
        </CardContent>
      </Card>

      {/* Assets Section - Shows the user's crypto assets */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-medium text-white">Your Assets</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 h-6 px-2"
            onClick={() => {}}
          >
            See All
            <svg
              className="h-3 w-3 ml-1"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>

        <div className="space-y-2">
        {isLoading ? (
            <>
              <AssetSkeleton />
              <AssetSkeleton />
            </>
          ) : (
          assets.map((asset: any, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <span className="text-xs font-bold text-black">{asset.name}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{asset.name}</p>
                      <p className="text-xs text-gray-400">{parseFloat(asset.price).toFixed(2)}</p>                    
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {asset.balance.toFixed(4)} {asset.symbol}
                    </p>
                    <p className="text-xs text-gray-400">${asset.totalValue.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
          )}
        </div>
      </div>

      {/* Action Buttons - Pay Now and Scan QR */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button
          className="py-5 text-base font-medium bg-black text-white border border-gray-800 hover:bg-gray-900"
          onClick={() => router.push("/purchase")}
        >
          <CreditCard className="h-5 w-5 mr-2" />
          Pay Now
        </Button>
        <Button
          className="py-5 text-base font-medium bg-black text-white border border-gray-800 hover:bg-gray-900"
          onClick={() => {}}
        >
          <QrCode className="h-5 w-5 mr-2" />
          Scan QR
        </Button>
      </div>

      {/* Transactions Section - Shows recent transactions */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="payments" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-2 bg-gray-900 rounded-md p-1">
            <TabsTrigger value="payments" className="data-[state=active]:bg-gray-800">
              Recent Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-2">
              {isTransactionsLoading ? (
                <>
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                </>
              ) : transactions.length > 0 ? (
                transactions.map((transaction: any, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-400/20 flex items-center justify-center">
                        <ArrowUpRight className="h-4 w-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Sent to</p>
                        <p className="text-xs text-gray-400">{transaction.destinationAddress.slice(0, 6)}...{transaction.destinationAddress.slice(-4)}</p>
                        <p className="text-xs text-gray-400">{transaction.timestamp}</p>
                        <p className="text-xs text-gray-400">Gas: {transaction.gasCostEth.toFixed(6)} ETH</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">Tx: {transaction.transactionHash}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-400">
                        -{transaction.value} {transaction.symbol}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

