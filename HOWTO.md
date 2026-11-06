# How to install Stylo

Depending on your needs, you may want to install Stylo in different ways:

- To work on Stylo's code, follow the local development instructions in the [`README.md`](README.md) file.
- To run a complete Stylo instance on your machine, [use Docker Compose](#run-with-docker-compose).
- To install Stylo on a server, use the Ansible playbook as described in the [`SERVER.md`](SERVER.md) file.

## Clone git project

First step is to clone the project, you can use either the HTTPS or SSH version of the repository URL:

```bash
git clone git@github.com:EcrituresNumeriques/stylo.git
cd stylo
```

## Run with Docker Compose

Every Stylo service runs in a Docker container: MongoDB, the GraphQL API, the front-end (served by NGINX), the export service and the Pandoc API.
You need [Docker](https://docs.docker.com/engine/install/) with the Compose plugin, and Node.js (see [`.nvmrc`](.nvmrc)) to build the front-end.

Copy the configuration file:

```bash
cp stylo-example.env .env
```

Edit `.env`: the `SNOWPACK_PUBLIC_*` variables and the callback URLs must use the public URL of your instance (see [Expose Stylo](#expose-stylo)).
Then build the front-end assets, which are served by the `front-stylo` container from the `front/build` folder:

```bash
npm clean-install
npm run build -w front
```

Before the first start, set the `SE_GRAPHQL_TOKEN` variable in `.env` with the value produced by this command:

```bash
docker compose run --rm --no-deps graphql-stylo npm run generate-service-token --silent
```

Then start Stylo:

```bash
docker compose up -d
```

By default, the `latest` images are pulled from ghcr.io.
To run a released version, set the `TAG` variable (for instance `TAG=3.13.1 docker compose up -d`), or use `docker compose up -d --build` to build the images from your working copy.

The services then listen on `127.0.0.1`:

- Front-end: port 3000
- GraphQL API: port 3030
- Export service: port 3080
- Pandoc API: port 3090

## Expose Stylo

The `front-stylo` container only serves static files: a reverse proxy must route the API paths (`/graphql`, `/login`, `/events`, etc.) to the GraphQL API, and the other requests to the front-end.
The NGINX configuration files in [`infrastructure/files`](infrastructure/files) are working examples: `stylo.huma-num.fr.conf` for the application, `export.stylo.huma-num.fr.conf` and `pandoc-api.stylo.huma-num.fr.conf` for the export services.

## Next steps

Once you have an up and running Stylo instance, read the [`SERVER.md` file](SERVER.md) to run daily and maintenance operations, such as database backups and migrations.
