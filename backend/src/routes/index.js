const express = require('express')
const authRoutes = require('./auth')
const flashSaleRoutes = require('./flashSale')

const router = express.Router()

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Flash Sale API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})

// Mount route modules
router.use('/auth', authRoutes)
router.use('/flash-sale', flashSaleRoutes)

module.exports = router