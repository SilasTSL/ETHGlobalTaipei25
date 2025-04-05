import pckge from '@1inch/cross-chain-sdk'
import dotenv from 'dotenv'
const process = dotenv.config().parsed
import { solidityPackedKeccak256, randomBytes, Contract, Wallet } from 'ethers'

const { SDK, HashLock, PrivateKeyProviderConnector, NetworkEnum } = pckge
// TODO write formal bug for this function being inaccessible
function getRandomBytes32() {
  // for some reason the cross-chain-sdk expects a leading 0x and can't handle a 32 byte long hex string
  return '0x' + randomBytes(32).toString('hex')
}

const makerPrivateKey = process?.WALLET_KEY
const makerAddress = process?.WALLET_ADDRESS
const nodeUrl = process?.RPC_URL_ETHEREUM // suggested for ethereum https://eth.llamarpc.com
const devPortalApiKey = process?.DEV_PORTAL_KEY

// Validate environment variables
if (!makerPrivateKey || !makerAddress || !nodeUrl || !devPortalApiKey) {
  throw new Error(
    'Missing required environment variables. Please check your .env file.',
  )
}

const web3Instance = new Web3(nodeUrl)

const blockchainProvider = new PrivateKeyProviderConnector(
  makerPrivateKey,
  web3Instance,
)

const sdk = new SDK({
  url: 'https://api.1inch.dev/fusion-plus',
  authKey: devPortalApiKey,
  blockchainProvider,
})

let srcChainId = NetworkEnum.COINBASE
let dstChainId = NetworkEnum.AVALANCHE
let srcTokenAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
let dstTokenAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'

const approveABI = [
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

// Approve tokens for spending
// Approval is only required once! make sure to add logic to check allowance and approve only if needed
const tkn = new Contract(
  srcTokenAddress,
  approveABI,
  new Wallet(makerPrivateKey, nodeUrl),
)
await tkn.approve(
  '0x111111125421ca6dc452d289314280a0f8842a65', // aggregation router v6
  2n ** 256n - 1n, // unlimited allowance
)

const invert = true

if (invert) {
  const temp = srcChainId
  srcChainId = dstChainId
  dstChainId = temp

  const tempAddress = srcTokenAddress
  srcTokenAddress = dstTokenAddress
  dstTokenAddress = tempAddress
}

const params = {
  srcChainId,
  dstChainId,
  srcTokenAddress,
  dstTokenAddress,
  amount: '100000000000000000',
  enableEstimate: true,
  walletAddress: makerAddress,
}

sdk
  .getQuote(params)
  .then((quote) => {
    const secretsCount = quote.getPreset().secretsCount

    const secrets = Array.from({ length: secretsCount }).map(() =>
      getRandomBytes32(),
    )
    const secretHashes = secrets.map((x) => HashLock.hashSecret(x))

    const hashLock =
      secretsCount === 1
        ? HashLock.forSingleFill(secrets[0])
        : HashLock.forMultipleFills(
            secretHashes.map((secretHash, i) =>
              solidityPackedKeccak256(
                ['uint64', 'bytes32'],
                [i, secretHash.toString()],
              ),
            ),
          )

    console.log('Received Fusion+ quote from 1inch API')

    sdk
      .placeOrder(quote, {
        walletAddress: makerAddress,
        hashLock,
        secretHashes,
      })
      .then((quoteResponse) => {
        const orderHash = quoteResponse.orderHash

        console.log(`Order successfully placed`)

        const intervalId = setInterval(() => {
          console.log(
            `Polling for fills until order status is set to "executed"...`,
          )
          sdk
            .getOrderStatus(orderHash)
            .then((order) => {
              if (order.status === 'executed') {
                console.log(`Order is complete. Exiting.`)
                clearInterval(intervalId)
              }
            })
            .catch((error) =>
              console.error(`Error: ${JSON.stringify(error, null, 2)}`),
            )

          sdk
            .getReadyToAcceptSecretFills(orderHash)
            .then((fillsObject) => {
              if (fillsObject.fills.length > 0) {
                fillsObject.fills.forEach((fill) => {
                  sdk
                    .submitSecret(orderHash, secrets[fill.idx])
                    .then(() => {
                      console.log(
                        `Fill order found! Secret submitted: ${JSON.stringify(secretHashes[fill.idx], null, 2)}`,
                      )
                    })
                    .catch((error) => {
                      console.error(
                        `Error submitting secret: ${JSON.stringify(error, null, 2)}`,
                      )
                    })
                })
              }
            })
            .catch((error) => {
              console.error(
                `Error getting ready to accept secret fills: ${error}`,
              )
            })
        }, 5000)
      })
      .catch((error) => {
        console.dir(error, { depth: null })
      })
  })
  .catch((error) => {
    console.dir(error, { depth: null })
  })
