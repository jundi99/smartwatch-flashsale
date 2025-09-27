const express = require('express')
const authController = require('../controllers/authController')
const { validateRequest } = require('../middleware/validation')
const { loginSchema, userIdParamSchema } = require('../validators')

const router = express.Router()

// POST /api/auth/login
router.post('/login', validateRequest(loginSchema), authController.login)

// GET /api/auth/user/:userId
router.get('/user/:userId', validateRequest(userIdParamSchema), authController.getUser)

module.exports = router
