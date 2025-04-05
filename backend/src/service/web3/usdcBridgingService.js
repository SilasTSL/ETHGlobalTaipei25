import dotenv from 'dotenv'
import {
  pad,
  encodeFunctionData,
  parseUnits,
  erc20Abi,
  getContract,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import axios from 'axios'
import {
  EthereumWalletClient,
  EthereumPublicClient,
  BaseWalletClient,
  BasePublicClient,
} from './init_web3.js'

dotenv.config()
class USDCBridgingServiceProvider {
  maxFee = 500000n

  constructor(
    usdcContractAddress,
    tokenMessenger,
    messageTransmitter,
    sourceChainDomain,
    destinationChainDomain,
    sourceWalletClient,
    sourcePublicClient,
    destinationWalletClient,
  ) {
    this.usdcContractAddress = usdcContractAddress
    this.tokenMessenger = tokenMessenger
    this.messageTransmitter = messageTransmitter
    this.sourceChainDomain = sourceChainDomain
    ;(this.destinationChainDomain = destinationChainDomain),
      (this.sourceWalletClient = sourceWalletClient),
      (this.sourcePublicClient = sourcePublicClient),
      (this.destinationWalletClient = destinationWalletClient)
    this.serviceName = sourceChainDomain === 0 ? 'ETH->BASE' : 'BASE->ETH'
  }

  async checkBalancesForApproveAndBurn(destinationAddress, amount, account) {
    try {
      console.log(
        `${[this.serviceName]} Checking USDC & Eth balances for minting and approval`,
      )
      const usdcContract = new getContract({
        address: this.usdcContractAddress,
        abi: erc20Abi,
        client: this.sourceWalletClient,
      })

      const usdcBalance = await usdcContract.read.balanceOf([account.address])
      if (BigInt(usdcBalance) < amount) {
        throw new Error('Not enough USDC balance for burning')
      }

      // Check ETH balance for gas fees for both transactions
      const { maxFeePerGas } =
        await this.sourcePublicClient.estimateFeesPerGas()
      // Estimate gas for approve transaction
      const approveGasEstimate = await this.sourcePublicClient.estimateGas({
        account: account.address,
        to: this.usdcContractAddress,
        data: encodeFunctionData({
          abi: [
            {
              type: 'function',
              name: 'approve',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' },
              ],
              outputs: [{ name: '', type: 'bool' }],
            },
          ],
          functionName: 'approve',
          args: [this.tokenMessenger, 10_000_000_000n],
        }),
      })

      // Estimate gas for burn transaction
      const burnGasEstimate = await this.sourcePublicClient.estimateGas({
        account: account.address,
        to: this.tokenMessenger,
        data: encodeFunctionData({
          abi: [
            {
              type: 'function',
              name: 'depositForBurn',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'amount', type: 'uint256' },
                { name: 'destinationDomain', type: 'uint32' },
                { name: 'mintRecipient', type: 'bytes32' },
                { name: 'burnToken', type: 'address' },
                { name: 'destinationCaller', type: 'bytes32' },
                { name: 'maxFee', type: 'uint256' },
                { name: 'minFinalityThreshold', type: 'uint32' },
              ],
              outputs: [],
            },
          ],
          functionName: 'depositForBurn',
          args: [
            amount,
            this.destinationChainDomain,
            pad(destinationAddress, { size: 32 }),
            this.usdcContractAddress,
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            this.maxFee,
            1000,
          ],
        }),
      })

      const totalGasCost =
        BigInt(maxFeePerGas) *
        (BigInt(approveGasEstimate) + BigInt(burnGasEstimate))
      const ethBalance = await this.sourcePublicClient.getBalance({
        address: account.address,
      })
      if (BigInt(ethBalance) < totalGasCost) {
        throw new Error('Not enough ETH for gas fees')
      }
      console.log(
        `${[this.serviceName]} Enough Eth for gas fees in source wallet. Proceeding with bridging.`,
      )
    } catch (error) {
      throw new Error(`Balance check failed: ${error.message}`)
    }
  }

  async approveUSDC(account) {
    console.log(`[${this.serviceName}] Approving USDC transfer...`)
    const approveTx = await this.sourceWalletClient.sendTransaction({
      account: account,
      to: this.usdcContractAddress,
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'approve',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'approve',
        args: [this.tokenMessenger, 10_000_000_000n], //max allowance
      }),
    })
    console.log(`USDC Approval Tx: ${approveTx}`)
  }

  async burnUSDC(destinationAddress, amount, account) {
    console.log('Burning USDC on source blockchain...')

    // DEBUGGING BASE TO ETH BRIDGING
    const transactionCount = await this.sourcePublicClient.getTransactionCount({
      address: account.address,
    })
    const gasPrice = await this.sourcePublicClient.getGasPrice()

    const DESTINATION_CALLER_BYTES32 =
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    const burnTx = await this.sourceWalletClient.sendTransaction({
      account: account,
      to: this.tokenMessenger,
      gasPrice: gasPrice * 2n, // To speed up the transaction
      nonce: transactionCount,
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'depositForBurn',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'amount', type: 'uint256' },
              { name: 'destinationDomain', type: 'uint32' },
              { name: 'mintRecipient', type: 'bytes32' },
              { name: 'burnToken', type: 'address' },
              { name: 'destinationCaller', type: 'bytes32' },
              { name: 'maxFee', type: 'uint256' },
              { name: 'minFinalityThreshold', type: 'uint32' },
            ],
            outputs: [],
          },
        ],
        functionName: 'depositForBurn',
        args: [
          amount,
          this.destinationChainDomain,
          pad(destinationAddress, { size: 32 }),
          this.usdcContractAddress,
          DESTINATION_CALLER_BYTES32,
          this.maxFee,
          1000,
        ],
      }),
    })
    console.log(`Burn Tx: ${burnTx}`)
    return burnTx
  }

  async retrieveAttestation(transactionHash) {
    console.log('Retrieving attestation of burnt tokens on source blockchain')
    const url = `https://iris-api-sandbox.circle.com/v2/messages/${this.sourceChainDomain}?transactionHash=${transactionHash}`
    while (true) {
      try {
        const response = await axios.get(url)
        if (response.status === 404) {
          console.log('Querying for attestation. Please wait.')
        }
        if (response.data?.messages?.[0]?.status === 'complete') {
          console.log('Attestation retrieved successfully!')
          return response.data.messages[0]
        }
        console.log('Querying for attestation. Please wait.')
        await new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (error) {
        console.error('Error fetching attestation:', error.message)
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }
  }

  async mintUSDC(attestation, account) {
    console.log('Minting USDC on destination blockchain...')
    const mintTx = await this.destinationWalletClient.sendTransaction({
      account: account,
      to: this.messageTransmitter,
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'receiveMessage',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'message', type: 'bytes' },
              { name: 'attestation', type: 'bytes' },
            ],
            outputs: [],
          },
        ],
        functionName: 'receiveMessage',
        args: [attestation.message, attestation.attestation],
      }),
    })
    console.log(
      `Bridge transaction completed, Minting transaction is: ${mintTx}`,
    )
    return mintTx
  }

  async sendPaymentTransaction(destinationAddress, amount, privateKey) {
    console.log(`[${this.serviceName}] Starting USDC bridge transaction`)
    const account = privateKeyToAccount(`0x${privateKey}`)
    const amountInWei = this.convertUSDCToWei(amount)
    await this.checkBalancesForApproveAndBurn(
      destinationAddress,
      amountInWei,
      account,
    )
    await this.approveUSDC(account)
    const burnTx = await this.burnUSDC(destinationAddress, amountInWei, account)
    const attestation = await this.retrieveAttestation(burnTx)
    const mintTx = await this.mintUSDC(attestation, account)
    console.log(`[${this.serviceName}] USDC transfer ${mintTx} completed!`)
    return {
      sourceAddress: account.address,
      txHash: burnTx,
      mintTxHash: mintTx,
    }
  }

  convertUSDCToWei(amount) {
    return parseUnits(amount.toString(), 6)
  }
}

const UsdcEthToBaseBridgingService = new USDCBridgingServiceProvider(
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // usdc contract address deployed
  '0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa', // Token Messaenger
  '0xe737e5cebeeba77efe34d4aa090756590b1ce275', // Message Transmitter
  0,
  6,
  EthereumWalletClient,
  EthereumPublicClient,
  BaseWalletClient,
)

const UsdcBaseToEthBridgingService = new USDCBridgingServiceProvider(
  '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // usdc contract address deployed
  '0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa', // Token Messaenger
  '0xe737e5cebeeba77efe34d4aa090756590b1ce275', // Message Transmitter
  6,
  0,
  BaseWalletClient,
  BasePublicClient,
  EthereumWalletClient,
)

export { UsdcEthToBaseBridgingService, UsdcBaseToEthBridgingService }
