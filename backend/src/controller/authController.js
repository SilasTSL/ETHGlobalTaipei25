import express from 'express'
import { getFirstPrivateKey } from '../helper/pkGenerator.js'
import User from '../model/User.js'
import { EnsService } from '../service/web3/ensService.js'
import { registerEnsName } from '../helper/ensRegistrar.js'
import { privateKeyToAccount } from 'viem/accounts'
import { generateMnemonic } from 'bip39'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

// 1. Register new user
router.post('/register', async (req, res) => {
  const { seedphrase, ensName } = req.body
  const pk = getFirstPrivateKey(seedphrase)
  const account = privateKeyToAccount(`0x${pk}`)
  const address = account.address //Address to link to the ENS name
  try {
    const userExists = await User.findOne({ seedphrase })
    if (userExists)
      return res.status(400).json({ message: 'User already exists' })

    await registerEnsName(ensName, address)

    const user = new User({ seedphrase, ensName })
    await user.save()

    const fullEnsName = ensName + '.' + process.env.ENS_TLD
    req.session.user = {
      ensName: fullEnsName,
      address: address || null,
      pk,
    }
    res
      .status(201)
      .json({ message: 'User registered', ensName: fullEnsName, address })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 2. Authenticate user
router.post('/login', async (req, res) => {
  const { seedphrase } = req.body
  try {
    const user = await User.findOne({ seedphrase })
    if (!user) return res.status(200).json({ message: 'User not found' })

    const address = await EnsService.resolveEnsName(user.ensName)

    req.session.user = {
      ensName: user.ensName,
      address: address || null,
      pk: getFirstPrivateKey(seedphrase),
    }

    res.json({ message: 'Authenticated', ensName: user.ensName, address })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 3. Check if user exists
router.post('/exists', async (req, res) => {
  const { seedphrase } = req.body
  try {
    const user = await User.findOne({ seedphrase })
    res.json({ exists: !!user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 4. Get session-based ENS name
router.get('/session', (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: 'Not logged in' })
  res.json({ ensName: req.session.user.ensName })
})

// Add this new endpoint before other routes
router.get('/generate-mnemonic', (req, res) => {
  try {
    const mnemonic = generateMnemonic()
    res.json({ mnemonic })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
