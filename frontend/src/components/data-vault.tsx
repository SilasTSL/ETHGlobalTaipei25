"use client"

import { useEffect, useState } from "react"
import { Eye, Database, Target, ShoppingBag, Shield, ExternalLink, SlidersHorizontal, Coins } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchDataUsageRecords } from "@/lib/data-vault"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/contexts/authContext"

// Types for data records
interface BaseRecord {
  id: string
  date: string
  type: string
  transactionHash: string
  rewardAmount: number
}

interface RecommendationRecord extends BaseRecord {
  type: "distributeDataRecommendationRewards"
}

interface TrainingRecord extends BaseRecord {
  type: "distributeDataTrainingRewards"
}

interface PurchaseRecord extends BaseRecord {
  type: "distributeInfluenceRewards"
  merchantType: string
  influenceScore: number
}

type DataRecord = RecommendationRecord | TrainingRecord | PurchaseRecord

export function DataVault() {
  const { ensName } = useAuth()
  const [records, setRecords] = useState<DataRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Fetch data records on component mount
  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true)
      try {
          const data = await fetchDataUsageRecords(ensName)
          setRecords(data)
      } catch (error) {
        console.error("Failed to fetch data records:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [ensName])

  // Filter records based on selected filters
  const filteredRecords = records.filter((record) => {
    if (typeFilter !== "all" && record.type !== typeFilter) return false

    if (timeFilter === "day") {
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      return new Date(record.date) >= oneDayAgo
    } else if (timeFilter === "week") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return new Date(record.date) >= oneWeekAgo
    } else if (timeFilter === "month") {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      return new Date(record.date) >= oneMonthAgo
    }

    return true
  })

  // Group records by type
  const recommendationRecords = filteredRecords.filter((record) => record.type === "distributeDataRecommendationRewards")
  const trainingRecords = filteredRecords.filter((record) => record.type === "distributeDataTrainingRewards")
  const purchaseRecords = filteredRecords.filter((record) => record.type === "distributeInfluenceRewards")

  // Calculate total rewards
  const totalRewards = filteredRecords.reduce((acc, record) => acc + Number(record.rewardAmount), 0)
  
  // Get basescan URL for a transaction hash
  const getBasescanUrl = (hash: string) => `https://sepolia.basescan.org/tx/${hash}`

  // Format transaction hash for display
  const formatHash = (hash: string) => {
    if (!hash) return ""
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`
  }

  // Render a record card based on its type
  const renderRecordCard = (record: DataRecord) => {
    const basescanUrl = getBasescanUrl(record.transactionHash)

    return (
      <Card key={record.id} className="bg-gray-900 border-gray-800 mb-3 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-full ${
                record.type === "distributeDataRecommendationRewards"
                  ? "bg-blue-500/20"
                  : record.type === "distributeDataTrainingRewards"
                    ? "bg-purple-500/20"
                    : "bg-green-500/20"
              }`}
            >
              {record.type === "distributeDataRecommendationRewards" ? (
                <Eye className={`h-4 w-4 ${record.type === "distributeDataRecommendationRewards" ? "text-blue-500" : ""}`} />
              ) : record.type === "distributeDataTrainingRewards" ? (
                <Target className={`h-4 w-4 ${record.type === "distributeDataTrainingRewards" ? "text-purple-500" : ""}`} />
              ) : (
                <ShoppingBag className={`h-4 w-4 ${record.type === "distributeInfluenceRewards" ? "text-green-500" : ""}`} />
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-medium">
                    {record.type === "distributeDataRecommendationRewards"
                      ? "Data Used for Recommendation"
                      : record.type === "distributeDataTrainingRewards"
                        ? "Data Used for Model Training"
                        : "Content Contributed to Purchase"}
                  </h4>
                  <p className="text-xs text-gray-400">{new Date(record.date).toLocaleString()}</p>
                </div>
                <Badge
                  variant={
                    record.type === "distributeDataRecommendationRewards" ? "default" : record.type === "distributeDataTrainingRewards" ? "secondary" : "outline"
                  }
                  className={
                    record.type === "distributeDataRecommendationRewards"
                      ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                      : record.type === "distributeDataTrainingRewards"
                        ? "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30"
                        : "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                  }
                >
                  {record.type === "distributeDataRecommendationRewards"
                    ? "Recommendation"
                    : record.type === "distributeDataTrainingRewards"
                      ? "Training"
                      : "Purchase"}
                </Badge>
              </div>

              {record.type === "distributeInfluenceRewards" && (
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Merchant Type</span>
                    <span className="text-xs font-medium">{(record as PurchaseRecord).merchantType}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Influence Score</span>
                    <span className="text-xs font-medium">{(record as PurchaseRecord).influenceScore}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${(record as PurchaseRecord).influenceScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">Reward</span>
                <div className="flex items-center">
                  <Coins className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-xs font-medium">{record.rewardAmount} ETH</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Transaction</span>
                <a
                  href={basescanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-primary hover:underline"
                >
                  {formatHash(record.transactionHash)}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full bg-black text-white p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Data Vault</h1>
        <Shield className="h-6 w-6 text-primary" />
      </div>

      <p className="text-sm text-gray-400 mb-6">
        View and manage how your data is being used across the platform. All data usage is transparent and recorded on
        the blockchain.
      </p>

      {/* Summary Cards */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Coins className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Total Rewards</p>
              <p className="text-xs text-gray-400">Recent</p>
            </div>
          </div>
          {isLoading ? <div className="flex items-center text-lg font-bold gap-2"><Skeleton className="h-5 w-10" /> ETH</div> : <p className="text-lg font-bold">{`${totalRewards.toFixed(5)} ETH`}</p>}
          {isLoading ? <Skeleton className="h-3 w-20" /> : <p className="text-xs text-gray-400">{`From recent most ${records.length} data usage records`}</p>}
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="flex w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="distributeDataRecommendationRewards" className="flex-1">
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="distributeDataTrainingRewards" className="flex-1">
              Training
            </TabsTrigger>
            <TabsTrigger value="distributeInfluenceRewards" className="flex-1">
              Purchases
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-gray-400">Loading data records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Database className="h-10 w-10 text-gray-600 mb-2" />
                <p className="text-sm text-gray-400">No data usage records found</p>
                <p className="text-xs text-gray-500 mt-1">Records will appear here when your data is used</p>
              </div>
            ) : (
              <div className="space-y-1 h-full">{filteredRecords.map((record) => renderRecordCard(record))}</div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="distributeDataRecommendationRewards" className="h-full">
          <ScrollArea className="h-full relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-gray-400">Loading recommendation records...</p>
              </div>
            ) : recommendationRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Eye className="h-10 w-10 text-gray-600 mb-2" />
                <p className="text-sm text-gray-400">No recommendation data usage records found</p>
                <p className="text-xs text-gray-500 mt-1">
                  Records will appear when your data is used for recommendations
                </p>
              </div>
            ) : (
              <div className="space-y-1">{recommendationRecords.map((record) => renderRecordCard(record))}</div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="distributeDataTrainingRewards" className="h-full">
          <ScrollArea className="h-full relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-gray-400">Loading training records...</p>
              </div>
            ) : trainingRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Target className="h-10 w-10 text-gray-600 mb-2" />
                <p className="text-sm text-gray-400">No model training data usage records found</p>
                <p className="text-xs text-gray-500 mt-1">
                  Records will appear when your data is used for training models
                </p>
              </div>
            ) : (
              <div className="space-y-1">{trainingRecords.map((record) => renderRecordCard(record))}</div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="distributeInfluenceRewards" className="h-full">
          <ScrollArea className="h-full relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-gray-400">Loading purchase records...</p>
              </div>
            ) : purchaseRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <ShoppingBag className="h-10 w-10 text-gray-600 mb-2" />
                <p className="text-sm text-gray-400">No purchase contribution records found</p>
                <p className="text-xs text-gray-500 mt-1">Records will appear when your content influences purchases</p>
              </div>
            ) : (
              <div className="space-y-1 h-40">{purchaseRecords.map((record) => renderRecordCard(record))}</div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

