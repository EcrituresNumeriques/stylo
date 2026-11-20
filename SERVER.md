# Installation sur un serveur et exploitation

Cette page explique comment installer Stylo sur un serveur et comment y réaliser les opérations courantes.
Pour publier une nouvelle version de Stylo et la déployer sur `stylo.huma-num.fr` et `stylo-dev.huma-num.fr`, lisez le fichier [`RELEASE.md`](RELEASE.md).

## Installer sur un serveur

Les serveurs de Stylo sont provisionnés et déployés avec le playbook Ansible du dossier [`infrastructure`](infrastructure).
Ce playbook est l'installation de référence. Il installe Docker et NGINX, génère les fichiers `.env` et `docker-compose.yaml` à partir de [`infrastructure/templates`](infrastructure/templates), et lance Stylo comme un service systemd (`docker-compose-stylo`).
Le workflow [`deploy-tag`](.github/workflows/deploy-tag.yml) montre comment nous le lançons en production.

> [!WARNING]
> Le playbook est écrit pour les serveurs d'Huma-Num et repose sur quelques hypothèses, à respecter ou à adapter :
> - l'utilisateur distant est `stylo` (avec `/home/stylo` comme dossier personnel) ;
> - certbot est déjà installé et les certificats existent sur le serveur ; le playbook installe NGINX mais ne copie que les fichiers de configuration des sites ;
> - une configuration Nagios est copiée dans `/etc/nagios/nrpe_local.cfg`.

### Prérequis

- Un serveur Ubuntu LTS accessible en SSH, avec certbot et un utilisateur `stylo` autorisé à utiliser `sudo`
- Sur votre machine : Node.js (voir [`.node-version`](.node-version)) et Ansible (voir les versions dans [`deploy-requirements.txt`](.github/workflows/deploy-requirements.txt))

### Configurer votre instance

Depuis le dossier `infrastructure` :

1. Copiez `inventories/prod` vers `inventories/<mon-instance>` et modifiez-le : l'hôte du serveur (section `[stylo]`), la version d'Ubuntu du serveur (`ubuntu_version`), le domaine (`site`), le nom de la base de données, les URL de retour et des services.
2. Créez un coffre chiffré avec les secrets référencés par l'inventaire et les modèles (`stylo_become_pass`, `jwt_secret_*`, `session_secret`, `humanid_*`, `hypothesis_client_key`, `zotero_auth_*`, `sentry_graphql_dsn`, `imgur_client_id`, `se_circe_*`) :
   ```bash
   ansible-vault create vault-<mon-instance>.yml
   ```
