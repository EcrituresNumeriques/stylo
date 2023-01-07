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

## Generate a service token

A service token is used to communicate securely between applications.

```bash
npm run generate-service-token --silent
```

:warning: It requires `JWT_SECRET_SESSION_COOKIE` environment variable to be set, and to be the same value as the running GraphQL server.

```
DOTENV_CONFIG_PATH=../stylo.env NODE_OPTIONS="--require dotenv/config" npm run generate-service-token --silent
```
