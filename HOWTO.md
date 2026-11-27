# Installer Stylo

Selon vos besoins, Stylo s'installe de différentes façons :

- Pour travailler sur le code de Stylo, suivez les instructions de développement local du fichier [`README.md`](README.md).
- Pour lancer une instance complète de Stylo sur votre machine, [utilisez Docker Compose](#lancer-stylo-avec-docker-compose).
- Pour installer Stylo sur un serveur, utilisez le playbook Ansible décrit dans le fichier [`SERVER.md`](SERVER.md).

## Cloner le dépôt Git

La première étape consiste à cloner le projet, avec l'URL HTTPS ou SSH du dépôt :

```bash
git clone git@github.com:EcrituresNumeriques/stylo.git
cd stylo
```

## Lancer Stylo avec Docker Compose

Chaque service de Stylo tourne dans un conteneur Docker : MongoDB, l'API GraphQL, l'interface web (servie par NGINX), le service d'export et l'API Pandoc.
Vous avez besoin de [Docker](https://docs.docker.com/engine/install/) avec le plugin Compose, et de Node.js (voir [`.node-version`](.node-version)) pour construire l'interface web.

Copiez le fichier de configuration :

```bash
cp stylo-example.env .env
```

Modifiez ensuite le fichier `.env`.
Les variables `FRONT_*_ENDPOINT`, `PANDOC_EXPORT_ENDPOINT` et `ANNOTATIONS_CANONICAL_BASE_URL` ainsi que les URL de retour (`*_CALLBACK_URL`) doivent utiliser l'URL publique de votre instance (voir [Exposer Stylo](#exposer-stylo)).
Construisez ensuite les fichiers de l'interface web, que le conteneur `front-stylo` sert depuis le dossier `front/build` :

```bash
npm clean-install
npm run build -w front
```

Avant le premier lancement, renseignez la variable `SE_GRAPHQL_TOKEN` dans `.env` avec la valeur produite par cette commande :

```bash
docker compose run --rm --no-deps graphql-stylo node bin/generate-service-token.js
```

Puis démarrez Stylo :

```bash
docker compose up -d
```

Par défaut, les images `latest` sont téléchargées depuis ghcr.io.
Pour lancer une version publiée, définissez la variable `TAG` (par exemple `TAG=3.13.1 docker compose up -d`). Pour construire les images à partir de votre copie de travail, utilisez `docker compose up -d --build`.

Les services écoutent alors sur `127.0.0.1` :

- interface web : port 3000
- API GraphQL : port 3030
- service d'export : port 3080
- API Pandoc : port 3090

## Exposer Stylo

Le conteneur `front-stylo` ne sert que des fichiers statiques. Un serveur mandataire inverse (_reverse proxy_) doit donc diriger les chemins de l'API (`/graphql`, `/login`, `/events`, etc.) vers l'API GraphQL, et les autres requêtes vers l'interface web.
Les fichiers de configuration NGINX du dossier [`infrastructure/files`](infrastructure/files) sont des exemples fonctionnels : `stylo.huma-num.fr.conf` pour l'application, `export.stylo.huma-num.fr.conf` et `pandoc-api.stylo.huma-num.fr.conf` pour les services d'export.

## Étapes suivantes

Une fois votre instance de Stylo démarrée, lisez le fichier [`SERVER.md`](SERVER.md) pour les opérations courantes et de maintenance, comme les sauvegardes et les migrations de la base de données.
