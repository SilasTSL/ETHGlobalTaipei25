import {
  sendPaymentTransaction,
  sendBridgePaymentTransaction,
} from '../service/paymentService.js'
import { logInfluencePreRewardEvent } from '../service/smartContract/PreRewardLoggingService.js'
import express from 'express'
import PurchaseTransaction from '../model/PurchaseTransactions.js'
import sessionMiddleware from '../middleware/session.js'
import { EnsService } from '../service/web3/ensService.js'

const router = express.Router()

router.use(sessionMiddleware)
/* Controller for handling payments on the same chain. Only ETHEREUM is supported */
router.post('/same-chain', async (req, res) => {
  try {
    const {
      destinationEnsName,
      amount,
      chainsInvolved,
      txDetails,
      tokenToTransfer,
    } = req.body
    const { pk: privateKey } = req.session.user

    const destinationAddress =
      await EnsService.resolveEnsName(destinationEnsName)
    const { sourceAddress, txHash } = await sendPaymentTransaction(
      destinationAddress,
      amount.toString(),
      chainsInvolved,
      tokenToTransfer,
      privateKey,
    )
    logInfluencePreRewardEvent(txHash, sourceAddress, txDetails) //LOGS TO THE SMART CONTRACT to trigger Noddit Callback
    PurchaseTransaction.create({
      userWalletAddress: sourceAddress,
      txHash: txHash,
      blockchain: chainsInvolved.split('_')[0],
    })

    return res.json({
      sourceAddress: destinationEnsName,
      destinationAddress,
      txHash,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/* Controller for handling payments across chains. Currently only USDC is supported */
router.post('/bridge', async (req, res) => {
  try {
    const {
      destinationEnsName,
      amount,
      chainsInvolved,
      tokenToTransfer,
      txDetails,
    } = req.body
    const destinationAddress =
      await EnsService.resolveEnsName(destinationEnsName)

    const { pk: privateKey } = req.session.user
    const { sourceAddress, txHash, mintTxHash } =
      await sendBridgePaymentTransaction(
        destinationAddress,
        amount,
        chainsInvolved,
        tokenToTransfer,
        privateKey,
      )

    logInfluencePreRewardEvent(txHash, sourceAddress, txDetails) //LOGS TO THE SMART CONTRACT to trigger Noddit Callback
    PurchaseTransaction.create({
      userWalletAddress: sourceAddress,
      txHash: txHash,
      blockchain: chainsInvolved.split('_')[0], //TODO: Take the second chain for now as the transaction is the minting transaction on destination chain
    })

    return res.json({
      sourceAddress: destinationEnsName,
      destinationAddress,
      txHash,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
