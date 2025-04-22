const { format } = require('util')

module.exports = function resolveUserIdFromContext(args, { token, user } = {}) {
  const isAdmin = token.admin || user?.admin || false
  // This is the user we ask the data for
  const resolvedUserId = args.user || user?.id.toString() || token._id || null

  const context = [
    token.admin ? 'token.admin' : '',
    user?.admin ? 'user.admin' : '',
    args.user ? 'args.user' : '',
    token._id ? 'token._id' : '',
    user?.id ? 'user.id' : '',
  ].filter((d) => d)

  if (!token || (!isAdmin && !token._id)) {
    throw new Error(format('Unauthorized [context %s]', context))
  }

  // If admin, go ahead
  // Although, we do not guarantee any userId (it's the resolver's responsibility)
  if (isAdmin) {
    return { userId: resolvedUserId }
  }

  // Then, if regular user
  if (resolvedUserId) {
    // A user requests something for themselves:
    // - Explicit user must match token/resolved user
    if (args.user === token._id || (!args.user && resolvedUserId)) {
      return { userId: resolvedUserId }
    }

    throw new Error(format('Forbidden [context %s]', context))
  }

  throw new Error(format('Unauthorized [context %s]', context))
}
