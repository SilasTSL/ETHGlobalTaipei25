import dotenv from 'dotenv'
import { EthereumPublicClient, EthereumWalletClient } from './init_web3.js'
import {
  parseEther,
  formatEther,
  getContract,
  erc20Abi,
  parseUnits,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

dotenv.config()

// const PRIVATE_KEY = process.env.MY_PRIVATE_KEY

const tokenToAddressMap = {
  USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
}

class EthereumServiceProvider {
  convertWeiToEther(wei) {
    return formatEther(BigInt(wei))
  }
  network = 'ETHEREUM'

  async getBalance(address) {
    try {
      const balanceWei = await EthereumPublicClient.getBalance({ address })
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
        client: EthereumPublicClient,
      })

      // Check ERC20 token balance
      const tokenBalance = await contract.read.balanceOf([address])
      if (BigInt(tokenBalance) < BigInt(amount)) {
        throw new Error('Not enough ERC20 token balance')
      }

      // Check ETH balance for gas fees
      const gasPrice = await EthereumPublicClient.getGasPrice()
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

    const gas = await EthereumPublicClient.estimateGas({
      account: sourceAddress,
      to: destinationAddress,
      value: amountInWei,
    })
    const gasPrice = await EthereumPublicClient.getGasPrice()
    const totalCost = BigInt(amountInWei) + BigInt(gasPrice) * BigInt(gas)
    await this.checkWalletBalance(sourceAddress, totalCost, 'ETH', account)
    console.log(`Estimated cost is ${formatEther(totalCost)}`)

    const txHash = await EthereumWalletClient.sendTransaction({
      account: account,
      to: destinationAddress,
      value: amountInWei,
    })

    console.log('Transaction sent:', txHash)
    const receipt = await EthereumPublicClient.waitForTransactionReceipt({
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
    const amountInWei = parseUnits(amount, 6)
    const contract = new getContract({
      address: tokenToAddressMap[tokenName],
      abi: erc20Abi,
      client: EthereumPublicClient,
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
    const gasPrice = await EthereumPublicClient.getGasPrice()
    const totalCost = BigInt(gasPrice) * BigInt(gas)
    console.log(`Estimated cost is ${formatEther(totalCost)}`)

    const txHash = await contract.write.transfer(
      [destinationAddress, amountInWei],
      { account: account },
    )

    const receipt = await EthereumPublicClient.waitForTransactionReceipt({
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

const EthereumService = new EthereumServiceProvider()

export default EthereumService
