module.exports = (args, req) => {
  if (req.user) {
    console.log(req.user, args.user)
    if (req.user.admin === true || req.user._id === args.user) {
      // user has access
      return true
    }

    throw new Error("Forbidden")
  }

  throw new Error('Not Authenticated')
}
