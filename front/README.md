# Interface web de Stylo

Ce dossier contient l'interface web (_frontend_) du site hébergé sur https://stylo.huma-num.fr.

Il s'agit d'un workspace npm du dépôt Stylo.
Les commandes ci-dessous se lancent depuis la **racine du dépôt**. Les prérequis et la configuration (fichier `.env`, également lu par l'interface web) sont décrits dans le [fichier `README.md` principal](../README.md).

L'organisation des fichiers et les principes à suivre pour écrire du code (_atomic design_, état, styles, traductions, tests) sont décrits dans le fichier [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Installer

```bash
npm clean-install
```

Les dépendances de tous les workspaces sont installées en une seule fois, avec un seul fichier `package-lock.json` à la racine du dépôt.
Pour ajouter une dépendance à l'interface web :

```bash
npm install <paquet> -w front
```

## Développer

Démarrez l'interface web et l'API GraphQL :

```bash
npm run dev
```

L'interface web est disponible sur [`localhost:3000`](http://localhost:3000) et relaie les requêtes de l'API vers le serveur GraphQL sur `localhost:3030`.
Pour démarrer uniquement l'interface web (l'API GraphQL doit être lancée par ailleurs), utilisez `npm start -w front`.

## Construire

```bash
npm run build -w front
```

Les fichiers sont générés dans le dossier `front/build`.
Pour les servir en local :

```bash
npm run preview -w front
```

## Tester

```bash
npm test -w front
```

Les tests de bout en bout utilisent [Playwright](https://playwright.dev/) et demandent que MongoDB et les services de Stylo soient démarrés (`npm run dev`) :

```bash
npx playwright install chromium # la première fois
npm run test:e2e -w front
```
