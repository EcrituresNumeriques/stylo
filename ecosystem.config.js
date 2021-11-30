const { parsed } = require('dotenv').config({ path: 'stylo.env'})

module.exports = {
  apps: [
    {
      name: "front",
      script: "vite",
      cwd: "./front/gatsby",
      env: parsed
    },
    {
      name: "export",
      script: "nodemon",
      args: "./src/app.js",
      cwd: "./export"
    },
    {
      name: "graphql",
      script: "nodemon",
      args: "--config nodemon.json app.js",
      cwd: "./graphql"
    }
  ]
}
