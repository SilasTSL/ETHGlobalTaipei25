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
  
  // Function to fetch data usage records
  export async function fetchDataUsageRecords(ensName: string): Promise<DataRecord[]> {
    console.log('ensName in datavault', ensName)
    const userId = "0xb76d3afB4AECe9f9916EB5e727B7472b609332dE"
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/data-vault/transactions?userAddress=${userId}`);

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
      influenceScore: item.decodedInput.args[4][item.decodedInput.args[3].indexOf(userId)] / 1000 || null,
    }));


    console.log("Formatted data: ", formattedData);
    // Return mock data
    return formattedData;
  }
  
  