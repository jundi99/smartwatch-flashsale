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

        test('should reinitialize sale when saleData is null', () => {
            // Force saleData to null to test reinitialization
            flashSaleService.saleData = null

            const state = flashSaleService.getCurrentSaleState()
            expect(flashSaleService.saleData).not.toBeNull()
            expect(state.status).toBe(SaleStatus.UPCOMING)
            expect(state.currentStock).toBe(5)
        })

        test('should reinitialize sale when current sale has ended', () => {
            // Manually set sale times to past
            const now = Date.now()
            flashSaleService.saleData = {
                saleStartTime: now - 10000, // 10 seconds ago
                saleEndTime: now - 5000,    // 5 seconds ago
                currentStock: 3,
                userPurchases: new Set(['user_1'])
            }

            const state = flashSaleService.getCurrentSaleState()
            // Should have reinitialized with fresh data
            expect(state.currentStock).toBe(5) // Reset to full stock
            expect(state.startTime).toBeGreaterThan(now) // New future start time
            expect(state.status).toBe(SaleStatus.UPCOMING)
        })

        test('should return ENDED status when sale time has passed', () => {
            const baseTime = 1000000
            // Set sale times
            flashSaleService.saleData = {
                saleStartTime: baseTime,     // Start at base time
                saleEndTime: baseTime + 1000, // End 1 second later
                currentStock: 3,
                userPurchases: new Set()
            }

            // Mock Date.now to return a time just after sale ended
            const originalDateNow = Date.now
            Date.now = jest.fn(() => baseTime + 1001) // Just 1ms after end time

            // Mock initializeSale to prevent reinitialization
            const initializeSaleSpy = jest.spyOn(flashSaleService, 'initializeSale').mockImplementation(() => { })

            const state = flashSaleService.getCurrentSaleState()
            expect(state.status).toBe(SaleStatus.ENDED)

            // Restore mocks
            Date.now = originalDateNow
            initializeSaleSpy.mockRestore()
        })

        test('should return SOLD_OUT status when stock is depleted', () => {
            const now = Date.now()
            // Set sale to be active but with no stock
            flashSaleService.saleData = {
                saleStartTime: now - 10000, // Started 10 seconds ago
                saleEndTime: now + 50000,   // Ends in 50 seconds (active)
                currentStock: 0,
                userPurchases: new Set()
            }

            const state = flashSaleService.getCurrentSaleState('user_new')
            expect(state.status).toBe(SaleStatus.SOLD_OUT)
        })

        test('should return PURCHASE_SUCCESS status when user bought in sold out sale', () => {
            const now = Date.now()
            const userId = 'user_purchased'
            // Set sale to be active but sold out, with user having purchased
            flashSaleService.saleData = {
                saleStartTime: now - 10000, // Started 10 seconds ago
                saleEndTime: now + 50000,   // Ends in 50 seconds (active)
                currentStock: 0,
                userPurchases: new Set([userId])
            }

            const state = flashSaleService.getCurrentSaleState(userId)
            expect(state.status).toBe(SaleStatus.PURCHASE_SUCCESS)
        })

        test('should return ACTIVE status when sale is running with stock', () => {
            const now = Date.now()
            // Set sale to be active with stock available
            flashSaleService.saleData = {
                saleStartTime: now - 10000, // Started 10 seconds ago
                saleEndTime: now + 50000,   // Ends in 50 seconds (active)
                currentStock: 3,
                userPurchases: new Set()
            }

            const state = flashSaleService.getCurrentSaleState('user_new')
            expect(state.status).toBe(SaleStatus.ACTIVE)
            expect(state.currentStock).toBeGreaterThan(0)
        })
    })

    describe('attemptPurchase', () => {
        test('should fail when sale has not started', () => {
            const result = flashSaleService.attemptPurchase('user_1')
            expect(result.success).toBe(false)
            expect(result.message).toBe('The sale is not active.')
        })

        test('should prevent duplicate purchases by same user', () => {
            const now = Date.now()
            // Set sale to be active
            flashSaleService.saleData = {
                saleStartTime: now - 10000,
                saleEndTime: now + 50000,
                currentStock: 5,
                userPurchases: new Set()
            }

            const result1 = flashSaleService.attemptPurchase('user_1')
            expect(result1.success).toBe(true)

            const result2 = flashSaleService.attemptPurchase('user_1')
            expect(result2.success).toBe(false)
            expect(result2.message).toBe('You have already purchased this item.')
            expect(result2.userHasPurchased).toBe(true)
        })

        test('should handle stock depletion correctly', () => {
            const now = Date.now()
            // Set sale to be active
            flashSaleService.saleData = {
                saleStartTime: now - 10000,
                saleEndTime: now + 50000,
                currentStock: 5,
                userPurchases: new Set()
            }

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

        test('should return true for users who have purchased', () => {
            const now = Date.now()
            // Set sale to be active
            flashSaleService.saleData = {
                saleStartTime: now - 10000,
                saleEndTime: now + 50000,
                currentStock: 5,
                userPurchases: new Set()
            }

            flashSaleService.attemptPurchase('user_1')
            const hasPurchased = flashSaleService.hasUserPurchased('user_1')
            expect(hasPurchased).toBe(true)
        })

        test('should return false when saleData is null', () => {
            // Set saleData to null
            flashSaleService.saleData = null

            const hasPurchased = flashSaleService.hasUserPurchased('user_1')
            expect(hasPurchased).toBe(false)
        })
    })

    describe('getStats', () => {
        test('should return correct statistics', () => {
            const now = Date.now()
            // Set sale to be active
            flashSaleService.saleData = {
                saleStartTime: now - 10000,
                saleEndTime: now + 50000,
                currentStock: 5,
                userPurchases: new Set()
            }

            // Make some purchases
            flashSaleService.attemptPurchase('user_1')
            flashSaleService.attemptPurchase('user_2')

            const stats = flashSaleService.getStats()
            expect(stats.totalPurchases).toBe(2)
            expect(stats.remainingStock).toBe(3)
            expect(stats.uniqueUsers).toBe(2)
        })

        test('should return default statistics when saleData is null', () => {
            // Set saleData to null
            flashSaleService.saleData = null

            const stats = flashSaleService.getStats()
            expect(stats.totalPurchases).toBe(0)
            expect(stats.remainingStock).toBe(5) // Should return product's total stock
            expect(stats.uniqueUsers).toBe(0)
        })
    })

    describe('listAllPurchases', () => {
        test('should return empty array when no purchases made', () => {
            flashSaleService.resetSale()

            const purchases = flashSaleService.listAllPurchases()
            expect(Array.isArray(purchases)).toBe(true)
            expect(purchases.length).toBe(0)
        })

        test('should return array of user IDs who made purchases', () => {
            const now = Date.now()
            // Set sale to be active
            flashSaleService.saleData = {
                saleStartTime: now - 10000,
                saleEndTime: now + 50000,
                currentStock: 5,
                userPurchases: new Set()
            }

            // Make some purchases
            flashSaleService.attemptPurchase('user_1')
            flashSaleService.attemptPurchase('user_2')
            flashSaleService.attemptPurchase('user_3')

            const purchases = flashSaleService.listAllPurchases()
            expect(Array.isArray(purchases)).toBe(true)
            expect(purchases.length).toBe(3)
            expect(purchases).toContain('user_1')
            expect(purchases).toContain('user_2')
            expect(purchases).toContain('user_3')
        })

        test('should return empty array when saleData is null', () => {
            // Set saleData to null
            flashSaleService.saleData = null

            const purchases = flashSaleService.listAllPurchases()
            expect(Array.isArray(purchases)).toBe(true)
            expect(purchases.length).toBe(0)
        })
    })
})