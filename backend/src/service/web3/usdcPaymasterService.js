import dotenv from 'dotenv'
import { BasePublicClient } from './init_web3.js'
import { privateKeyToAccount } from 'viem/accounts'
import { createBundlerClient } from 'viem/account-abstraction'
import { baseSepolia } from 'viem/chains'
import {
  getContract,
  erc20Abi,
  http,
  hexToBigInt,
  encodeFunctionData,
  parseAbi,
  parseErc6492Signature,
  encodePacked,
} from 'viem'
import { toKernelSmartAccount } from 'permissionless/accounts'
import { eip2612Abi, eip2612Permit } from '../../helper/usdcPermitHelper.js'
import { parseUnits, formatUnits } from 'viem/utils'

dotenv.config()

const BASE_SEPOLIA_BUNDLER = `https://base-sepolia.g.alchemy.com/v2/3rEH846sAlOibTBd2EASp4NtW1mK1zfb`
// TODO MOVE TO .ENV
const BASE_SEPOLIA_USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

const MAX_GAS_USDC = 10000000n
const PRIVATE_KEY = process.env.MY_PRIVATE_KEY

const usdc = getContract({
  client: BasePublicClient,
  address: BASE_SEPOLIA_USDC,
  abi: [...erc20Abi, ...eip2612Abi],
})

class USDCPaymasterServiceProvider {
  account = privateKeyToAccount(`0x${PRIVATE_KEY}`)
  BASE_SEPOLIA_PAYMASTER = '0x31BE08D380A21fc740883c0BC434FcFc88740b58'
  bundlerClient = createBundlerClient({
    BasePublicClient,
    transport: http(BASE_SEPOLIA_BUNDLER),
  })
  network = 'base'

  convertUSDCToWei(amount) {
    return parseUnits(amount.toString(), 6)
  }

  async createSmartWallet(eomAcoount) {
    const account = await toKernelSmartAccount({
      client: BasePublicClient,
      owners: [eomAcoount],
      version: '0.3.1',
    })
    return account
  }

  async getUSDCBalance() {
    const { address: smartContractAddress } = await this.createSmartWallet()
    const usdcBalance = await usdc.read.balanceOf([smartContractAddress])
    console.log(`${this.constructor.name} The balance is ${usdcBalance}`)
    return usdcBalance
  }

  async getAdditionalGasCharge(paymaster) {
    const additionalGasCharge = hexToBigInt(
      (
        await BasePublicClient.call({
          to: paymaster,
          data: encodeFunctionData({
            abi: parseAbi(['function additionalGasCharge() returns (uint256)']),
            functionName: 'additionalGasCharge',
          }),
        })
      ).data,
    )
    return additionalGasCharge
  }
  //TODO: To support diferent tokens besides USDC. EG. ethereum
  createUSDCCall(destinationAddress, amount) {
    return {
      to: usdc.address,
      abi: usdc.abi,
      functionName: 'transfer',
      args: [destinationAddress, amount],
    }
  }
  /** Granting paymaster the permission to deuct from the Paymaster */
  async createPaymasterPermit(smartAccount) {
    const permitData = await eip2612Permit({
      token: usdc,
      chain: baseSepolia,
      ownerAddress: smartAccount.address,
      spenderAddress: this.BASE_SEPOLIA_PAYMASTER,
      value: MAX_GAS_USDC,
    })
    const wrappedPermitSignature = await smartAccount.signTypedData(permitData)
    const { signature } = parseErc6492Signature(wrappedPermitSignature)
    return signature
  }

  async estimateUserOperationGas(
    smartAccount,
    calls,
    paymasterData,
    additionalGasCharge,
  ) {
    console.log('this is working', additionalGasCharge)
    return await this.bundlerClient.estimateUserOperationGas({
      account: smartAccount,
      calls,
      paymaster: this.BASE_SEPOLIA_PAYMASTER,
      paymasterData,
      // Make sure to pass in the `additionalGasCharge` from the paymaster
      paymasterPostOpGasLimit: 50000n,
      // Use very low gas fees for estimation to ensure successful permit/transfer,
      // since the bundler will simulate the user op with very high gas limits
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n,
    })
  }

