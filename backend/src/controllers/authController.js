const authService = require('../services/authService')

class AuthController {
  async login (req, res) {
    try {
      const { email } = req.validatedData

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100))

      const user = await authService.login(email)

      res.json({
        success: true,
        data: user,
        message: 'Login successful'
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  async getUser (req, res) {
    try {
      const { userId } = req.validatedData
      const user = await authService.getUserById(userId)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      res.json({
        success: true,
        data: user
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

module.exports = new AuthController()
