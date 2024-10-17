const { checkCredentials } = require('./authResolver')
const User = require('../models/user')
const db = User.db

describe('auth resolver', () => {
  test('authenticate using username + password', async () => {
    db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true })
    await User.create({
      email: 'guillaume@domain.org',
      username: 'ggrossetie',
      displayName: 'Guillaume Grossetie',
      password: 's$cret!',
      authType: 'local',
    })
    const u = await checkCredentials({
      username: 'ggrossetie',
      password: 's$cret!'
    })
    expect(u).toMatchObject({
      email: 'guillaume@domain.org',
      username: 'ggrossetie',
      displayName: 'Guillaume Grossetie',
    })
  })
  test('authenticate using email + password', async () => {
    db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true })
    await User.create({
      email: 'guillaume@domain.org',
      username: 'ggrossetie',
      displayName: 'Guillaume Grossetie',
      password: 's$cret!',
      authType: 'local',
    })
    const u = await checkCredentials({
      username: 'guillaume@domain.org',
      password: 's$cret!'
    })
    expect(u).toMatchObject({
      email: 'guillaume@domain.org',
      username: 'ggrossetie',
      displayName: 'Guillaume Grossetie',
    })
  })
  test('authenticate using displayName + password', async () => {
    db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true })
    await User.create({
      email: 'thomas@domain.org',
      displayName: 'thomas',
      password: 'pa$$w0rd',
      authType: 'local',
    })
    const u = await checkCredentials({
      username: 'thomas',
      password: 'pa$$w0rd'
    })
    expect(u).toMatchObject({
      email: 'thomas@domain.org',
      displayName: 'thomas',
    })
  })
  test('authenticate using displayName when username is defined + password', async () => {
    db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true })
    await User.create({
      email: 'thomas@domain.org',
      username: 'tparisot',
      displayName: 'Thomas Parisot',
      password: 'pa$$w0rd',
      authType: 'local',
    })
    await expect(() => checkCredentials({
      username: 'Thomas Parisot',
      password: 'pa$$w0rd'
    })).rejects.toThrow('Unable to authenticate, please check your username and password!')
    const u = await checkCredentials({
      username: 'tparisot',
      password: 'pa$$w0rd'
    })
    expect(u).toMatchObject({
      email: 'thomas@domain.org',
      username: 'tparisot',
      displayName: 'Thomas Parisot',
    })
  })
  test('duplicate username', async () => {
    db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true })
    await User.create({
      email: 'thomas@domain.org',
      username: 'bob',
      displayName: 'Thomas Parisot',
      password: 'pa$$w0rd',
      authType: 'local',
    })
    await expect(() => User.create({
      email: 'guillaume@domain.org',
      username: 'bob', // username already exists!
      displayName: 'Guillaume Grossetie',
      password: 'pa$$w0rd',
      authType: 'local',
    })).rejects.toThrow('E11000 duplicate key error collection: stylo-tests.users index: username_1 dup key: { username: "bob" }')
  })
  test('missing username', async () => {
    db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true })
    await User.create({
      email: 'thomas@domain.org',
      displayName: 'Thomas Parisot',
      password: 'pa$$w0rd',
      authType: 'local',
    })
    await User.create({
      email: 'guillaume@domain.org',
      displayName: 'Guillaume Grossetie',
      password: 'pa$$w0rd',
      authType: 'local',
    })
    // username is unique but not mandatory!
  })
})
