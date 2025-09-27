const { Product, FlashSaleState, PurchaseResult, SaleStatus } = require('../models')

class FlashSaleService {
  constructor () {
    this.saleData = null
    this.product = new Product(
      'prod_123',
      'Smart Watch New in 2025',
      'Experience the future with the 2025 edition Smart Watch. Featuring a brand new design, enhanced battery life, and futuristic AI capabilities.',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1528&q=80',
      parseInt(process.env.PRODUCT_STOCK) || 10
    )

    this.SALE_DURATION_MS = parseInt(process.env.FLASH_SALE_DURATION_MS) || 5 * 60 * 1000 // 5 minutes
    this.PRE_SALE_WAIT_MS = parseInt(process.env.PRE_SALE_WAIT_MS) || 30 * 1000 // 30 seconds

    // Initialize sale on service creation
    this.initializeSale()
  }

  initializeSale () {
    const now = Date.now()
    const startTime = now + this.PRE_SALE_WAIT_MS

    this.saleData = {
      saleStartTime: startTime,
      saleEndTime: startTime + this.SALE_DURATION_MS,
      currentStock: this.product.totalStock,
      userPurchases: new Set() // Using Set for better performance
    }
  }

  getCurrentSaleState (userId) {
    const now = Date.now()

    // Check if current sale has ended, create new one if needed
    if (!this.saleData || now > this.saleData.saleEndTime) {
      this.initializeSale()
    }

    let status
    if (now < this.saleData.saleStartTime) {
      status = SaleStatus.UPCOMING
    } else if (now > this.saleData.saleEndTime) {
      status = SaleStatus.ENDED
    } else if (this.saleData.currentStock <= 0) {
      status = SaleStatus.SOLD_OUT

      if (this.saleData.userPurchases.has(userId)) {
        status = SaleStatus.PURCHASE_SUCCESS
      }
    } else {
      status = SaleStatus.ACTIVE
    }

    return new FlashSaleState(
      this.product,
      this.saleData.currentStock,
      status,
      this.saleData.saleStartTime,
      this.saleData.saleEndTime
    )
  }

  attemptPurchase (userId) {
    const now = Date.now()

    // Check if sale is active
    if (now < this.saleData.saleStartTime || now > this.saleData.saleEndTime) {
      return new PurchaseResult(false, 'The sale is not active.')
    }

    // Check if user already purchased
    if (this.saleData.userPurchases.has(userId)) {
      return new PurchaseResult(false, 'You have already purchased this item.', true)
    }

    // Check if sold out
    if (this.saleData.currentStock <= 0) {
      return new PurchaseResult(false, 'Sorry, the item is sold out.')
    }

    // Process purchase (atomic operation for concurrency control)
    this.saleData.currentStock--
    this.saleData.userPurchases.add(userId)

    return new PurchaseResult(true, 'Congratulations! You got one!')
  }

  hasUserPurchased (userId) {
    return this.saleData ? this.saleData.userPurchases.has(userId) : false
  }

  // For testing purposes
  resetSale () {
    this.initializeSale()
  }

  // Get purchase statistics
  getStats () {
    if (!this.saleData) {
      return {
        totalPurchases: 0,
        remainingStock: this.product.totalStock,
        uniqueUsers: 0
      }
    }

    return {
      totalPurchases: this.saleData.userPurchases.size,
      remainingStock: this.saleData.currentStock,
      uniqueUsers: this.saleData.userPurchases.size
    }
  }

  listAllPurchases () {
    return Array.from(this.saleData ? this.saleData.userPurchases : [])
  }
}

// Singleton instance for in-memory storage
const flashSaleService = new FlashSaleService()

module.exports = flashSaleService
