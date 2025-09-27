// Global test setup
process.env.NODE_ENV = 'test'
process.env.PORT = 3002
process.env.FLASH_SALE_DURATION_MS = 5000 // 5 seconds for testing
process.env.PRE_SALE_WAIT_MS = 1000 // 1 second for testing
process.env.PRODUCT_STOCK = 5

// Global test timeout
jest.setTimeout(10000)

// Clean up after tests
afterEach(() => {
    // Reset any services if needed
})