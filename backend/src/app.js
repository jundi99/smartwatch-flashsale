require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const routes = require('./routes')
const { errorHandler } = require('./middleware/validation')

const app = express()
const PORT = process.env.PORT || 3001
const { log } = console
// Security middleware
app.use(helmet())

// Rate limiting configuration based on environment
const getRateLimitConfig = () => {
  const isStressTesting = process.env.STRESS_TEST === 'true'

  if (isStressTesting) {
    return {
      general: { windowMs: 1 * 60 * 1000, max: 10000 }, // Very high for stress testing
      purchase: { windowMs: 10 * 1000, max: 1000 } // Allow many purchases for testing
    }
  } else {
    return {
      general: { windowMs: 15 * 60 * 1000, max: 100 },
      purchase: { windowMs: 1 * 60 * 1000, max: 10 }
    }
  }
}

const rateLimitConfig = getRateLimitConfig()

// General rate limiter
const limiter = rateLimit({
  windowMs: rateLimitConfig.general.windowMs,
  max: rateLimitConfig.general.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  // Skip localhost and test environments
  skip: () => {
    const isStressTesting = process.env.STRESS_TEST === 'true'
    return isStressTesting
  }
})

// Purchase-specific rate limiting
const purchaseLimiter = rateLimit({
  windowMs: rateLimitConfig.purchase.windowMs,
  max: rateLimitConfig.purchase.max,
  message: {
    success: false,
    message: 'Too many purchase attempts, please try again later.'
  },
  // Skip localhost during stress testing
  skip: () => {
    const isStressTesting = process.env.STRESS_TEST === 'true'
    return isStressTesting
  }
})

// Apply rate limiter to all routes except flash-sale state endpoint
app.use((req, res, next) => {
  if (req.path.startsWith('/api/flash-sale/state/')) {
    // Skip rate limiting for state endpoint
    return next()
  }
  return limiter(req, res, next)
})

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Apply stricter rate limiting to purchase endpoints
app.use('/api/flash-sale/purchase', purchaseLimiter)

// Routes
app.use('/api', routes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Flash Sale API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'GET /api/auth/user/:userId',
      'GET /api/flash-sale/state:userId',
      'POST /api/flash-sale/purchase',
      'GET /api/flash-sale/user/:userId/purchase',
      'GET /api/flash-sale/stats',
      'POST /api/flash-sale/reset'
    ]
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    log(`🚀 Flash Sale API server running on port ${PORT}`)
    log(`📊 Environment: ${process.env.NODE_ENV}`)
    log(`🔗 CORS origin: ${process.env.CORS_ORIGIN}`)
    log(`⚡ Stress testing: ${process.env.STRESS_TEST === 'true' ? 'ENABLED' : 'DISABLED'}`)
    log(`🛡️  Rate limits - General: ${rateLimitConfig.general.max}/window, Purchase: ${rateLimitConfig.purchase.max}/window`)
  })
}

module.exports = app
