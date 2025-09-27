const authService = require('../../src/services/authService')

describe('AuthService', () => {
    beforeEach(() => {
        authService.clearUsers()
    })

    describe('login', () => {
        test('should create user successfully with valid email', async () => {
            const user = await authService.login('test@example.com')

            expect(user).toBeDefined()
            expect(user.id).toBe('user_test_example_com')
            expect(user.email).toBe('test@example.com')
        })
    })

    describe('getUserById', () => {
        test('should return user if exists', async () => {
            const createdUser = await authService.login('test@example.com')
            const retrievedUser = await authService.getUserById(createdUser.id)

            expect(retrievedUser).toEqual(createdUser)
        })

        test('should return null for non-existent user', async () => {
            const user = await authService.getUserById('non_existent_user')
            expect(user).toBeNull()
        })
    })
})