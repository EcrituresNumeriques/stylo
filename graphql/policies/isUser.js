module.exports = (args, context, allowedIds = []) => {
  if (context.user) {
    if (context.user.admin === true || String(context.user._id) === args.user || allowedIds.includes(args.user) || allowedIds.includes(context.user._id)) {
      // user has access
      return true
    }

    throw new Error("Forbidden")
  }

  throw new Error('Not Authenticated')
}
