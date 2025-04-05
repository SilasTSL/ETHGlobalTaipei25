import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import connectDB from './config/db.js'
// import rewardsRoutes from './controller/rewardController.js'
// import paymentRoutes from './controller/paymentController.js'
// import interactionRoutes from './route/interactionRoute.js'
// import walletRoutes from './controller/walletController.js'
// import merchantRoutes from './route/merchantRoutes.js'
// import dataVaultRoutes from './route/dataVaultRoutes.js'
// import dataUsageRoutes from './controller/dataUsageController.js'
// import verificationRoutes from './controller/verificationController.js'

dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

//ROUTES
// app.use('/rewards', rewardsRoutes)
// app.use('/payment-transfer', paymentRoutes)
// app.use('/interactions', interactionRoutes)
// app.use('/merchants', merchantRoutes)
// app.use('/wallet', walletRoutes)
// app.use('/data-vault', dataVaultRoutes)
// app.use('/data-usage', dataUsageRoutes)
// app.use('/verification', verificationRoutes)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
