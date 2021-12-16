const { parsed } = require('dotenv').config({ path: 'stylo.env'})

module.exports = {
  apps: [
    {
      name: "front",
      script: "vite",
      cwd: "./front",
      env: parsed
    },
    {
      name: "export",
      script: "node",
      args: "./src/app.js",
      cwd: "./export",
      watch: ['app.js', 'export.js', 'graphql.js', 'src'],
      env: {
        NODE_ENV: 'dev'
      }
    },
    {
      name: "graphql",
      script: "node",
      args: "app.js",
      cwd: "./graphql",
      watch: ['schema.js', 'app.js', 'helpers', 'models', 'policies', 'resolvers'],
      env: {
        NODE_ENV: 'dev'
      }
    }
  ]
}
