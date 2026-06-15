# GraphQL backend

## Usage (dev)

Install all dependencies

```sh
npm install
```

Run the server

```sh
npm start
```

You can then start querying at [`localhost:3030/graphql`](http://localhost:3030/graphql).

### About `y-leveldb`

`@y/websocket-server` does an unconditional `require('y-leveldb')` when its module is loaded (`dist/utils.cjs`), even though it only declares it as an `optionalDependency`.
If `y-leveldb` (or its native dependency `leveldown`) is not installed, simply loading  the resolvers fails with `Cannot find module 'y-leveldb'`.

Because an optional dependency can be dropped from `package-lock.json` when the lockfile is regenerated (e.g. if `leveldown`'s native build fails),
we declare it as an **explicit** dependency in `package.json` to guarantee it is always installed. 
Do not remove it as long as `@y/websocket-server` requires it unconditionally.

## Generate a service token

A service token is used to communicate securely between applications.

```bash
npm run generate-service-token --silent
```

> [!WARNING]
>  It requires `JWT_SECRET_SESSION_COOKIE` environment variable to be set, and to be the same value as the running GraphQL server.

```
DOTENV_CONFIG_PATH=../.env NODE_OPTIONS="--require dotenv/config" npm run generate-service-token --silent
```
