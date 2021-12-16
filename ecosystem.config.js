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
      watch: ['**/*.js'],
      env: {
        NODE_ENV: 'dev'
      }
    },
    {
      name: "graphql",
      script: "node",
      args: "app.js",
      cwd: "./graphql",
      watch: ['**/*.js'],
      env: {
        NODE_ENV: 'dev'
      }
    }
  ]
}
