# Server installation and operations

This page explains how to install Stylo on a server and how to run day-to-day operations on it.
To release and deploy a new version of Stylo on `stylo.huma-num.fr` and `stylo-dev.huma-num.fr`, read [`RELEASE.md`](RELEASE.md).

# Install on a server

Stylo servers are provisioned and deployed with the Ansible playbook located in the [`infrastructure`](infrastructure) folder.
This playbook is the reference installation: it installs Docker and NGINX, generates the `.env` and `docker-compose.yaml` files from [`infrastructure/templates`](infrastructure/templates), and runs Stylo as a systemd service (`docker-compose-stylo`).
The [`deploy-tag`](.github/workflows/deploy-tag.yml) workflow shows how we run it in production.

> [!WARNING]
> The playbook is written for the Huma-Num servers and makes a few assumptions you will need to meet or adapt:
> - the remote user is `stylo` (with `/home/stylo` as home directory);
> - certbot is already installed and the certificates exist on the server; the playbook installs NGINX but only copies the site configuration files;
> - a Nagios configuration is copied to `/etc/nagios/nrpe_local.cfg`.

## Prerequisites

- An Ubuntu LTS server reachable through SSH, with certbot and a `stylo` user allowed to use `sudo`
- On your machine: Node.js (see [`.nvmrc`](.nvmrc)) and Ansible (see the versions in [`deploy-requirements.txt`](.github/workflows/deploy-requirements.txt))

## Configure your instance

From the `infrastructure` folder:

1. Copy `inventories/prod` to `inventories/<my-instance>` and edit it: the server host (`[stylo]` section), the Ubuntu version of the server (`ubuntu_version`), the domain (`site`), the database name, the callback and endpoint URLs.
2. Create an encrypted vault with the secrets referenced by the inventory and the templates (`stylo_become_pass`, `jwt_secret_*`, `session_secret`, `humanid_*`, `hypothesis_client_key`, `zotero_auth_*`, `sentry_*_dsn`, `imgur_client_id`, `se_circe_*`):
   ```bash
   ansible-vault create vault-<my-instance>.yml
   ```
3. Add your NGINX configuration files in `files/`: `<site>.conf`, `export.<site>.conf` and `pandoc-api.<site>.conf`, based on the `stylo.huma-num.fr` ones.
   Add a `<env>-nagios-nrpe-local.cfg` file as well, matching the `env` variable of your inventory.

## Build the front-end and deploy

The front-end assets are built on your machine and copied to the server by the playbook.
From the root of the repository, set the `SNOWPACK_*` variables of your instance (for instance in `.env`, see [`stylo-example.env`](stylo-example.env)), then build:

```bash
npm clean-install
npm run build -w front
```

Then, from the `infrastructure` folder, check the Ubuntu version of the server (see [Ubuntu version](#ubuntu-version)):

```bash
ansible-playbook -i inventories/<my-instance> \
  --extra-vars "@vault-<my-instance>.yml" \
  --ask-vault-pass \
  os.yml
```

And run the playbook, using a released version of Stylo (the matching Docker images are pulled from ghcr.io):

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

## Ubuntu version

Each inventory declares the Ubuntu LTS version of its server with `ubuntu_version` (for instance `ubuntu_version="24.04"`).
The [`os.yml`](infrastructure/os.yml) playbook checks it, and the deployment workflows run it before `playbook.yml`:

- the server runs the declared version: nothing to do;
- the server runs a newer version: `os.yml` fails, update `ubuntu_version` in the inventory;
- the server runs an older version: `os.yml` upgrades it to the next LTS release with `do-release-upgrade`, one LTS at a time (22.04 → 24.04 → 26.04).
  It only does so with `os_upgrade=true`; otherwise it fails after the checks, before changing anything.

The upgrade backs up the database, installs the pending updates and reboots if needed, then upgrades the release (keeping the configuration files changed locally), reboots again, re-enables the Docker repository and checks the services, the containers and the HTTPS endpoint.
Stylo is down during the upgrade, which can take up to an hour.
LTS to LTS upgrades are only offered once the first point release is out (for instance 26.04.1): until then, `os.yml` stops before the upgrade.
`do-release-upgrade` disables the third-party APT sources; `os.yml` only re-enables Docker and lists the sources that are still disabled.
The upgrade logs are in `/var/log/dist-upgrade/` on the server.

To upgrade the servers:

1. Change `ubuntu_version` in `inventories/dev` and merge it on `master`.
   The [dev deployment](.github/workflows/deploy.yml) runs `os.yml` with `os_upgrade=true` and upgrades the dev server.
   Check Stylo on https://stylo-dev.huma-num.fr/.
2. Change `ubuntu_version` in `inventories/prod` and merge it on `master`.
3. Take a snapshot of the production VM and announce the downtime.
4. Run the [release](.github/workflows/release.yml) workflow with « os-upgrade » ticked.
   If you forgot to tick it, the deployment fails before changing anything: run the [production deployment](.github/workflows/deploy-tag.yml) workflow with the same version and « os-upgrade » ticked.

If a server is more than one LTS behind, each deployment moves it one LTS further.

To run the checks only from your machine (they change nothing on the server):

```bash
ansible-playbook -i inventories/dev --extra-vars "@vault-dev.yml" --ask-vault-pass --tags precheck os.yml
```

To run the upgrade from your machine, for instance to follow it live, add `--extra-vars "os_upgrade=true"` and remove `--tags precheck`, then run `playbook.yml`.
If a check fails after the reboot, fix the cause, then run `os.yml` and `playbook.yml` again.

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
docker compose exec graphql-stylo npm run migrations
```
