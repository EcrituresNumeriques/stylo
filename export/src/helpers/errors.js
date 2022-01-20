class FindByIdNotFoundError extends Error {
  constructor (type, id) {
    super(`${type} with id: ${id} not found`)
    this.name = 'FindByIdNotFoundError'
  }
}

module.exports = {
  FindByIdNotFoundError
}
