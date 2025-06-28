import { MongoClient, ServerApiVersion } from 'mongodb'

import { test as teardown } from '@playwright/test'

teardown('teardown', async ({}) => {
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
    await client.db('stylo-dev').collection('users').deleteOne({
      username: 'teste2e',
    })
    console.log('teste2e user deleted successfully!')
  } finally {
    await client.close()
  }
})
