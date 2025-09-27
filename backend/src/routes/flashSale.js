const express = require('express')
const flashSaleController = require('../controllers/flashSaleController')
const { validateRequest } = require('../middleware/validation')
const { purchaseSchema, userIdParamSchema } = require('../validators')

const router = express.Router()

// GET /api/flash-sale/state - Get current flash sale state
router.get('/state', flashSaleController.getSaleState)

// POST /api/flash-sale/purchase - Attempt to purchase an item
router.post('/purchase', validateRequest(purchaseSchema), flashSaleController.attemptPurchase)

// GET /api/flash-sale/user/:userId/purchase - Check if user has purchased
router.get('/user/:userId/purchase', validateRequest(userIdParamSchema), flashSaleController.checkUserPurchase)

// GET /api/flash-sale/stats - Get purchase statistics
router.get('/stats', flashSaleController.getStats)

// POST /api/flash-sale/reset - Reset sale (for testing/admin)
router.post('/reset', flashSaleController.resetSale)

module.exports = router