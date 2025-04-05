import dotenv from 'dotenv'
import { BasePublicClient } from '../service/web3/init_web3.js'
import { privateKeyToAccount } from 'viem/accounts'
import axios from 'axios'

const PRIVATE_KEY = process.env.MY_PRIVATE_KEY
const account = privateKeyToAccount(`0x${PRIVATE_KEY}`)
const NODIT_API_KEY = process.env.NODIT_API_KEY
import fs from 'fs'

async function getTransactions(walletAddress) {
  const url = `https://web3.nodit.io/v1/ethereum/sepolia/blockchain/getTransactionsByAccount`
  const response = await axios.post(
    url,
    {
      accountAddress: walletAddress,
      page: 1,
      rpp: 3,
      fromBlock: 'latest',
      toBlock: 'latest',
      // withLogs: true,
      // withDecode: true,
    },
    {
      headers: {
        'X-API-KEY': NODIT_API_KEY,
        accept: 'application/json',
        'content-type': 'application/json',
      },
    },
  )
  return response.data
}

const address = '0xb76d3afB4AECe9f9916EB5e727B7472b609332dE'
const ABI = JSON.parse(fs.readFileSync('./contract/PreRewardsABI.json'))
const res = await getTransactions(address, 'BASE')
console.log(res)
// const tx = res.items.map((x) => x.logs)
// console.log(tx[0])

// async function getEvents(walletAddress) {
//   const url = `https://web3.nodit.io/v1/ethereum/sepolia/blockchain/searchEvents`
//   const response = await axios.post(
//     url,
//     {
//       accountAddress: walletAddress,
//       string: 'logInfluenceReward',
//       abi: ABI,
//       rpp: 3,
//     },
//     {
//       headers: {
//         'X-API-KEY': NODIT_API_KEY,
//         accept: 'application/json',
//         'content-type': 'application/json',
//       },
//     },
//   )
//   return response.data
// }
// try {
//   const res = await getEvents(address)
//   console.log(res)
// } catch (error) {
//   console.log(error)
//   console.log(error.response.data)
// }
