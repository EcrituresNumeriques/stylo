module.exports = (req) => {
  if (req.user) {
    if (req.user.admin === true) {
      return true
    }
    throw new Error('User is not an administrator')
  }
  throw new Error('Not authenticated')
}
