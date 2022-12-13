const { parsed } = require('dotenv').config({ path: 'stylo.env'})

module.exports = {
  apps: [
    {
      name: "front",
      script: "npm",
      args: "start",
      cwd: "./front",
      env: parsed
    },
    {
      name: "export",
      script: "node",
      args: "./src/app.js",
      cwd: "export",
      watch: ['app.js', 'export.js', 'graphql.js', 'src'],
      ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'dev',
        CHOKIDAR_USEPOLLING: 1,
        ...parsed
      }
    },
    {
      name: "graphql",
      script: "node",
      args: "app.js",
      cwd: "graphql",
      watch: ['schema.js', 'app.js', 'helpers', 'models', 'policies', 'resolvers'],
      ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'dev',
        CHOKIDAR_USEPOLLING: 1,
        ...parsed
      }
    }
  ]
}
