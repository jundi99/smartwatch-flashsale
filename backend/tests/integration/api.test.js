const request = require('supertest')
const app = require('../../src/app')

describe('Flash Sale API Integration Tests', () => {
    let server

    beforeAll(() => {
        server = app.listen(3003)
    })

    afterAll((done) => {
        server.close(done)
    })

    describe('GET /api/health', () => {
        test('should return health status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.message).toBe('Flash Sale API is running')
            expect(response.body.uptime).toBeDefined()
        })
    })

    describe('POST /api/auth/login', () => {
        test('should login successfully with valid username', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ username: 'testuser' })
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data.username).toBe('testuser')
            expect(response.body.data.id).toBe('user_testuser')
        })

        test('should fail with invalid username', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ username: 'ab' }) // Too short
                .expect(400)

            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe('Validation error')
        })

        test('should fail with missing username', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({})
                .expect(400)

            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe('Validation error')
        })
    })

    describe('GET /api/flash-sale/state', () => {
        test('should return current flash sale state', async () => {
            const response = await request(app)
                .get('/api/flash-sale/state')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toBeDefined()
            expect(response.body.data.product).toBeDefined()
            expect(response.body.data.currentStock).toBeDefined()
            expect(response.body.data.status).toBeDefined()
        })
    })

    describe('POST /api/flash-sale/purchase', () => {
        test('should handle purchase attempt', async () => {
            const response = await request(app)
                .post('/api/flash-sale/purchase')
                .send({ userId: 'user_testuser' })

            expect(response.body.success).toBeDefined()
            expect(response.body.message).toBeDefined()
        })

        test('should fail with missing userId', async () => {
            const response = await request(app)
                .post('/api/flash-sale/purchase')
                .send({})
                .expect(400)

            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe('Validation error')
        })
    })

    describe('GET /api/flash-sale/stats', () => {
        test('should return purchase statistics', async () => {
            const response = await request(app)
                .get('/api/flash-sale/stats')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data.totalPurchases).toBeDefined()
            expect(response.body.data.remainingStock).toBeDefined()
            expect(response.body.data.uniqueUsers).toBeDefined()
        })
    })

    describe('POST /api/flash-sale/reset', () => {
        test('should reset flash sale successfully', async () => {
            const response = await request(app)
                .post('/api/flash-sale/reset')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.message).toBe('Flash sale has been reset')
        })
    })

    describe('Error handling', () => {
        test('should return 404 for non-existent endpoints', async () => {
            const response = await request(app)
                .get('/api/non-existent')
                .expect(404)

            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe('Endpoint not found')
        })
    })
})