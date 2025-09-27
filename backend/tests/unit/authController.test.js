const authController = require('../../src/controllers/authController')
const authService = require('../../src/services/authService')

// Mock the authService
jest.mock('../../src/services/authService')

describe('AuthController', () => {
    let req, res

    beforeEach(() => {
        // Mock request and response objects
        req = {
            validatedData: {}
        }
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        }

        // Clear all mocks
        jest.clearAllMocks()
    })

    describe('login', () => {
        test('should login successfully with valid email', async () => {
            const mockUser = {
                id: 'user_test_example_com',
                email: 'test@example.com'
            }
            req.validatedData = { email: 'test@example.com' }

            authService.login.mockResolvedValue(mockUser)

            await authController.login(req, res)

            expect(authService.login).toHaveBeenCalledWith('test@example.com')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser,
                message: 'Login successful'
            })
            expect(res.status).not.toHaveBeenCalled()
        })

        test('should handle login error correctly', async () => {
            const errorMessage = 'Invalid email format'
            req.validatedData = { email: 'invalid-email' }

            authService.login.mockRejectedValue(new Error(errorMessage))

            await authController.login(req, res)

            expect(authService.login).toHaveBeenCalledWith('invalid-email')
            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            })
        })
    })

    describe('getUser', () => {
        test('should return user when user exists', async () => {
            const mockUser = {
                id: 'user_123',
                email: 'user@example.com'
            }
            req.validatedData = { userId: 'user_123' }

            authService.getUserById.mockResolvedValue(mockUser)

            await authController.getUser(req, res)

            expect(authService.getUserById).toHaveBeenCalledWith('user_123')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            })
            expect(res.status).not.toHaveBeenCalled()
        })

        test('should return 404 when user not found', async () => {
            req.validatedData = { userId: 'non_existent_user' }

            authService.getUserById.mockResolvedValue(null)

            await authController.getUser(req, res)

            expect(authService.getUserById).toHaveBeenCalledWith('non_existent_user')
            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            })
        })

        test('should handle service error correctly', async () => {
            const errorMessage = 'Database connection error'
            req.validatedData = { userId: 'user_123' }

            authService.getUserById.mockRejectedValue(new Error(errorMessage))

            await authController.getUser(req, res)

            expect(authService.getUserById).toHaveBeenCalledWith('user_123')
            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            })
        })
    })
})