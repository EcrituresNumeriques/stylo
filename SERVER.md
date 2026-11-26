# Server installation and operations

This page explains how to install Stylo on a server and how to run day-to-day operations on it.
To release and deploy a new version of Stylo on `stylo.huma-num.fr` and `stylo-dev.huma-num.fr`, read [`RELEASE.md`](RELEASE.md).

# Install on a server

Stylo servers are provisioned and deployed with the Ansible playbook located in the [`infrastructure`](infrastructure) folder.
This playbook is the reference installation: it installs Docker, generates the `.env` and `docker-compose.yaml` files from [`infrastructure/templates`](infrastructure/templates), and runs Stylo as a systemd service (`docker-compose-stylo`).
The [`deploy-tag`](.github/workflows/deploy-tag.yml) workflow shows how we run it in production.

> [!WARNING]
> The playbook is written for the Huma-Num servers and makes a few assumptions you will need to meet or adapt:
> - the remote user is `stylo` (with `/home/stylo` as home directory);
> - NGINX and certbot are already installed and configured on the server, the playbook only copies the NGINX configuration files;
> - a Nagios configuration is copied to `/etc/nagios/nrpe_local.cfg`.

## Prerequisites

- An Ubuntu server reachable through SSH, with NGINX, certbot and a `stylo` user allowed to use `sudo`
- On your machine: Node.js (see [`.node-version`](.node-version)) and Ansible (see the versions in [`deploy-requirements.txt`](.github/workflows/deploy-requirements.txt))

## Configure your instance

From the `infrastructure` folder:

1. Copy `inventories/prod` to `inventories/<my-instance>` and edit it: the server host (`[stylo]` section), the domain (`site`), the database name, the callback and endpoint URLs.
2. Create an encrypted vault with the secrets referenced by the inventory and the templates (`stylo_become_pass`, `jwt_secret_*`, `session_secret`, `humanid_*`, `hypothesis_client_key`, `zotero_auth_*`, `sentry_*_dsn`, `imgur_client_id`, `se_circe_*`):
   ```bash
   ansible-vault create vault-<my-instance>.yml
   ```
3. Add your NGINX configuration files in `files/`: `<site>.conf`, `export.<site>.conf` and `pandoc-api.<site>.conf`, based on the `stylo.huma-num.fr` ones.
   Add a `<env>-nagios-nrpe-local.cfg` file as well, matching the `env` variable of your inventory.

## Build the front-end and deploy

The front-end assets are built on your machine and copied to the server by the playbook.
From the root of the repository, set the `FRONT_*`, `PANDOC_EXPORT_ENDPOINT` and `ANNOTATIONS_CANONICAL_BASE_URL` variables of your instance (for instance in `.env`, see [`stylo-example.env`](stylo-example.env)).
The former `SNOWPACK_*` names are still read, with a deprecation warning, but will be removed in a future version.
Then build:

```bash
npm clean-install
npm run build -w front
```

Then run the playbook from the `infrastructure` folder, using a released version of Stylo (the matching Docker images are pulled from ghcr.io):

```bash
ansible-playbook -i inventories/<my-instance> \
  --extra-vars "@vault-<my-instance>.yml" \
  --extra-vars "app_version=X.Y.Z" \
  --extra-vars "assets_path=../front/build/" \
  --ask-vault-pass \
  playbook.yml
```

Run the same command again to upgrade to a new version.

# Operations

On the servers, the Docker Compose project lives in `~/stylo`.
The commands below use the production database name (`stylo-prod`); use `stylo-dev` on the dev server.

## Database operations

### Backup

```bash
docker exec mongodb-stylo sh -c 'mongodump --archive --db stylo-prod' > stylo-prod.dump
```

### Restore

```bash
docker exec -i mongodb-stylo sh -c 'mongorestore --archive' < stylo-prod.dump
docker exec mongodb-stylo mongosh --quiet --eval "db.adminCommand({listDatabases: 1}).databases.map(n => n.name)"
# ['admin', 'config', 'local', 'stylo-prod']
```

**NOTE**: If you need to rename the database during the import, you can use `--nsFrom` and `--nsTo`.
For instance, if we want to rename the database from `stylo` to `stylo-prod`, we can use:

```bash
docker exec -i mongodb-stylo sh -c 'mongorestore --archive --nsFrom="stylo.*" --nsTo="stylo-prod.*"' < stylo-prod.dump
```

### Migrations

Database migrations are [`db-migrate`](https://db-migrate.readthedocs.io/) scripts located in [`graphql/migrations`](graphql/migrations).
They run automatically each time the `graphql-stylo` container starts.

To run them manually:

```bash
cd ~/stylo
docker compose exec graphql-stylo node ../node_modules/db-migrate/bin/db-migrate up
```

To list the pending migrations without running them:

```bash
cd ~/stylo
docker compose exec graphql-stylo node ../node_modules/.bin/db-migrate check
```

#### Dry run

`db-migrate up --dry-run` runs the `up` function of each pending migration and expects the driver to skip the writes.
The driver ([`@ggrossetie/db-migrate-mongodb`](https://github.com/ggrossetie/db-migrate-mongodb)) cannot intercept operations made on the raw MongoDB instance returned by `db._getDbInstance()`, so this method throws in dry-run mode.

Every migration that uses the raw instance must therefore return early in dry-run mode, in `up` and in `down`:

```js
exports.up = async function (db) {
  if (db.internals.dryRun) return
  const mongo = db._getDbInstance()
  // ...
}
```

A dry run is consequently limited to listing the migrations that would be processed, like `db-migrate check`.

**NOTE**: `--dry-run` requires version 2.1.0 or later of the driver.
Version 2.0.0 ignores the option, so the migrations are recorded as applied (see [ggrossetie/db-migrate-mongodb#2](https://github.com/ggrossetie/db-migrate-mongodb/issues/2)).
