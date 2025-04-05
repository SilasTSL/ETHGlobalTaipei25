import dotenv from 'dotenv'
import { BasePublicClient, BaseWalletClient } from './init_web3.js'
import {
  parseEther,
  formatEther,
  getContract,
  erc20Abi,
  parseUnits,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

dotenv.config()

const PRIVATE_KEY = process.env.MY_PRIVATE_KEY

const tokenToAddressMap = {
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
}
class BaseServiceProvider {
  // account = privateKeyToAccount(`0x${PRIVATE_KEY}`)
  convertWeiToEther(wei) {
    return formatEther(BigInt(wei))
  }
  network = 'BASE'

  async getBalance(address) {
    try {
      const balanceWei = await BasePublicClient.getBalance({ address })
      return balanceWei
    } catch (error) {
      throw new Error(`Failed to fetch balance: ${error.message}`)
    }
  }

  async checkWalletBalance(address, amount, tokenName, account) {
    if (tokenName === 'ETH') {
      const balance = await this.getBalance(address)
      if (BigInt(balance) < BigInt(amount)) {
        throw new Error('Not enough ETH balance')
      }
    } else {
      const contract = new getContract({
        address: tokenToAddressMap[tokenName],
        abi: erc20Abi,
        client: BasePublicClient,
      })

      // Check ERC20 token balance
      const tokenBalance = await contract.read.balanceOf([address])
      if (BigInt(tokenBalance) < BigInt(amount)) {
        throw new Error('Not enough ERC20 token balance')
      }

      // Check ETH balance for gas fees
      const gasPrice = await BasePublicClient.getGasPrice()
      const gasEstimate = await contract.estimateGas.transfer(
        [address, amount],
        { account: account.address },
      )
      const totalGasCost = BigInt(gasPrice) * BigInt(gasEstimate)
      const ethBalance = await this.getBalance(address)
      if (BigInt(ethBalance) < totalGasCost) {
        throw new Error('Not enough ETH for gas fees')
      }
    }
  }

  async sendPaymentTransaction(
    destinationAddress,
    amount,
    token = 'ETH',
    privateKey,
  ) {
    try {
      console.log(
        `[${this.constructor.name}] Creating Payment transaction for ${token} token on ${this.network}`,
      )
      const account = privateKeyToAccount(`0x${privateKey}`)
      if (token === 'ETH') {
        return await this.sendNativeTokenTransaction(
          destinationAddress,
          amount,
          account,
        )
      } else {
        return await this.sendErc20Transaction(
          destinationAddress,
          amount,
          token,
          account,
        )
      }
    } catch (error) {
      throw new Error(`Transaction failed: ${error.message}`)
    }
  }

  async sendNativeTokenTransaction(destinationAddress, amount, account) {
    const sourceAddress = account.address
    const amountInWei = parseEther(amount)

    const gas = await BasePublicClient.estimateGas({
      account: sourceAddress,
      to: destinationAddress,
      value: amountInWei,
    })
    const gasPrice = await BasePublicClient.getGasPrice()
    const totalCost = BigInt(amountInWei) + BigInt(gasPrice) * BigInt(gas)
    await this.checkWalletBalance(sourceAddress, totalCost, 'ETH')
    console.log(`Estimated cost is ${formatEther(totalCost)}`)

    const txHash = await BaseWalletClient.sendTransaction({
      account: account,
      to: destinationAddress,
      value: amountInWei,
    })

    console.log('Transaction sent:', txHash)
    const receipt = await BasePublicClient.waitForTransactionReceipt({
      hash: txHash,
    })
    const transactionFeeInWei = BigInt(receipt.gasUsed) * BigInt(gasPrice)
    const gasPriceInEth = this.convertWeiToEther(transactionFeeInWei)

    console.log(
      `Transaction confirmed: ${receipt.transactionHash} on ${[this.network]} TxFee: ${gasPriceInEth}`,
    )

    return { sourceAddress, txHash: receipt.transactionHash }
  }

  async sendErc20Transaction(destinationAddress, amount, tokenName, account) {
    const sourceAddress = account.address
    console.log('sourceAddress', sourceAddress)
    const amountInWei = parseUnits(amount, 6)
    const contract = new getContract({
      address: tokenToAddressMap[tokenName],
      abi: erc20Abi,
      client: BasePublicClient,
    })

    // Check balances before proceeding
    await this.checkWalletBalance(
      sourceAddress,
      amountInWei,
      tokenName,
      account,
    )

    const gas = await contract.estimateGas.transfer(
      [destinationAddress, amountInWei],
      {
        account: sourceAddress,
      },
    )
    const gasPrice = await BasePublicClient.getGasPrice()
    const totalCost = BigInt(gasPrice) * BigInt(gas)
    console.log(`Estimated cost is ${formatEther(totalCost)}`)

    const txHash = await contract.write.transfer(
      [destinationAddress, amountInWei],
      { account: account },
    )

    const receipt = await BasePublicClient.waitForTransactionReceipt({
      hash: txHash,
    })
    const transactionFeeInWei = BigInt(receipt.gasUsed) * BigInt(gasPrice)
    const gasPriceInEth = this.convertWeiToEther(transactionFeeInWei)

    console.log(
      `ERC-20 Transaction confirmed: ${receipt.transactionHash}. TxFee: ${gasPriceInEth}`,
    )

    return { sourceAddress, txHash: receipt.transactionHash }
  }
}

const BaseService = new BaseServiceProvider()

export default BaseService
