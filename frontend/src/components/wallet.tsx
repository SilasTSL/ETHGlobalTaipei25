"use client"

import { useState } from "react"
import { WalletIcon, QrCode, ArrowUpRight, ArrowDownLeft, Clock, Copy, ChevronRight, CreditCard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QRScanner } from "@/components/qr-scanner"
import { PaymentSuccess } from "@/components/payment-success"

// Mock transaction data
const transactionsData = [
  {
    id: 1,
    type: "sent",
    amount: "0.05 ETH",
    recipient: "0x742d...8cd5",
    date: "Today, 10:42 AM",
    status: "Completed",
  },
  {
    id: 2,
    type: "received",
    amount: "25 USDC",
    sender: "0x3f8a...2e7b",
    date: "Yesterday, 3:15 PM",
    status: "Completed",
  },
  {
    id: 3,
    type: "sent",
    amount: "0.01 ETH",
    recipient: "Coffee Shop",
    date: "Mar 15, 9:30 AM",
    status: "Completed",
  },
  {
    id: 4,
    type: "received",
    amount: "50 USDC",
    sender: "Web3 Rewards",
    date: "Mar 12, 2:20 PM",
    status: "Completed",
  },
]

export function Wallet() {
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [transactions, setTransactions] = useState(transactionsData)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState({ merchant: "", amount: "" })

  return (
    <div className="h-full bg-black text-white p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <WalletIcon className="h-6 w-6 text-primary" />
      </div>

      <Card className="bg-gradient-to-br from-primary/80 to-primary mb-6 border-0">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs text-white/70 mb-1">Total Balance</p>
              <h2 className="text-2xl font-bold text-white">$1,245.67</h2>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white/20 border-0 text-white hover:bg-white/30"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/70">
            <p className="font-mono">0x7F3a...9c4E</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-6">
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Send
            </Button>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <ArrowDownLeft className="h-4 w-4 mr-2" />
              Receive
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Assets</h3>
        <Button variant="ghost" size="sm" className="text-xs text-gray-400">
          See All
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold">ETH</span>
              </div>
              <div>
                <p className="text-sm font-medium">Ethereum</p>
                <p className="text-xs text-gray-400">ETH</p>
              </div>
            </div>
            <p className="text-lg font-bold">0.42 ETH</p>
            <p className="text-xs text-gray-400">$756.32</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-xs font-bold">USDC</span>
              </div>
              <div>
                <p className="text-sm font-medium">USD Coin</p>
                <p className="text-xs text-gray-400">USDC</p>
              </div>
            </div>
            <p className="text-lg font-bold">489.35 USDC</p>
            <p className="text-xs text-gray-400">$489.35</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Button
          variant="outline"
          className="flex flex-col h-auto py-4 bg-gray-900 border-gray-800 hover:bg-gray-800"
          onClick={() => setShowQrScanner(true)}
        >
          <QrCode className="h-5 w-5 mb-2 text-primary" />
          <span className="text-xs">Scan QR</span>
        </Button>

        <Dialog open={showQrScanner} onOpenChange={setShowQrScanner}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex flex-col h-auto py-4 bg-gray-900 border-gray-800 hover:bg-gray-800"
            >
              <CreditCard className="h-5 w-5 mb-2 text-primary" />
              <span className="text-xs">Pay</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Scan QR Code to Pay</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-4">
              <div className="w-64 h-64 bg-gray-800 flex items-center justify-center mb-4 rounded-lg">
                <QrCode className="w-16 h-16 text-gray-600" />
              </div>
              <p className="text-sm text-gray-400 text-center">
                Position the QR code within the frame to scan and make a payment
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="flex flex-col h-auto py-4 bg-gray-900 border-gray-800 hover:bg-gray-800">
          <Clock className="h-5 w-5 mb-2 text-primary" />
          <span className="text-xs">History</span>
        </Button>
      </div>

      <Tabs defaultValue="all" className="h-[calc(100%-420px)]">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="h-full">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "sent" ? "bg-red-500/20" : "bg-green-500/20"
                          }`}
                        >
                          {transaction.type === "sent" ? (
                            <ArrowUpRight
                              className={`h-4 w-4 ${transaction.type === "sent" ? "text-red-500" : "text-green-500"}`}
                            />
                          ) : (
                            <ArrowDownLeft
                              className={`h-4 w-4 ${transaction.type === "sent" ? "text-red-500" : "text-green-500"}`}
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {transaction.type === "sent" ? "Sent to" : "Received from"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {transaction.type === "sent" ? transaction.recipient : transaction.sender}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            transaction.type === "sent" ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {transaction.type === "sent" ? "-" : "+"}
                          {transaction.amount}
                        </p>
                        <p className="text-xs text-gray-400">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Status</span>
                      <span className="text-xs text-gray-300">{transaction.status}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sent" className="h-full">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {transactions
                .filter((t) => t.type === "sent")
                .map((transaction) => (
                  <Card key={transaction.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-red-500/20">
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Sent to</p>
                            <p className="text-xs text-gray-400">{transaction.recipient}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-500">-{transaction.amount}</p>
                          <p className="text-xs text-gray-400">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Status</span>
                        <span className="text-xs text-gray-300">{transaction.status}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="received" className="h-full">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {transactions
                .filter((t) => t.type === "received")
                .map((transaction) => (
                  <Card key={transaction.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-500/20">
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Received from</p>
                            <p className="text-xs text-gray-400">{transaction.sender}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-500">+{transaction.amount}</p>
                          <p className="text-xs text-gray-400">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Status</span>
                        <span className="text-xs text-gray-300">{transaction.status}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <QRScanner
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onPaymentComplete={(merchant, amount) => {
          // Add the new transaction to the list
          const newTransaction = {
            id: Date.now(),
            type: "sent",
            amount: amount,
            recipient: merchant,
            date: "Just now",
            status: "Completed",
          }
          setTransactions([newTransaction, ...transactions])

          // Show success dialog
          setPaymentDetails({ merchant, amount })
          setShowPaymentSuccess(true)
        }}
      />
      <PaymentSuccess
        isOpen={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        merchantName={paymentDetails.merchant}
        amount={paymentDetails.amount}
      />
    </div>
  )
}

