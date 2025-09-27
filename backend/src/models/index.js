const SaleStatus = {
    UPCOMING: 'UPCOMING',
    ACTIVE: 'ACTIVE',
    ENDED: 'ENDED',
    SOLD_OUT: 'SOLD_OUT'
}

class Product {
    constructor(id, name, description, imageUrl, totalStock) {
        this.id = id
        this.name = name
        this.description = description
        this.imageUrl = imageUrl
        this.totalStock = totalStock
    }
}

class FlashSaleState {
    constructor(product, currentStock, status, startTime, endTime) {
        this.product = product
        this.currentStock = currentStock
        this.status = status
        this.startTime = startTime
        this.endTime = endTime
    }
}

class PurchaseResult {
    constructor(success, message, userHasPurchased = false) {
        this.success = success
        this.message = message
        this.userHasPurchased = userHasPurchased
    }
}

class User {
    constructor(id, username) {
        this.id = id
        this.username = username
    }
}

module.exports = {
    SaleStatus,
    Product,
    FlashSaleState,
    PurchaseResult,
    User
}