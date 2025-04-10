import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import connectDB from './config/db.js'
import rewardsRoutes from './controller/rewardController.js'
import paymentRoutes from './controller/paymentController.js'
import interactionRoutes from './route/interactionRoute.js'
import walletRoutes from './controller/walletController.js'
import merchantRoutes from './route/merchantRoutes.js'
import dataVaultRoutes from './route/dataVaultRoutes.js'
import dataUsageRoutes from './controller/dataUsageController.js'
import authRoutes from './controller/authController.js'
import session from 'express-session'

import verificationRoutes from './controller/verificationController.js'

dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || ['http://localhost:3001'], // Add your frontend URL(s)
  credentials: true, // This is important for cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(morgan('dev'))

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true in production, false in development
      httpOnly: true, // prevents client-side access to the cookie
      maxAge: 24 * 60 * 60 * 1000, // cookie expiry: 24 hours
    },
  }),
)

//ROUTES
app.use('/auth', authRoutes)
app.use('/rewards', rewardsRoutes)
app.use('/payment-transfer', paymentRoutes)
app.use('/interactions', interactionRoutes)
app.use('/merchants', merchantRoutes)
app.use('/wallet', walletRoutes)
app.use('/data-vault', dataVaultRoutes)
app.use('/data-usage', dataUsageRoutes)
app.use('/verification', verificationRoutes)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
