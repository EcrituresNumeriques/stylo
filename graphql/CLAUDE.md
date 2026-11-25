# Stylo — GraphQL Backend

Serveur GraphQL Node.js/Express pour la plateforme d'édition scientifique collaborative Stylo.
Node >= 22, MongoDB 7.0+.

## Où trouver quoi

- Schéma GraphQL : `schema.js` ; résolveurs : `resolvers/` (agrégés dans `resolvers/index.js`)
- Modèles Mongoose : `models/` ; erreurs : `helpers/errors.js`
- Droits : `policies/isUser.js` et `getArticleByContext` (`resolvers/articleResolver.js`)
- Configuration et variables d'environnement : `config.js`
- Types : en JSDoc, à écrire pour le nouveau code ; les modèles et `schema.js` font foi

## Commandes

```bash
npm start          # Lance les migrations puis le serveur (port 3030)
npm test           # Tests + couverture (c8), puis lint (biome)
node --test '**/*.test.js'  # Tests uniquement (depuis graphql/)
npm run lint:fix   # Corrige le format avec biome
npm run migrations # Migrations seules
```

## Schéma GraphQL

Tout est défini dans `schema.js`. Toute modification du schéma suit [`CONVENTIONS.md`](./CONVENTIONS.md), y compris la section « Après une modification du schéma » (mise à jour de `schema.graphql` et des requêtes du front).

## Resolvers

Chaque fichier de `resolvers/` exporte, selon les besoins, `Query`, `Mutation` et les résolveurs de champs de son type (ex. `Article`, `WorkingVersion`).

Fonctions d'accès aux ressources (privées, réutilisées dans les resolvers) :

- `getUser(userId)` — lève `NotFoundError` si introuvable
- `getArticleByContext(articleId, context)` — vérifie les droits (admin, owner, contributor, workspace)

## Contexte GraphQL

Le contexte est construit dans `app.js` (`principal`, `user`, `userId`, `token`, `session`, `loaders`). `principal` (`auth/principal.js`) dit qui appelle l'API (`user`, `service` ou `anonymous`). Le nouveau code s'appuie sur lui plutôt que sur le contenu du jeton. Les objets chargés par les DataLoaders (`loaders.js`) sont `lean` : les virtuals et les méthodes Mongoose n'y sont pas disponibles.

## Authentification

- **Local** : email/mot de passe, bcrypt, puis JWT signé avec `JWT_SECRET_SESSION_COOKIE`
- **OAuth** : HumanID (OIDC), Zotero (OAuth1), Hypothesis (OAuth2)
- Les providers sont stockés dans `user.authProviders` (Map Mongoose)

Le middleware `populateUserFromJWT()` (dans `helpers/token.js`) injecte `req.user` et `req.token` à partir du header `Authorization: Bearer <token>`.

## Politiques d'accès

- `isUser(args, context)` — vérifie que l'utilisateur authentifié accède à ses propres données (ou est admin). Retourne `{ userId }`.

## Édition collaborative (Yjs)

Les articles stockent leur contenu dans `workingVersion.ydoc` (Uint8Array encodé en Base64). Le WebSocket server (`@y/websocket-server`) diffuse les mises à jour en temps réel. La persistance vers MongoDB est déclenchée avec un debounce de 3 s (configurable via `COLLABORATION_UPDATE_WORKING_COPY_INTERVAL_MS`).

Pour lire le contenu Markdown d'un ydoc, utiliser `getTextFromYjsDoc(ydocBase64)` (`helpers/yjs-utils.mjs`) plutôt que de réécrire le décodage.

## Tests

- Framework : module `node:test` natif + `node:assert`
- Chaque suite démarre un conteneur MongoDB isolé via `tests/harness.js` (`setup()` / `teardown()`) : Docker doit tourner (testcontainers).
- Les tests de resolvers importent directement les exports du fichier resolver (`Query`, `Mutation`…)
- Fichiers : `*.test.js` à côté du code testé

## Migrations

Fichiers dans `migrations/`, nommés `YYYYMMDDHHMISS-description.js`. Chaque migration exporte `up(db)` et `down()`. Elles tournent automatiquement au `npm start`.

Une migration qui utilise l'instance MongoDB brute doit commencer par la garde `if (db.internals.dryRun) return`, dans `up` et dans `down`. Le pilote ne peut pas intercepter les écritures faites sur cette instance, donc `db._getDbInstance()` lève une erreur avec `db-migrate up --dry-run`.

```js
exports.up = async function (db) {
  if (db.internals.dryRun) return
  const mongo = db._getDbInstance()
  // ...
}
```

Pour lister les migrations en attente sans les exécuter, utiliser `db-migrate check`.