  async fundSmartWalletWithUSDC(smartWalletAddress, amountUSDCWei) {
    try {
      // Check if the owner has enough USDC balance
      const ownerBalance = await usdc.read.balanceOf([this.account.address])
      const smartWalletBalance = await usdc.read.balanceOf([smartWalletAddress])

      if (smartWalletBalance >= amountUSDCWei) {
        console.log(
          `Smart wallet has enough balance of ${formatUnits(smartWalletBalance, 6)}`,
        )
        return { success: true }
      }
      const requiredUSDCWei = amountUSDCWei - smartWalletBalance
      console.log(
        `[${this.constructor.name}] Funding smart wallet ${smartWalletAddress} with ${formatUnits(requiredUSDCWei, 6)} USDC`,
      )
      if (ownerBalance < requiredUSDCWei) {
        throw new Error(
          `Insufficient USDC balance. Required: ${formatUnits(requiredUSDCWei, 6)}, Available: ${formatUnits(ownerBalance, 6)}`,
        )
      }

      // Transfer USDC from owner to smart wallet
      const hash = await usdc.write.transfer(
        [smartWalletAddress, requiredUSDCWei],
        { account: this.account },
      )

      // Wait for transaction to be confirmed
      const receipt = await BasePublicClient.waitForTransactionReceipt({ hash })

      // Verify the smart wallet received the USDC
      const newBalance = await usdc.read.balanceOf([smartWalletAddress])
      console.log(
        `Smart wallet funded with ${formatUnits(requiredUSDCWei, 6)} USDC`,
      )
      console.log(`New USDC balance: ${formatUnits(newBalance, 6)}`)

      return { success: true, hash, receipt }
    } catch (error) {
      console.error(`Error funding smart wallet with USDC: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  async sendPaymentTransaction(destinationAddress, amount) {
    console.log(
      `[${this.constructor.name}] Creating Payment transaction for USDC token on ${this.network} and paying gas fees with USDC`,
    )
    const amountInWei = this.convertUSDCToWei(amount)
    const smartAccount = await this.createSmartWallet(this.account) //TODO: replace with user account in future

    const permitSignature = await this.createPaymasterPermit(smartAccount)
    const calls = [this.createUSDCCall(destinationAddress, amountInWei)]
    const paymasterData = encodePacked(
      ['uint8', 'address', 'uint256', 'bytes'],
      [
        0n, // Reserved for future use
        usdc.address, // Token address
        MAX_GAS_USDC, // Max spendable gas in USDC
        permitSignature, // EIP-2612 permit signature
      ],
    )
    //calculating additional gas charges paymaster needs for post opt
    const additionalGasCharge = await this.getAdditionalGasCharge(
      this.BASE_SEPOLIA_PAYMASTER,
    )
    // Getting gas prices from Alchemy bundler to get around pimlico issues
    const baseFee = await BasePublicClient.request({
      method: 'eth_gasPrice',
    })
    const priorityFee = await this.bundlerClient.request({
      method: 'rundler_maxPriorityFeePerGas',
    })

    // Convert hex strings to BigInt and add a buffer for safety
    const maxPriorityFeePerGas = BigInt(priorityFee) // multiply by 2 for safety
    const maxFeePerGas = BigInt(baseFee) * 2n + maxPriorityFeePerGas // base fee + priority fee

    await this.fundSmartWalletWithUSDC(
      smartAccount.address,
      amountInWei + 500000n,
    ) // HARDCODED AMOUNT TO ENSURE GAS FEES ARE AMPLE
    const {
      callGasLimit,
      preVerificationGas,
      verificationGasLimit,
      paymasterPostOpGasLimit,
      paymasterVerificationGasLimit,
    } = await this.estimateUserOperationGas(
      smartAccount,
      calls,
      paymasterData,
      additionalGasCharge,
    )
    const userOpHash = await this.bundlerClient.sendUserOperation({
      account: smartAccount,
      calls,
      callGasLimit,
      preVerificationGas,
      verificationGasLimit,
      paymaster: this.BASE_SEPOLIA_PAYMASTER,
      paymasterData,
      paymasterVerificationGasLimit,
      // Make sure that `paymasterPostOpGasLimit` is always at least
      // `additionalGasCharge`, regardless of what the bundler estimated.
      paymasterPostOpGasLimit: Math.max(
        // Number(paymasterPostOpGasLimit),
        Number(additionalGasCharge),
      ),
      maxFeePerGas,
      maxPriorityFeePerGas,
    })

    console.log('Submitted user op:', userOpHash)

    const userOpReceipt = await this.bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    })
    console.log(userOpReceipt)
    console.log(`${this.constructor.name} Done! Details:`)
    console.log('  success:', userOpReceipt.success)
    console.log(
      '  actualGasUsed:',
      formatUnits(userOpReceipt.actualGasUsed.toString(), '6'),
    )
    console.log(
      '  actualGasCost:',
      formatUnits(userOpReceipt.actualGasCost, 18),
      'ETH',
    )
    console.log('  transaction hash:', userOpReceipt.receipt.transactionHash)
    console.log(
      '  transaction gasUsed:',
      formatUnits(userOpReceipt.receipt.gasUsed.toString(), '6'),
    )
    return {
      sourceAddress: this.account.address,
      txHash: userOpReceipt.receipt.transactionHash,
    }
  }
}

const USDCPaymasterService = new USDCPaymasterServiceProvider()

export default USDCPaymasterService
