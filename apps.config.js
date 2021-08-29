module.exports = {
  apps: [
    {
      name: "front",
      script: "./node_modules/.bin/snowpack",
      args: "dev --config ./front/gatsby/snowpack.config.cjs"
    },
    {
      name: "export",
      script: "./node_modules/.bin/nodemon",
      args: "./export/src/app.js"
    },
    {
      name: "graphql",
      script: "./node_modules/.bin/nodemon",
      args: "--config ./graphql/nodemon.json ./graphql/app.js"
    }
  ]
}
