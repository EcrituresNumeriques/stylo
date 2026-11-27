# Backend GraphQL de Stylo

Ce dossier est un workspace npm du dépôt Stylo.
Les commandes ci-dessous se lancent depuis la **racine du dépôt**. Les prérequis et la configuration (fichier `.env` à la racine du dépôt) sont décrits dans le [fichier `README.md` principal](../README.md).

L'organisation des fichiers et les principes à suivre pour écrire du code (résolveurs, droits d'accès, erreurs, migrations, tests) sont décrits dans le fichier [`CONTRIBUTING.md`](CONTRIBUTING.md).
Avant de modifier le schéma GraphQL, lisez les [conventions de l'API](CONVENTIONS.md).

## Installer

```bash
npm clean-install
```

Les dépendances de tous les workspaces sont installées en une seule fois, avec un seul fichier `package-lock.json` à la racine du dépôt.
Pour ajouter une dépendance au backend GraphQL :

```bash
npm install <paquet> -w graphql
```

## Développer

Lancez le serveur (MongoDB doit être démarré) :

```bash
npm start -w graphql
```

Les migrations de la base de données (dossier [`migrations`](migrations)) sont appliquées avant le démarrage du serveur.
L'API répond ensuite sur [`localhost:3030/graphql`](http://localhost:3030/graphql).

Pour démarrer à la fois le backend GraphQL et l'interface web, utilisez `npm run dev`.

## Tester

Les tests démarrent un conteneur MongoDB avec [Testcontainers](https://testcontainers.com/), donc Docker doit être démarré :

```bash
npm test -w graphql
```

## Générer un jeton de service

Un jeton de service permet à une autre application (le service d'export) de lire les données de l'API.

```bash
npm run -w graphql generate-service-token --silent
```

> [!WARNING]
> La commande a besoin de la variable d'environnement `JWT_SECRET_SESSION_COOKIE`, avec la même valeur que celle du serveur GraphQL en cours d'exécution.
> La variable est lue dans l'environnement, ou dans le fichier `.env` à la racine du dépôt.
