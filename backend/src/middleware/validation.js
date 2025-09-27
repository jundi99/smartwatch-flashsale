const validateRequest = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query }
    const { error, value } = schema.validate(data)

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      })
    }

    req.validatedData = value
    next()
  }
}

const errorHandler = (err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    })
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}

module.exports = {
  validateRequest,
  errorHandler
}
