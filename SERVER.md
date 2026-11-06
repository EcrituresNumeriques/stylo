# Server operations

This page covers day-to-day operations on a running Stylo server.

- To install Stylo, read [`HOWTO.md`](HOWTO.md).
- Stylo servers (`stylo.huma-num.fr` and `stylo-dev.huma-num.fr`) are provisioned and deployed with Ansible: see the [`infrastructure`](infrastructure) folder and the [`deploy`](.github/workflows/deploy.yml) and [`deploy-tag`](.github/workflows/deploy-tag.yml) workflows.
- To release and deploy a new version, read [`RELEASE.md`](RELEASE.md).

On the servers, the Docker Compose project lives in `~/stylo`.
The commands below use the production database name (`stylo-prod`); use `stylo-dev` on the dev server.

# Database operations

## Backup

```bash
docker exec mongodb-stylo sh -c 'mongodump --archive --db stylo-prod' > stylo-prod.dump
```

## Restore

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

## Migrations

Database migrations are [`db-migrate`](https://db-migrate.readthedocs.io/) scripts located in [`graphql/migrations`](graphql/migrations).
They run automatically each time the `graphql-stylo` container starts.

To run them manually:

```bash
cd ~/stylo
docker compose exec graphql-stylo npm run migrations
```
