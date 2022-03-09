module.exports = (args, req) => {

  if (args.article === "new") {
    if (req.created && req.created.article) {
      args.article = req.created.article
    } else {
      throw new Error('No article was created in this mutation request')
    }
  }

  if (args.tag === "new") {
    if (req.created && req.created.tag) {
      args.tag = req.created.tag
    } else {
      throw new Error('No tag was created in this mutation')
    }
  }

  if (args.user === "new") {
    if (req.created && req.created.user) {
      args.user = req.created.user
    } else {
      throw new Error('No user was created in this mutation')
    }
  }

  if (args.version === "new") {
    if (req.created && req.created.version) {
      args.version = req.created.version
    } else {
      throw new Error('No version was created in this mutation')
    }
  }

  if (args.password === "new") {
    if (req.created && req.created.password) {
      args.password = req.created.password
    } else {
      throw new Error('No password was created in this mutation')
    }
  }

  if (args.token === "new") {
    if (req.created && req.created.token) {
      args.token = req.created.token
    } else {
      throw new Error('No token was created in this mutation')
    }
  }

  return args
}