const flashSaleService = require('../../src/services/flashSaleService')
const { SaleStatus } = require('../../src/models')

describe('FlashSaleService', () => {
    beforeEach(() => {
        flashSaleService.resetSale()
    })

    describe('getCurrentSaleState', () => {
        test('should return UPCOMING status when sale has not started', () => {
            const state = flashSaleService.getCurrentSaleState()
            expect(state.status).toBe(SaleStatus.UPCOMING)
            expect(state.currentStock).toBe(5)
            expect(state.product).toBeDefined()
            expect(state.startTime).toBeGreaterThan(Date.now())
        })

        test('should return correct product information', () => {
            const state = flashSaleService.getCurrentSaleState()
            expect(state.product.id).toBe('prod_123')
            expect(state.product.name).toBe('Smart Watch New in 2025')
            expect(state.product.totalStock).toBe(5)
        })
    })

    describe('attemptPurchase', () => {
        test('should fail when sale has not started', () => {
            const result = flashSaleService.attemptPurchase('user_1')
            expect(result.success).toBe(false)
            expect(result.message).toBe('The sale is not active.')
        })

        test('should prevent duplicate purchases by same user', async () => {
            // Wait for sale to start
            await new Promise(resolve => setTimeout(resolve, 1100))

            const result1 = flashSaleService.attemptPurchase('user_1')
            expect(result1.success).toBe(true)

            const result2 = flashSaleService.attemptPurchase('user_1')
            expect(result2.success).toBe(false)
            expect(result2.message).toBe('You have already purchased this item.')
            expect(result2.userHasPurchased).toBe(true)
        })

        test('should handle stock depletion correctly', async () => {
            // Wait for sale to start
            await new Promise(resolve => setTimeout(resolve, 1100))

            // Purchase all available stock
            for (let i = 1; i <= 5; i++) {
                const result = flashSaleService.attemptPurchase(`user_${i}`)
                expect(result.success).toBe(true)
            }

            // Next purchase should fail
            const result = flashSaleService.attemptPurchase('user_6')
            expect(result.success).toBe(false)
            expect(result.message).toBe('Sorry, the item is sold out.')
        })
    })

    describe('hasUserPurchased', () => {
        test('should return false for users who have not purchased', () => {
            const hasPurchased = flashSaleService.hasUserPurchased('user_1')
            expect(hasPurchased).toBe(false)
        })

        test('should return true for users who have purchased', async () => {
            // Wait for sale to start
            await new Promise(resolve => setTimeout(resolve, 1100))

            flashSaleService.attemptPurchase('user_1')
            const hasPurchased = flashSaleService.hasUserPurchased('user_1')
            expect(hasPurchased).toBe(true)
        })
    })

    describe('getStats', () => {
        test('should return correct statistics', async () => {
            // Wait for sale to start
            await new Promise(resolve => setTimeout(resolve, 1100))

            // Make some purchases
            flashSaleService.attemptPurchase('user_1')
            flashSaleService.attemptPurchase('user_2')

            const stats = flashSaleService.getStats()
            expect(stats.totalPurchases).toBe(2)
            expect(stats.remainingStock).toBe(3)
            expect(stats.uniqueUsers).toBe(2)
        })
    })
})