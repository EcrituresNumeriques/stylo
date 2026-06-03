const { test } = require('node:test')
const assert = require('node:assert')
const { createMemFS } = require('./memfs')

test('writeFile then readFile returns the stored buffer', async () => {
  const { promises: fs } = createMemFS()
  await fs.writeFile('/repo/text.md', 'hello')
  const data = await fs.readFile('/repo/text.md')
  assert.ok(Buffer.isBuffer(data))
  assert.equal(data.toString('utf8'), 'hello')
})

test('writeFile keeps buffers as-is', async () => {
  const { promises: fs } = createMemFS()
  const buf = Buffer.from([1, 2, 3])
  await fs.writeFile('/repo/blob', buf)
  const data = await fs.readFile('/repo/blob')
  assert.deepEqual([...data], [1, 2, 3])
})

test('readFile throws ENOENT for a missing file', async () => {
  const { promises: fs } = createMemFS()
  await assert.rejects(() => fs.readFile('/repo/missing'), (err) => {
    assert.equal(err.code, 'ENOENT')
    return true
  })
})

test('unlink removes a file', async () => {
  const { promises: fs } = createMemFS()
  await fs.writeFile('/repo/text.md', 'hello')
  await fs.unlink('/repo/text.md')
  await assert.rejects(() => fs.readFile('/repo/text.md'), { code: 'ENOENT' })
})

test('readdir lists immediate files and directories', async () => {
  const { promises: fs } = createMemFS()
  await fs.writeFile('/repo/a.md', 'a')
  await fs.writeFile('/repo/b.md', 'b')
  await fs.writeFile('/repo/sub/c.md', 'c')
  await fs.mkdir('/repo/empty')
  const entries = await fs.readdir('/repo')
  assert.deepEqual([...entries].sort(), ['a.md', 'b.md', 'empty', 'sub'])
})

test('readdir on the root handles the slash prefix', async () => {
  const { promises: fs } = createMemFS()
  await fs.writeFile('/top.txt', 'x')
  const entries = await fs.readdir('/')
  assert.ok(entries.includes('top.txt'))
  assert.ok(entries.includes('repo'))
})

test('mkdir and rmdir manage directory presence', async () => {
  const { promises: fs } = createMemFS()
  await fs.mkdir('/repo/.git')
  assert.equal((await fs.stat('/repo/.git')).isDirectory(), true)
  await fs.rmdir('/repo/.git')
  await assert.rejects(() => fs.stat('/repo/.git'), { code: 'ENOENT' })
})

test('stat reports file metadata', async () => {
  const { promises: fs } = createMemFS()
  await fs.writeFile('/repo/text.md', 'hello')
  const st = await fs.stat('/repo/text.md')
  assert.equal(st.isFile(), true)
  assert.equal(st.isDirectory(), false)
  assert.equal(st.isSymbolicLink(), false)
  assert.equal(st.size, 5)
  assert.equal(st.mode, 0o100644)
})

test('stat reports directory metadata for a registered dir', async () => {
  const { promises: fs } = createMemFS()
  const st = await fs.stat('/repo')
  assert.equal(st.isDirectory(), true)
  assert.equal(st.isFile(), false)
  assert.equal(st.mode, 0o040755)
})

test('stat infers an implicit directory from a file prefix', async () => {
  const { promises: fs } = createMemFS()
  await fs.writeFile('/repo/sub/c.md', 'c')
  const st = await fs.stat('/repo/sub')
  assert.equal(st.isDirectory(), true)
})

test('stat throws ENOENT for an unknown path', async () => {
  const { promises: fs } = createMemFS()
  await assert.rejects(() => fs.stat('/repo/nope'), { code: 'ENOENT' })
})

test('lstat behaves like stat', async () => {
  const { promises: fs } = createMemFS()
  await fs.writeFile('/repo/text.md', 'hello')
  const st = await fs.lstat('/repo/text.md')
  assert.equal(st.isFile(), true)
})

test('readlink throws EINVAL', async () => {
  const { promises: fs } = createMemFS()
  await assert.rejects(() => fs.readlink('/repo/text.md'), { code: 'EINVAL' })
})

test('separate instances do not share state', async () => {
  const { promises: a } = createMemFS()
  const { promises: b } = createMemFS()
  await a.writeFile('/repo/text.md', 'hello')
  await assert.rejects(() => b.readFile('/repo/text.md'), { code: 'ENOENT' })
})