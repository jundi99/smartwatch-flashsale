const flashSaleService = require('../../src/services/flashSaleService')
const { SaleStatus } = require('../../src/models')

// Mock the flashSaleService
jest.mock('../../src/services/flashSaleService')

describe('FlashSaleController', () => {
    let req, res, flashSaleController

    beforeEach(() => {
        // Clear module cache and re-require controller to ensure fresh instance
        delete require.cache[require.resolve('../../src/controllers/flashSaleController')]
        flashSaleController = require('../../src/controllers/flashSaleController')

        // Mock request and response objects
        req = {
            params: {},
            validatedData: {},
            headers: {}
        }
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            end: jest.fn().mockReturnThis()
        }

        // Clear all mocks
        jest.clearAllMocks()
    })

    describe('getSaleState', () => {
        test('should return fresh sale state and set proper headers', async () => {
            const mockSaleState = {
                currentStock: 5,
                status: SaleStatus.ACTIVE,
                startTime: 1234567890,
                product: { id: 'prod_123', name: 'Smart Watch' }
            }
            req.params = { userId: 'user_123' }

            flashSaleService.getCurrentSaleState.mockReturnValue(mockSaleState)

            await flashSaleController.getSaleState(req, res)

            expect(flashSaleService.getCurrentSaleState).toHaveBeenCalledWith('user_123')
            expect(res.set).toHaveBeenCalledWith({
                'Cache-Control': 'public, max-age=1',
                'ETag': `"${mockSaleState.currentStock}-${mockSaleState.status}-${mockSaleState.startTime}"`
            })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockSaleState
            })
        })
    })

    describe('attemptPurchase', () => {
        test('should handle successful purchase and clear cache', async () => {
            const mockResult = {
                success: true,
                message: 'Purchase successful',
                userHasPurchased: true
            }
            req.validatedData = { userId: 'user_123' }

            flashSaleService.attemptPurchase.mockReturnValue(mockResult)

            await flashSaleController.attemptPurchase(req, res)

            expect(flashSaleService.attemptPurchase).toHaveBeenCalledWith('user_123')
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Purchase successful',
                userHasPurchased: true
            })
        })

        test('should handle failed purchase', async () => {
            const mockResult = {
                success: false,
                message: 'Item sold out',
                userHasPurchased: false
            }
            req.validatedData = { userId: 'user_123' }

            flashSaleService.attemptPurchase.mockReturnValue(mockResult)

            await flashSaleController.attemptPurchase(req, res)

            expect(flashSaleService.attemptPurchase).toHaveBeenCalledWith('user_123')
            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Item sold out',
                userHasPurchased: false
            })
        })

        test('should handle service error correctly', async () => {
            const errorMessage = 'Database error'
            req.validatedData = { userId: 'user_123' }

            flashSaleService.attemptPurchase.mockImplementation(() => {
                throw new Error(errorMessage)
            })

            await flashSaleController.attemptPurchase(req, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'An unexpected error occurred during purchase.'
            })
        })
    })

    describe('checkUserPurchase', () => {
        test('should return user purchase status successfully', async () => {
            req.validatedData = { userId: 'user_123' }

            flashSaleService.hasUserPurchased.mockReturnValue(true)

            await flashSaleController.checkUserPurchase(req, res)

            expect(flashSaleService.hasUserPurchased).toHaveBeenCalledWith('user_123')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    hasPurchased: true,
                    userId: 'user_123'
                }
            })
        })

        test('should handle service error correctly', async () => {
            const errorMessage = 'Service error'
            req.validatedData = { userId: 'user_123' }

            flashSaleService.hasUserPurchased.mockImplementation(() => {
                throw new Error(errorMessage)
            })

            await flashSaleController.checkUserPurchase(req, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            })
        })
    })

    describe('getStats', () => {
        test('should return stats successfully', async () => {
            const mockStats = {
                totalPurchases: 3,
                remainingStock: 2,
                uniqueUsers: 3
            }

            flashSaleService.getStats.mockReturnValue(mockStats)

            await flashSaleController.getStats(req, res)

            expect(flashSaleService.getStats).toHaveBeenCalled()
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockStats
            })
        })

        test('should handle service error correctly', async () => {
            const errorMessage = 'Stats service error'

            flashSaleService.getStats.mockImplementation(() => {
                throw new Error(errorMessage)
            })

            await flashSaleController.getStats(req, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            })
        })
    })

    describe('resetSale', () => {
        test('should reset sale successfully', async () => {
            flashSaleService.resetSale.mockImplementation(() => { })

            await flashSaleController.resetSale(req, res)

            expect(flashSaleService.resetSale).toHaveBeenCalled()
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Flash sale has been reset'
            })
        })

        test('should handle service error correctly', async () => {
            const errorMessage = 'Reset failed'

            flashSaleService.resetSale.mockImplementation(() => {
                throw new Error(errorMessage)
            })

            await flashSaleController.resetSale(req, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            })
        })
    })

    describe('listAllPurchases', () => {
        test('should return all purchases successfully', async () => {
            const mockPurchases = ['user_1', 'user_2', 'user_3']

            flashSaleService.listAllPurchases.mockReturnValue(mockPurchases)

            await flashSaleController.listAllPurchases(req, res)

            expect(flashSaleService.listAllPurchases).toHaveBeenCalled()
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockPurchases
            })
        })

        test('should handle service error correctly', async () => {
            const errorMessage = 'Unable to retrieve purchases'

            flashSaleService.listAllPurchases.mockImplementation(() => {
                throw new Error(errorMessage)
            })

            await flashSaleController.listAllPurchases(req, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            })
        })
    })
})