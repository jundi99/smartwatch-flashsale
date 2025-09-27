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

// Security middleware
app.use(helmet())

// Rate limiting - more lenient in development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit for development
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
})

// Purchase-specific rate limiting (more strict)
const purchaseLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'development' ? 50 : 10, // Higher limit for development
    message: {
        success: false,
        message: 'Too many purchase attempts, please try again later.'
    }
})

// Apply rate limiter to all routes except flash-sale state endpoint
app.use((req, res, next) => {
    if (req.path === '/api/flash-sale/state') {
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
            'GET /api/flash-sale/state',
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
        console.log(`🚀 Flash Sale API server running on port ${PORT}`)
        console.log(`📊 Environment: ${process.env.NODE_ENV}`)
        console.log(`🔗 CORS origin: ${process.env.CORS_ORIGIN}`)
    })
}

module.exports = app