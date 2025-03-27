const crypto = require('node:crypto')
let clients = []

const handleEvents = (request, response) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  }
  response.writeHead(200, headers)
  const clientId = crypto.randomUUID()
  const newClient = {
    id: clientId,
    response,
  }
  clients.push(newClient)
  request.on('close', () => {
    console.log(`${clientId} Connection closed`)
    clients = clients.filter((client) => client.id !== clientId)
  })
}

module.exports = {
  handleEvents,
}
