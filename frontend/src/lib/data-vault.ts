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
  
  // Mock data for data usage records
  const mockDataRecords: DataRecord[] = [
    // Recommendation records
    {
      id: "rec-1",
      date: "2023-04-01T14:32:15Z",
      type: "recommendation",
      transactionHash: "0x8f7e3d2a1c6b9e4f5a2d3c4b5a6d7e8f9a0b1c2d",
      rewardAmount: 0.05,
    },
    {
      id: "rec-2",
      date: "2023-04-02T09:15:22Z",
      type: "recommendation",
      transactionHash: "0x2c9a7f1b3e5d8c6a4b2e3d5f6a9c8b7d6e5f4a3",
      rewardAmount: 0.03,
    },
    {
      id: "rec-3",
      date: "2023-04-03T18:45:10Z",
      type: "recommendation",
      transactionHash: "0x6d4b9e3c1a5f8e2d7c9b3a5f7e1d9c8b7a6e5d4",
      rewardAmount: 0.07,
    },
  
    // Training records
    {
      id: "train-1",
      date: "2023-04-02T11:22:33Z",
      type: "training",
      transactionHash: "0x3e7c2b9d1f8a5e6d4c2b3a5d6e8f7c9b1a2e3d4",
      rewardAmount: 0.12,
    },
    {
      id: "train-2",
      date: "2023-04-04T15:10:05Z",
      type: "training",
      transactionHash: "0x9a4f1c8e3d7b6a5f2e9d8c7b6a5f4e3d2c1b0a9",
      rewardAmount: 0.09,
    },
    {
      id: "train-3",
      date: "2023-04-05T08:33:17Z",
      type: "training",
      transactionHash: "0x1f8d5a2e9c7b6d3f1e8a7c9d6e5f4a3b2c1d0e9",
      rewardAmount: 0.15,
    },
  
    // Purchase records
    {
      id: "purchase-1",
      date: "2023-04-03T12:45:30Z",
      type: "purchase",
      transactionHash: "0x5b2e8d7a9c6b5f4e3d2c1b0a9f8e7d6c5b4a3f2",
      rewardAmount: 0.25,
      merchantType: "Food & Beverage",
      influenceScore: 65,
    },
    {
      id: "purchase-2",
      date: "2023-04-04T17:22:10Z",
      type: "purchase",
      transactionHash: "0x7c1d4f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3",
      rewardAmount: 0.18,
      merchantType: "Electronics",
      influenceScore: 42,
    },
    {
      id: "purchase-3",
      date: "2023-04-05T09:11:45Z",
      type: "purchase",
      transactionHash: "0x4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5",
      rewardAmount: 0.32,
      merchantType: "Fashion",
      influenceScore: 78,
    },
  ]
  
  // Function to fetch data usage records
  export async function fetchDataUsageRecords(userAddress: string): Promise<DataRecord[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/data-vault/transactions?userAddress=${userAddress}`);

    const data = await response.json();

    const transactions = data.data;

    console.log("Transactions: ", transactions);

    // Format data to match the DataRecord interface
    const formattedData = transactions.map((item: any) => ({
      id: item.txHash,
      date: item.date,
      type: item.functionType,
      transactionHash: item.txHash,
      rewardAmount: item.rewardAmount,
      merchantType: item.decodedInput.args[2].merchantType || null,
      influenceScore: item.decodedInput.args[4][item.decodedInput.args[3].indexOf(userAddress)] / 1000 || null,
    }));


    console.log("Formatted data: ", formattedData);
    // Return mock data
    return formattedData;
  }
  
  