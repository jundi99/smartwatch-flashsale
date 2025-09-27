const authService = require('../../src/services/authService')

describe('AuthService', () => {
    beforeEach(() => {
        authService.clearUsers()
    })

    describe('login', () => {
        test('should create user successfully with valid username', async () => {
            const user = await authService.login('testuser')

            expect(user).toBeDefined()
            expect(user.id).toBe('user_testuser')
            expect(user.username).toBe('testuser')
        })

        test('should throw error for empty username', async () => {
            await expect(authService.login('')).rejects.toThrow('Username is required.')
        })

        test('should throw error for null username', async () => {
            await expect(authService.login(null)).rejects.toThrow('Username is required.')
        })
    })

    describe('getUserById', () => {
        test('should return user if exists', async () => {
            const createdUser = await authService.login('testuser')
            const retrievedUser = await authService.getUserById(createdUser.id)

            expect(retrievedUser).toEqual(createdUser)
        })

        test('should return null for non-existent user', async () => {
            const user = await authService.getUserById('non_existent_user')
            expect(user).toBeNull()
        })
    })
})