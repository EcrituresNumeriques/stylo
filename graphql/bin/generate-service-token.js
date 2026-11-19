const jwt = require('jsonwebtoken')

const token = jwt.sign(
  { admin: true, roles: ['read'], readonly: true },
  process.env.JWT_SECRET_SESSION_COOKIE,
  { expiresIn: '1 year' }
)

process.stdout.write(`${token}\n`)
