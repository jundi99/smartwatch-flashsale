const Joi = require('joi')

const loginSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(3).max(128).optional()
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