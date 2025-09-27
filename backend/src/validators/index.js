const Joi = require('joi')

const loginSchema = Joi.object({
  email: Joi.string().email().required()
})

const purchaseSchema = Joi.object({
  userId: Joi.string().required()
})

const userIdParamSchema = Joi.object({
  userId: Joi.string().required()
})

module.exports = {
  loginSchema,
  purchaseSchema,
  userIdParamSchema
}
