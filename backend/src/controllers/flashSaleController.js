const flashSaleService = require('../services/flashSaleService')

class FlashSaleController {
    constructor() {
        // In-memory cache for getSaleState
        this.cachedResponse = null
        this.cacheTimestamp = 0
        this.CACHE_DURATION = 1000 // 1 second in milliseconds
    }

    async getSaleState(req, res) {
        try {
            const now = Date.now()

            // Check if we have fresh cached data
            if (this.cachedResponse && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
                const etag = this.cachedResponse.etag

                // Early ETag check with cached data - no business logic execution needed!
                if (req.headers['if-none-match'] === etag) {
                    res.set({
                        'Cache-Control': 'public, max-age=1',
                        'ETag': etag
                    })
                    return res.status(304).end()
                }

                // Return cached full response - still no business logic execution!
                res.set({
                    'Cache-Control': 'public, max-age=1',
                    'ETag': etag
                })
                return res.json(this.cachedResponse.data)
            }

            // Cache expired or no cache - get fresh data (business logic executes only here)
            const saleState = flashSaleService.getCurrentSaleState()
            const etag = `"${saleState.currentStock}-${saleState.status}-${saleState.startTime}"`

            // Update cache
            this.cachedResponse = {
                etag,
                data: {
                    success: true,
                    data: saleState
                }
            }
            this.cacheTimestamp = now

            // Handle conditional requests for fresh data
            if (req.headers['if-none-match'] === etag) {
                res.set({
                    'Cache-Control': 'public, max-age=1',
                    'ETag': etag
                })
                return res.status(304).end()
            }

            res.set({
                'Cache-Control': 'public, max-age=1',
                'ETag': etag
            })

            res.json(this.cachedResponse.data)
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    async attemptPurchase(req, res) {
        try {
            const { userId } = req.validatedData

            // Simulate processing time and network latency
            const delay = Math.random() * 300 + 100 // 100-400ms
            await new Promise(resolve => setTimeout(resolve, delay))

            const result = flashSaleService.attemptPurchase(userId)

            // Clear cache if purchase was successful (state changed)
            if (result.success) {
                this.cachedResponse = null
                this.cacheTimestamp = 0
            }

            const statusCode = result.success ? 200 : 400

            res.status(statusCode).json({
                success: result.success,
                message: result.message,
                userHasPurchased: result.userHasPurchased
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'An unexpected error occurred during purchase.'
            })
        }
    }

    async checkUserPurchase(req, res) {
        try {
            const { userId } = req.validatedData

            const hasPurchased = flashSaleService.hasUserPurchased(userId)

            res.json({
                success: true,
                data: {
                    hasPurchased,
                    userId
                }
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    async getStats(req, res) {
        try {
            const stats = flashSaleService.getStats()

            res.json({
                success: true,
                data: stats
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    // For testing/admin purposes
    async resetSale(req, res) {
        try {
            flashSaleService.resetSale()

            // Clear cache after reset (state definitely changed)
            this.cachedResponse = null
            this.cacheTimestamp = 0

            res.json({
                success: true,
                message: 'Flash sale has been reset'
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
}

// Create and bind methods to maintain 'this' context
const flashSaleControllerInstance = new FlashSaleController()

module.exports = {
    getSaleState: flashSaleControllerInstance.getSaleState.bind(flashSaleControllerInstance),
    attemptPurchase: flashSaleControllerInstance.attemptPurchase.bind(flashSaleControllerInstance),
    checkUserPurchase: flashSaleControllerInstance.checkUserPurchase.bind(flashSaleControllerInstance),
    getStats: flashSaleControllerInstance.getStats.bind(flashSaleControllerInstance),
    resetSale: flashSaleControllerInstance.resetSale.bind(flashSaleControllerInstance)
}