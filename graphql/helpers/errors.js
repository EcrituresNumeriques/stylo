class ApiError extends Error {
  constructor(type, ...errors) {
    super(...errors)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
    this.extensions = {
      date: new Date(),
      type,
      errors,
    }
  }
}

module.exports = {
  ApiError,
}
