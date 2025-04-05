import dotenv from 'dotenv'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { normalize } from 'viem/ens'

dotenv.config()

const EthereumPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.ETHEREUM_SEPOLA),
})

const mainname = 'test.jay333.eth'
const subname = 'weijiespareacc.jay333.eth'
const subname2 = 'weijie.jay333.eth'

const ensAddress = await EthereumPublicClient.getEnsAddress({
  name: normalize(subname2),
  // coinType: 2147492101, // base cointype
  // coinType: 2147568180, // base sepolia
})

console.log(ensAddress)
