# Contribuer au backend GraphQL de Stylo

Ce document décrit l'organisation des fichiers et les principes en place dans le dossier `graphql`.
Il s'adresse à toute personne (ou tout agent) qui modifie le code, afin que les contributions restent cohérentes entre elles.

Les conventions communes à tout le dépôt (messages de commit, titres de pull request, lint) sont décrites dans le fichier [`CONTRIBUTING.md`](../CONTRIBUTING.md) à la racine.
Les commandes d'installation et de développement sont décrites dans le fichier [`README.md`](README.md).
Les règles de nommage et d'évolution du schéma de l'API sont décrites dans le fichier [`CONVENTIONS.md`](CONVENTIONS.md), qui fait foi pour toute modification de `schema.js`.

## En résumé

- Le serveur est une application [Express](https://expressjs.com/) qui expose l'API GraphQL, l'authentification, quelques routes HTTP et le WebSocket de l'édition collaborative.
- Une requête traverse trois couches : le schéma (`schema.js`), les résolveurs (`resolvers/`) et les modèles [Mongoose](https://mongoosejs.com/) (`models/`).
- Il n'y a pas de contrôle d'accès global. Chaque résolveur vérifie lui-même les droits de l'utilisateur·ice sur la ressource demandée.
- Une erreur attendue est levée avec une des classes de `helpers/errors.js`. Toute autre erreur est considérée comme un défaut et envoyée à Sentry.
- Une modification du schéma ne casse pas les clients existants. L'ancienne forme est dépréciée avant d'être supprimée dans une version majeure.
- La structure de la base de données évolue avec des migrations, appliquées au démarrage du serveur.
- Le code est écrit en JavaScript (CommonJS) et typé avec des commentaires JSDoc. Il n'y a pas de TypeScript.
- [Biome](https://biomejs.dev/) assure le lint et le formatage, et le lanceur de tests intégré à Node.js (`node:test`) les tests.

## Organisation des fichiers

```
graphql/
├── app.js                point d'entrée : Sentry, Express, routes, WebSocket, migrations
├── config.js             configuration de l'application (variables d'environnement)
├── schema.js             schéma GraphQL (définitions de types)
├── schema.test.js        tests qui exécutent des requêtes à travers le schéma
├── loaders.js            DataLoaders créés pour chaque requête
├── logger.js             journalisation (pino)
├── resolvers/            résolveurs, un fichier par ressource, agrégés dans index.js
├── models/               modèles Mongoose
├── policies/             règles d'accès partagées (isUser, accès des services)
├── helpers/              fonctions utilitaires (erreurs, jetons, métadonnées, BibTeX, Yjs…)
├── auth/                 stratégies d'authentification Passport et identité de l'appelant (principal.js)
├── backup/               route de sauvegarde des articles (JSON ou ZIP)
├── plugins/              recherche plein texte
├── migrations/           migrations de la base de données
├── data/                 contenu de l'article créé avec chaque nouveau compte
├── bin/                  scripts en ligne de commande
└── tests/                harnais de tests (MongoDB) et tests transverses
```

Les dossiers `ydata` et `yeditingsession` contiennent les données locales de l'édition collaborative.
Ils sont créés à l'exécution et ignorés par Git.

## Parcours d'une requête

1. `app.js` reçoit la requête `POST /graphql`. Le middleware `populateUserFromJWT` (`helpers/token.js`) lit l'entête `Authorization: Bearer <jeton>` et renseigne `req.token` et `req.user`.
2. Le contexte GraphQL est construit pour cette requête (voir ci-dessous).
3. Le schéma valide la requête, puis appelle les résolveurs.
4. Un résolveur vérifie les droits, lit ou modifie les données à travers les modèles et renvoie la ressource.
5. Les erreurs inattendues de la réponse sont journalisées et envoyées à Sentry (`helpers/errorReporting.js`).

### Contexte

Chaque résolveur reçoit le contexte en troisième argument.

| Propriété | Contenu |
| --- | --- |
| `principal` | Qui appelle l'API (`auth/principal.js`) : `user`, `service` ou `anonymous` |
| `user` | L'utilisateur·ice authentifié·e (document Mongoose), ou `null` |
| `userId` | Son identifiant sous forme de chaîne de caractères |
| `token` | Le contenu du jeton JWT (`_id`, `admin`…), ou un objet vide |
| `session` | La session Express |
| `loaders` | Les DataLoaders de la requête |
| `ip` | L'adresse IP de la requête |

Le nouveau code s'appuie sur `principal` plutôt que sur le contenu du jeton.

L'utilisateur·ice qui fait la requête vient toujours du contexte, jamais d'un argument (voir la section « Utilisateur » de [`CONVENTIONS.md`](CONVENTIONS.md)).

## Authentification

- Les stratégies [Passport](https://www.passportjs.org/) sont dans le dossier `auth` : compte local (adresse électronique et mot de passe, haché avec bcrypt), HumanID (OpenID Connect), Zotero (OAuth 1) et Hypothesis (OAuth 2).
- Une connexion réussie produit un jeton JWT signé avec `JWT_SECRET_SESSION_COOKIE` (`createJWTToken`, `helpers/token.js`), que le front renvoie dans l'entête `Authorization`.
- Les comptes externes liés à un compte Stylo sont enregistrés dans `user.authProviders`.

## Schéma

Tout le schéma est défini dans `schema.js`, sous la forme d'une seule chaîne de définitions de types assemblée aux résolveurs avec `makeExecutableSchema`.
Avant de le modifier, lisez [`CONVENTIONS.md`](CONVENTIONS.md) en entier, y compris la section « Après une modification du schéma ».

Les points à retenir sont les suivants :

- les mutations sont à la racine et nommées `<verbe><Ressource>` ;
- un changement se fait en deux temps, avec `@deprecated` dans une version mineure puis une suppression dans la version majeure suivante ;
- le front ne doit utiliser aucun élément déprécié, ce que vérifie le test `tests/frontOperations.test.js` ;
- le fichier `schema.graphql` à la racine du dépôt est mis à jour en même temps que `schema.js`.

## Résolveurs

- Chaque fichier `resolvers/<ressource>Resolver.js` exporte, selon les besoins, `Query`, `Mutation` et les résolveurs de champs de son type (`Article`, `WorkingVersion`, `Tag`…).
- `resolvers/index.js` les assemble et ajoute les scalaires (`DateTime`, `EmailAddress`, `JSON`…). Un nouveau fichier de résolveurs doit y être déclaré.
- Le champ `id` de chaque ressource est fourni par la fonction `withId` de `resolvers/index.js`. Un nouveau type qui a un `_id` passe par cette fonction.
- Un résolveur reste court. La logique qui porte sur une ressource est écrite dans une méthode de son modèle, et un traitement indépendant de la base de données dans une fonction de `helpers`.
- Un argument renommé ou déplacé est lu avec `requireArgument` (`helpers/arguments.js`), qui donne la priorité à la nouvelle forme.

### Droits d'accès

Chaque résolveur commence par vérifier l'authentification puis les droits, avant de lire les arguments.
Ces vérifications passent par des fonctions partagées plutôt que par une requête écrite dans le résolveur :

| Fonction | Fichier | Rôle |
| --- | --- | --- |
| `isUser(args, context)` | `policies/isUser.js` | Vérifie qu'un·e utilisateur·ice est authentifié·e et renvoie son `userId` |
| `getArticleByContext(articleId, context)` | `resolvers/articleResolver.js` | Renvoie l'article si la personne en est propriétaire ou contributrice, ou si l'article fait partie d'un de ses espaces de travail |
| `getCorpusByContext(corpusId, context)` | `resolvers/corpusResolver.js` | Renvoie le corpus si la personne l'a créé ou s'il appartient à un de ses espaces de travail |
| `getWorkspace(workspaceId, token, user)` | `resolvers/workspaceResolver.js` | Renvoie l'espace de travail si la personne en est membre |

Un service (l'export) s'authentifie avec un jeton de service et ne peut que lire.
Ses requêtes sont validées par la règle `ServiceReadOnlyRule` (`policies/serviceAccess.js`), qui refuse les mutations et liste les champs autorisés à la racine.
Un nouveau champ de `Query` n'est donc pas accessible à un service tant qu'il n'est pas ajouté à cette liste.
Une ressource à laquelle la personne n'a pas accès est signalée par `NotFoundError`, comme une ressource qui n'existe pas, pour ne pas révéler son existence.

### Fonctionnalités activables

Une fonctionnalité en cours de développement peut être désactivée ou réservée à certaines personnes (`helpers/features.js`).
Les fonctionnalités sont déclarées dans le fichier JSON désigné par la variable `FEATURES_FILE`, dont le format est décrit dans la section « Fonctionnalités activables » du fichier [`SERVER.md`](../SERVER.md).
Un résolveur vérifie qu'une fonctionnalité est activée avec `assertFeature('<nom>', context)`, et une route Express avec le middleware `requireFeature('<nom>')`.

### Erreurs

Les erreurs attendues (authentification, droits, ressource introuvable, données invalides) sont levées avec les classes de `helpers/errors.js`, décrites dans la section « Erreurs » de [`CONVENTIONS.md`](CONVENTIONS.md).
N'utilisez ni `new Error(…)` ni `ExpectedError`, qui est dépréciée et ne subsiste que dans les anciens résolveurs.
Une erreur levée autrement est traitée comme un défaut et remonte dans Sentry.

### DataLoaders

Les relations entre ressources (propriétaire d'un article, versions, étiquettes) sont chargées avec les DataLoaders de `context.loaders` (`loaders.js`), qui regroupent les lectures d'une même requête GraphQL.
Les objets renvoyés sont des objets simples (`lean`). Les _virtuals_, les _getters_ et les méthodes Mongoose n'y sont pas disponibles.

## Modèles et base de données

- Un modèle Mongoose par collection, dans `models/<ressource>.js`.
- Les requêtes réutilisées sont des méthodes statiques du modèle (`Tag.findByUser`), et les opérations sur un document des méthodes d'instance (`workspace.removeMember`, `article.shareWith`).
- Les effets d'une suppression sur les autres collections sont portés par le modèle (par exemple le _hook_ `deleteOne` de `models/tag.js` retire l'étiquette des articles).
- Un modèle n'importe ni résolveur ni règle d'accès.

### Migrations

Toute modification de la structure des données ou des index passe par une migration, avec [db-migrate](https://db-migrate.readthedocs.io/).

- Le fichier est créé dans `migrations/` et nommé `AAAAMMJJHHMMSS-description.js`.
- Il exporte une fonction `up(db)` et une fonction `down()`.
- Une fonction `up` ou `down` qui utilise l'instance MongoDB brute (`db._getDbInstance()`) commence par la garde `if (db.internals.dryRun) return`, sans quoi `db-migrate up --dry-run` échoue (voir la section « Exécution à blanc » du fichier [`SERVER.md`](../SERVER.md)).
- La logique de transformation peut être exportée pour être testée sans base de données (voir `tests/affiliationsListMigration.test.js`).

```js
exports.up = async function (db) {
  if (db.internals.dryRun) return
  const mongo = db._getDbInstance()
  // ...
}

exports.down = function () {
  return null
}
```

Les migrations sont appliquées au démarrage du serveur et au début de chaque suite de tests.
La commande `npm run migrations -w graphql` les applique seules.

## Édition collaborative

Le contenu d'un article en cours d'édition est un document [Yjs](https://yjs.dev/), synchronisé entre les personnes connectées par le WebSocket `/ws/<articleId>`.

- L'accès à la « salle » d'un article est vérifié à la connexion avec le jeton passé dans l'URL (`helpers/collaboration.js`). Seul·e un·e utilisateur·ice peut la rejoindre, un jeton de service est refusé.
- L'état du document est enregistré dans `workingVersion.ydoc` (encodé en Base64), après un délai configurable sans modification.
- Le texte Markdown se lit avec `getTextFromYjsDoc` (`helpers/yjs-utils.mjs`). Ne réécrivez pas le décodage.
- Yjs doit être chargé une seule fois. Importez `Y` depuis `helpers/yjs-utils.mjs` et non avec `require('yjs')`.

## Routes HTTP

En dehors de `POST /graphql`, `app.js` déclare quelques routes :

- `/login/<service>`, `/authorize/<service>` et les routes de retour `/authorization-code/…` pour l'authentification ;
- `/backup` pour la sauvegarde des articles ;
- `/version` pour les versions de l'application et des services d'export ;
- `/feed/…`, `/community/alerts.json` et `/nakala`, qui relaient des services externes.

Une nouvelle fonctionnalité qui lit ou modifie des données de Stylo passe par l'API GraphQL plutôt que par une nouvelle route.

## Configuration et journalisation

- Les variables d'environnement sont lues dans le fichier `.env` à la racine du dépôt et déclarées dans `config.js` avec [convict](https://github.com/mozilla/node-convict), qui les valide au démarrage.
- Le code lit la configuration avec `config.get('…')` et jamais directement dans `process.env`.
- Une nouvelle variable est ajoutée dans `config.js` avec sa documentation et, si elle est utile en développement, dans `stylo-example.env`.
- Les messages sont journalisés avec le `logger` de `logger.js` (pino) plutôt qu'avec `console`.

## Style de code

- Les fichiers sont des modules CommonJS (`require` et `module.exports`). Quelques fichiers `.mjs` font exception, quand une dépendance impose un module ES.
- Les imports relatifs précisent de préférence l'extension du fichier (`require('../models/article.js')`), même si le code existant ne le fait pas partout.
- Les paramètres et les valeurs de retour des fonctions sont documentés avec JSDoc.
- Les descriptions du schéma et les messages d'erreur sont rédigés en anglais.
- Avant d'ajouter une dépendance, vérifiez qu'une solution native de Node.js ou déjà présente ne suffit pas.

## Tests

Les tests utilisent le lanceur intégré à Node.js (`node:test`) et `node:assert`.

```bash
npm test -w graphql
```

- Le fichier de test est placé à côté du fichier testé (`tagResolver.js` et `tagResolver.test.js`).
- Une suite qui a besoin de la base de données appelle `setup()` et `teardown()` (`tests/harness.js`), qui démarrent un conteneur MongoDB avec [Testcontainers](https://testcontainers.com/) et appliquent les migrations. Docker doit donc être démarré.
- Les tests de résolveurs importent `Query`, `Mutation` et les résolveurs de champs, et les appellent directement avec un contexte construit à la main.
- Ces appels directs ne vérifient ni le schéma ni la nullabilité. Un changement de type ou de nullabilité est couvert par un test qui exécute la requête à travers le schéma (`schema.test.js`).
- Les droits font partie des cas à tester, en particulier la personne sans accès et la requête non authentifiée.
- Pour un élément déprécié, la nouvelle forme et l'ancienne sont testées toutes les deux.
- Les fonctions de `helpers` sont testées sans base de données.

Pour lancer un seul fichier, depuis le dossier `graphql` :

```bash
node --test resolvers/tagResolver.test.js
```

Les tests valident aussi les requêtes du front (`front/src/**/*.graphql`) par rapport au schéma (`tests/frontOperations.test.js`).
Une modification du schéma peut donc demander une modification du front dans la même pull request.

## Outils

| Besoin | Outil | Commande |
| --- | --- | --- |
| Développement | Node.js | `npm run dev` (frontend et API, avec rechargement) ou `npm start -w graphql` |
| Migrations seules | db-migrate | `npm run migrations -w graphql` |
| Lint et formatage | Biome | `npm run lint -w graphql` et `npm run lint:fix -w graphql` |
| Tests et couverture | `node:test` et c8 | `npm test -w graphql` |
| Jeton de service | | `npm run -w graphql generate-service-token --silent` |

Les commandes se lancent depuis la racine du dépôt.
N'utilisez ni Prettier ni ESLint.
La commande `npm test` enchaîne les tests et le lint, comme l'intégration continue.

## Avant d'ouvrir une pull request

- [ ] La modification du schéma suit [`CONVENTIONS.md`](CONVENTIONS.md) et n'introduit aucun changement cassant en dehors d'une version majeure.
- [ ] Le fichier `schema.graphql` et les requêtes du front sont à jour.
- [ ] Chaque résolveur ajouté ou modifié vérifie l'authentification et les droits sur la ressource.
- [ ] Un champ de `Query` qu'un service doit lire est ajouté à `SERVICE_QUERY_FIELDS`.
- [ ] Les erreurs attendues utilisent les classes de `helpers/errors.js`.
- [ ] Un changement de la structure des données est accompagné d'une migration.
- [ ] Une nouvelle variable d'environnement est déclarée dans `config.js`.
- [ ] Des tests couvrent la modification, y compris les cas de droits, et `npm test -w graphql` passe (tests et lint).
