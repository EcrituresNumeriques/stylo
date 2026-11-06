# Stylo frontend

Frontend for the site hosted at https://stylo.huma-num.fr

This folder is an npm workspace of the Stylo repository.
The commands below are run from the **root of the repository**: see the [main `README.md`](../README.md) for the prerequisites and the configuration (`.env` file, which is also read by the frontend).

## Install

```bash
npm clean-install
```

All the workspaces dependencies are installed at once, with a single `package-lock.json` at the root of the repository.
To add a dependency to the frontend:

```bash
npm install <package> -w front
```

## Develop

Start the frontend and the GraphQL API:

```bash
npm run dev
```

The frontend is available on [`localhost:3000`](http://localhost:3000) and proxies the API requests to the GraphQL server on `localhost:3030`.
To start the frontend only (the GraphQL API must be running): `npm start -w front`.

## Build

```bash
npm run build -w front
```

The assets are generated in the `front/build` folder.
To serve them locally:

```bash
npm run preview -w front
```

## Test

```bash
npm test -w front
```

End-to-end tests use [Playwright](https://playwright.dev/) and require MongoDB and the Stylo services to be running (`npm run dev`):

```bash
npm exec -w front -- playwright install chromium
npm run test:e2e -w front
```
