import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

// Custom metrics
const purchaseSuccessRate = new Rate('purchase_success_rate')
const purchaseResponseTime = new Trend('purchase_response_time')

// Test configuration
export const options = {
    stages: [
        { duration: '10s', target: 10 }, // Ramp up to 10 users
        { duration: '30s', target: 50 }, // Ramp up to 50 users
        { duration: '60s', target: 100 }, // Ramp up to 100 concurrent users
        { duration: '30s', target: 200 }, // Spike to 200 users
        { duration: '60s', target: 100 }, // Stay at 100 users
        { duration: '20s', target: 0 }    // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
        purchase_success_rate: ['rate>0.1'], // At least 10% of purchases should succeed
        http_req_failed: ['rate<0.1'] // Less than 10% of requests should fail
    }
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'

// Generate unique user email for each VU
function getUserEmail() {
    return `stress_user_${__VU}_${Math.random().toString(36).substr(2, 9)}@test.com`
}

function getUserId() {
    const email = getUserEmail()
    return `user_${email.replace(/[@.]/g, '_')}`
}

export function setup() {
    // Reset the flash sale before starting the test
    const resetResponse = http.post(`${BASE_URL}/api/flash-sale/reset`)
    check(resetResponse, {
        'reset successful': (r) => r.status === 200
    })

    console.log('Flash sale reset for stress test')
    return { baseUrl: BASE_URL }
}

export default function (data) {
    const userEmail = getUserEmail()
    const userId = getUserId()

    // Test 1: Check flash sale state
    const stateResponse = http.get(`${data.baseUrl}/api/flash-sale/state/${userId}`)
    check(stateResponse, {
        'state check successful': (r) => r.status === 200,
        'state has valid structure': (r) => {
            const body = JSON.parse(r.body)
            return body.success && body.data && body.data.product
        }
    })

    sleep(0.1) // Brief pause

    // Test 2: Attempt login
    const loginPayload = JSON.stringify({
        email: userEmail
    })

    const loginResponse = http.post(`${data.baseUrl}/api/auth/login`, loginPayload, {
        headers: { 'Content-Type': 'application/json' }
    })

    check(loginResponse, {
        'login successful': (r) => r.status === 200
    })

    sleep(0.1) // Brief pause

    // Test 3: Attempt purchase (the main stress test)
    const purchasePayload = JSON.stringify({ userId })

    const purchaseStart = Date.now()
    const purchaseResponse = http.post(`${data.baseUrl}/api/flash-sale/purchase`, purchasePayload, {
        headers: { 'Content-Type': 'application/json' }
    })
    const purchaseEnd = Date.now()

    // Record purchase response time
    purchaseResponseTime.add(purchaseEnd - purchaseStart)

    const purchaseSuccess = purchaseResponse.status === 200
    purchaseSuccessRate.add(purchaseSuccess)

    check(purchaseResponse, {
        'purchase request completed': (r) => r.status === 200 || r.status === 400,
        'purchase response has message': (r) => {
            const body = JSON.parse(r.body)
            return body.message !== undefined
        }
    })

    // Log purchase results for debugging
    if (purchaseSuccess) {
        console.log(`${userEmail}: Purchase SUCCESS`)
    } else {
        const body = JSON.parse(purchaseResponse.body)
        console.log(`${userEmail}: Purchase FAILED - ${body.message}`)
    }

    sleep(0.5) // Realistic user behavior pause

    // Test 4: Check purchase status
    const checkResponse = http.get(`${data.baseUrl}/api/flash-sale/user/${userId}/purchase`)
    check(checkResponse, {
        'purchase check successful': (r) => r.status === 200
    })

    // Test 5: Get updated stats (occasional)
    if (Math.random() < 0.1) { // 10% chance
        const statsResponse = http.get(`${data.baseUrl}/api/flash-sale/stats`)
        check(statsResponse, {
            'stats check successful': (r) => r.status === 200
        })
    }
}

export function teardown(data) {
    // Get final statistics
    const finalStats = http.get(`${data.baseUrl}/api/flash-sale/stats`)
    if (finalStats.status === 200) {
        const stats = JSON.parse(finalStats.body)
        console.log('=== FINAL STRESS TEST RESULTS ===')
        console.log(`Total Purchases: ${stats.data.totalPurchases}`)
        console.log(`Remaining Stock: ${stats.data.remainingStock}`)
        console.log(`Unique Users: ${stats.data.uniqueUsers}`)
        console.log('=====================================')
    }
}