module.exports = (args, req, allowedIds = []) => {
  if (req.user) {
    if (req.user.admin === true || String(req.user._id) === args.user || allowedIds.includes(args.user)) {
      // user has access
      return true
    }

    throw new Error("Forbidden")
  }

  throw new Error('Not Authenticated')
}