3. Ajoutez vos fichiers de configuration NGINX dans `files/` : `<site>.conf`, `export.<site>.conf` et `pandoc-api.<site>.conf`, sur le modèle de ceux de `stylo.huma-num.fr`.
   Ajoutez aussi les fichiers `<env>-nagios-nrpe-local.cfg` et `features-<env>.json`, qui correspondent à la variable `env` de votre inventaire (voir [Fonctionnalités activables](#fonctionnalités-activables)).

### Construire l'interface web et déployer

Les fichiers de l'interface web sont construits sur votre machine et copiés sur le serveur par le playbook.
Depuis la racine du dépôt, définissez les variables `FRONT_*`, `PANDOC_EXPORT_ENDPOINT` et `ANNOTATIONS_CANONICAL_BASE_URL` de votre instance (par exemple dans `.env`, voir [`stylo-example.env`](stylo-example.env)).
Les anciens noms `SNOWPACK_*` sont encore lus, avec un avertissement, mais seront supprimés dans une prochaine version.
Lancez ensuite le build :

```bash
npm clean-install
npm run build -w front
```

Depuis le dossier `infrastructure`, vérifiez ensuite la version d'Ubuntu du serveur (voir [Version d'Ubuntu](#version-dubuntu)) :

```bash
ansible-playbook -i inventories/<mon-instance> \
  --extra-vars "@vault-<mon-instance>.yml" \
  --ask-vault-pass \
  os.yml
```

Lancez enfin le playbook, avec une version publiée de Stylo (les images Docker correspondantes sont téléchargées depuis ghcr.io) :

```bash
ansible-playbook -i inventories/<mon-instance> \
  --extra-vars "@vault-<mon-instance>.yml" \
  --extra-vars "app_version=X.Y.Z" \
  --extra-vars "assets_path=../front/build/" \
  --ask-vault-pass \
  playbook.yml
```

Relancez la même commande pour passer à une nouvelle version.

### Fonctionnalités activables

Les fonctionnalités en cours de développement sont masquées tant qu'elles ne sont pas activées dans le fichier `files/features-<env>.json`, qui correspond à la variable `env` de votre inventaire.
Le playbook le copie vers `~/stylo/features.json`, que l'API lit à son démarrage. L'interface web reçoit les fonctionnalités activées pour la personne connectée.

```json
{
  "groups": { "ecrinum/labo": ["thom4", "ggrossetie"] },
  "flags": {
    "webdav": { "state": "on" },
    "nakala": { "state": "opt-in", "groups": ["ecrinum/labo"], "users": [] },
    "search": { "state": "off" }
  }
}
```

- `state` vaut `off` (personne), `on` (tout le monde) ou `opt-in` (uniquement les personnes listées). Une fonctionnalité inconnue est désactivée.
- Avec `opt-in`, une personne est désignée par son `username`, directement (`users`) ou à travers un groupe (`groups`). Les comptes sans `username` n'ont accès qu'aux fonctionnalités `on`.
- Les noms de groupes respectent le format `[a-z0-9_/-]+` et doivent être déclarés dans `groups`. L'API refuse de démarrer si le fichier est invalide.
- Pour changer qui a accès à une fonctionnalité, modifiez le fichier et relancez le playbook.
- En local, la variable `FEATURES_FILE` désigne un fichier JSON de même structure, par un chemin relatif à la racine du dépôt (voir [`features.example.json`](features.example.json)). Sans ce fichier, tout est désactivé.

## Exploitation

Sur les serveurs, le projet Docker Compose se trouve dans `~/stylo`.
Les commandes ci-dessous utilisent le nom de la base de données de production (`stylo-prod`). Utilisez `stylo-dev` sur le serveur de développement.

### Version d'Ubuntu

Chaque inventaire déclare la version LTS d'Ubuntu de son serveur avec `ubuntu_version` (par exemple `ubuntu_version="24.04"`).
Le playbook [`os.yml`](infrastructure/os.yml) la vérifie, et les workflows de déploiement le lancent avant `playbook.yml` :

- le serveur tourne sur la version déclarée : rien à faire ;
- le serveur tourne sur une version plus récente : `os.yml` échoue, mettez à jour `ubuntu_version` dans l'inventaire ;
- le serveur tourne sur une version plus ancienne : `os.yml` le monte à la LTS suivante avec `do-release-upgrade`, une LTS à la fois (22.04 → 24.04 → 26.04).
  Il ne le fait qu'avec `os_upgrade=true` ; sinon il échoue après les vérifications, avant de modifier quoi que ce soit.

La montée de version sauvegarde la base de données, installe les mises à jour en attente et redémarre si besoin, puis monte la version (en gardant les fichiers de configuration modifiés localement), redémarre à nouveau, réactive le dépôt Docker et vérifie les services, les conteneurs et l'accès HTTPS.
Stylo est indisponible pendant la montée de version, qui peut durer jusqu'à une heure.
Les montées de LTS à LTS ne sont proposées qu'à la sortie de la première version corrective (par exemple 26.04.1) : d'ici là, `os.yml` s'arrête avant la montée de version.
`do-release-upgrade` désactive les sources APT tierces ; `os.yml` ne réactive que Docker et liste les sources encore désactivées.
Les journaux de la montée de version se trouvent dans `/var/log/dist-upgrade/` sur le serveur.

Pour monter la version des serveurs :

1. Modifiez `ubuntu_version` dans `inventories/dev` et fusionnez sur `master`.
   Le [déploiement de dev](.github/workflows/deploy.yml) lance `os.yml` avec `os_upgrade=true` et monte la version du serveur de développement.
   Vérifiez Stylo sur https://stylo-dev.huma-num.fr/.
2. Modifiez `ubuntu_version` dans `inventories/prod` et fusionnez sur `master`.
3. Faites un instantané de la VM de production et annoncez l'interruption de service.
4. Lancez le workflow [release](.github/workflows/release.yml) en cochant « os-upgrade ».
   Si vous avez oublié de le cocher, le déploiement échoue avant de modifier quoi que ce soit : lancez le workflow de [déploiement en production](.github/workflows/deploy-tag.yml) avec la même version en cochant « os-upgrade ».

Si un serveur a plus d'une LTS de retard, chaque déploiement le fait avancer d'une LTS.

Pour lancer uniquement les vérifications depuis votre machine (elles ne modifient rien sur le serveur) :

```bash
ansible-playbook -i inventories/dev --extra-vars "@vault-dev.yml" --ask-vault-pass --tags precheck os.yml
```

Pour lancer la montée de version depuis votre machine, par exemple pour la suivre en direct, ajoutez `--extra-vars "os_upgrade=true"` et retirez `--tags precheck`, puis lancez `playbook.yml`.
Si une vérification échoue après le redémarrage, corrigez la cause, puis relancez `os.yml` et `playbook.yml`.

### Sauvegarder la base de données

```bash
docker exec mongodb-stylo sh -c 'mongodump --archive --db stylo-prod' > stylo-prod.dump
```

### Restaurer la base de données

```bash
docker exec -i mongodb-stylo sh -c 'mongorestore --archive' < stylo-prod.dump
docker exec mongodb-stylo mongosh --quiet --eval "db.adminCommand({listDatabases: 1}).databases.map(n => n.name)"
# ['admin', 'config', 'local', 'stylo-prod']
```

> [!NOTE]
> Pour renommer la base de données pendant l'import, utilisez `--nsFrom` et `--nsTo`.
> Par exemple, pour renommer la base `stylo` en `stylo-prod` :
>
> ```bash
> docker exec -i mongodb-stylo sh -c 'mongorestore --archive --nsFrom="stylo.*" --nsTo="stylo-prod.*"' < stylo-prod.dump
> ```

### Migrations

Les migrations de la base de données sont des scripts [`db-migrate`](https://db-migrate.readthedocs.io/) situés dans le dossier [`graphql/migrations`](graphql/migrations).
Elles sont appliquées automatiquement à chaque démarrage du conteneur `graphql-stylo`.

Pour les lancer à la main :

```bash
cd ~/stylo
docker compose exec graphql-stylo node ../node_modules/.bin/db-migrate up
```

Pour lister les migrations en attente sans les exécuter :

```bash
cd ~/stylo
docker compose exec graphql-stylo node ../node_modules/.bin/db-migrate check
```

#### Exécution à blanc

`db-migrate up --dry-run` exécute la fonction `up` de chaque migration en attente et compte sur le pilote pour ignorer les écritures.
Le pilote ([`@ggrossetie/db-migrate-mongodb`](https://github.com/ggrossetie/db-migrate-mongodb)) ne peut pas intercepter les opérations faites sur l'instance MongoDB brute renvoyée par `db._getDbInstance()`, donc cette méthode lève une erreur dans ce mode.

Toute migration qui utilise l'instance brute doit donc s'interrompre dès le début dans ce mode, dans `up` et dans `down` :

```js
exports.up = async function (db) {
  if (db.internals.dryRun) return
  const mongo = db._getDbInstance()
  // ...
}
```

Une exécution à blanc se limite par conséquent à lister les migrations qui seraient traitées, comme `db-migrate check`.

> [!NOTE]
> `--dry-run` demande la version 2.1.0 ou une version ultérieure du pilote.
> La version 2.0.0 ignore l'option, donc les migrations sont enregistrées comme appliquées (voir [ggrossetie/db-migrate-mongodb#2](https://github.com/ggrossetie/db-migrate-mongodb/issues/2)).
