import { MongoClient, ServerApiVersion } from 'mongodb'

import { test as setup } from '@playwright/test'

setup('setup', async ({}) => {
  const uri = 'mongodb://localhost:27017/stylo-dev'
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })
  try {
    await client.connect()
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    await client.db('stylo-dev').collection('users').insertOne({
      username: 'teste2e',
      password: '$2a$10$HDlQLh3to041y0HYWEeYLef9PHa0J9g7NX8TDOo9p7n.NZ.kfIMz6',
    })
    console.log('teste2e user created successfully!')
  } finally {
    await client.close()
  }
})
