const { format } = require('util')

module.exports = function resolveUserIdFromContext (args, { token, user } = {}, allowedIds = []) {
  const isAdmin = token.admin || user?.admin || false
  const resolvedUserId = args.user || user?.id.toString() || token._id || null
  const fromSharedUserId = !isAdmin && args.user !== token._id ? token._id : null

  const context = [
    token.admin ? 'token.admin' : '',
    user?.admin ? 'user.admin' : '',
    args.user ? 'args.user' : '',
    token._id ? 'token._id' : '',
    user?.id ? 'user.id' : ''
  ].filter(d => d)

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
    if ((args.user === token._id) || (!args.user && resolvedUserId)) {
      return { userId: resolvedUserId }
    }

    // A user requests something for someone else, and is not admin:
    // - allowedIds contains the list of userIds it can impersonate
    // @TODO resolve the permissions at object level (like user.isGrantedAccessBy(args.user) or workspace.isSharedWith(user) or article.isSharedWith(user))
    if (Array.isArray(allowedIds) && allowedIds.includes(token._id)) {
      return { userId: resolvedUserId, fromSharedUserId }
    }

    throw new Error(format("Forbidden [context %s]", context))
  }

  throw new Error(format('Unauthorized [context %s]', context))
}
