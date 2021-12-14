module.exports = (args, req) => {
  if (req.user) {
    if (req.user.admin === true || req.user.userId === args.user) {
      // user has access
      return true
    }

    throw new Error("Forbidden")
  }

  throw new Error('Not Authenticated')
}
