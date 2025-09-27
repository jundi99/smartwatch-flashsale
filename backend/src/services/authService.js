const { User } = require('../models')

class AuthService {
  constructor () {
    // In-memory user storage for simplicity
    // In production, this would be a database
    this.users = new Map()
  }

  async login (email) {
    // For demo purposes, we create users on the fly
    const userId = `user_${email.replace(/[@.]/g, '_')}`
    const user = new User(userId, email)

    // Store user in memory
    this.users.set(userId, user)

    return user
  }

  async getUserById (userId) {
    return this.users.get(userId) || null
  }

  // For testing purposes
  clearUsers () {
    this.users.clear()
  }
}

// Singleton instance
const authService = new AuthService()

module.exports = authService
