# GraphQL backend

This folder is an npm workspace of the Stylo repository.
The commands below are run from the **root of the repository**: see the [main `README.md`](../README.md) for the prerequisites and the configuration (`.env` file at the root of the repository).

Before changing the GraphQL schema, read the [API conventions](CONVENTIONS.md) (in French).

## Install

```bash
npm clean-install
```

All the workspaces dependencies are installed at once, with a single `package-lock.json` at the root of the repository.
To add a dependency to the GraphQL backend:

```bash
npm install <package> -w graphql
```

## Usage (dev)

Run the server (MongoDB must be running):

```bash
npm start -w graphql
```

Database migrations ([`migrations`](migrations) folder) are applied before the server starts.
You can then start querying at [`localhost:3030/graphql`](http://localhost:3030/graphql).

To start both the GraphQL backend and the frontend, run `npm run dev`.

## Test

Tests start a MongoDB container with [Testcontainers](https://testcontainers.com/), so Docker must be running:

```bash
npm test -w graphql
```

## Generate a service token

A service token is used to communicate securely between applications.

```bash
npm run -w graphql generate-service-token --silent
```

> [!WARNING]
> It requires the `JWT_SECRET_SESSION_COOKIE` environment variable to be set, and to be the same value as the running GraphQL server.
> The variable is read from the environment, or from the `.env` file at the root of the repository.
