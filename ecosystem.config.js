module.exports = {
  apps: [
    {
      name: "front",
      script: "vite",
      cwd: "./front/gatsby"
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
