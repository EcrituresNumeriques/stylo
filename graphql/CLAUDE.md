# Stylo — GraphQL Backend

Serveur GraphQL Node.js/Express pour la plateforme d'édition scientifique collaborative Stylo.
Node >= 22, MongoDB 7.0+.

## Architecture

```
graphql/
├── app.js              # Point d'entrée : Express, Passport, WebSocket Yjs
├── schema.js           # Schéma GraphQL (types, queries, mutations)
├── config.js           # Configuration via convict (variables d'environnement)
├── loaders.js          # DataLoaders (batch queries, anti N+1)
├── auth/               # Stratégies Passport (local, HumanID OIDC, Zotero, Hypothesis)
├── models/             # Schémas Mongoose (User, Article, Version, Tag, Workspace, Corpus)
├── resolvers/          # Implémentation des queries/mutations GraphQL
├── policies/           # Autorisations (isUser, isAdmin)
├── helpers/            # Utilitaires (metadata, bibtex, versions, token, errors…)
├── migrations/         # Migrations MongoDB (db-migrate)
└── tests/harness.js    # TestContainers MongoDB pour les tests
```

## Commandes

```bash
npm start          # Lance les migrations puis le serveur (port 3030)
npm test           # Tests + couverture (c8) + lint (eslint)
node --test **/*.test.js  # Tests uniquement (depuis graphql/)
npm run migrations # Migrations seules
```

## Schéma GraphQL

Tout est défini dans `schema.js`. Les mutations et queries sont documentées avec des docstrings GraphQL (`"""`). L'objet `ImportArticleInput` illustre le pattern :

```graphql
input ImportArticleInput {
  title: String!
  content: String       # Markdown
  bibliography: String  # BibTeX
  metadata: JSON        # YAML sous forme d'objet
}
```

## Resolvers

Chaque domaine a son fichier resolver avec trois exports : `Query`, `Mutation`, et les résolveurs de champs du type (ex. `Article`). Ils sont agrégés dans `resolvers/index.js`.

Fonctions d'accès aux ressources (privées, réutilisées dans les resolvers) :

- `getUser(userId)` — lève `NotFoundError` si introuvable
- `getArticleByContext(articleId, context)` — vérifie les droits (admin, owner, contributor, workspace)

## Contexte GraphQL

```javascript
{
  user,     // document User depuis la DB
  userId,   // string (depuis user ou token)
  token,    // payload JWT ({ _id, email, admin?, session? })
  session,  // session Express
  loaders   // DataLoaders (tags, users, articles, versions)
}
```

## Authentification

- **Local** : email/mot de passe, bcrypt, puis JWT signé avec `JWT_SECRET_SESSION_COOKIE`
- **OAuth** : HumanID (OIDC), Zotero (OAuth1), Hypothesis (OAuth2)
- Les providers sont stockés dans `user.authProviders` (Map Mongoose)

Le middleware `populateUserFromJWT()` (dans `helpers/token.js`) injecte `req.user` et `req.token` à partir du header `Authorization: Bearer <token>`.

## Politiques d'accès

- `isUser(args, context)` — vérifie que l'utilisateur authentifié accède à ses propres données (ou est admin). Retourne `{ userId }`.
- `isAdmin(context)` — accès admin uniquement.
- Les admins sont identifiés par `token.admin === true` ou `user.admin === true`.

## Édition collaborative (Yjs)

Les articles stockent leur contenu dans `workingVersion.ydoc` (Uint8Array encodé en Base64). Le WebSocket server (`@y/websocket-server`) diffuse les mises à jour en temps réel. La persistance vers MongoDB est déclenchée avec un debounce de 3 s (configurable via `COLLABORATION_UPDATE_WORKING_COPY_INTERVAL_MS`).

Pour lire le contenu Markdown depuis un ydoc :

```javascript
const wsDoc = new WSSharedDoc(`ws/${id}`)
Y.applyUpdate(wsDoc, Buffer.from(ydocBase64, 'base64'))
const md = wsDoc.getText('main').toString()
wsDoc.destroy()
```

## Modèles clés

| Modèle      | Points notables                                                           |
|-------------|---------------------------------------------------------------------------|
| `User`      | `authProviders` (Map), `comparePassword()`, `softDelete()`                |
| `Article`   | `workingVersion.ydoc` (Base64), `owner[]`, `contributors[]`, `versions[]` |
| `Version`   | Snapshot immuable : `md`, `bib`, `metadata`, `version`/`revision`         |
| `Workspace` | `members[]`, `articles[]`, `formMetadata` (JSON schema)                   |
| `Corpus`    | Collection ordonnée d'articles (`articles[].order`)                       |

## Tests

- Framework : module `node:test` natif + `node:assert`
- Chaque suite démarre un conteneur MongoDB isolé via `tests/harness.js` (`setup()` / `teardown()`)
- Les tests de resolvers importent directement `Query` et `Mutation` depuis le fichier resolver
- Fichiers : `*.test.js` dans `resolvers/`, `helpers/`, `models/`, `policies/`

## Erreurs personnalisées

Définies dans `helpers/errors.js` — toutes étendent `GraphQLError` :

| Classe                    | HTTP |
|---------------------------|------|
| `BadRequestError`         | 400  |
| `NotAuthenticatedError`   | 401  |
| `NotAuthorizedError`      | 403  |
| `NotFoundError(type, id)` | 404  |

## Migrations

Fichiers dans `migrations/`, nommés `YYYYMMDDHHMISS-description.js`. Chaque migration exporte `up(db)` et `down()`. Elles tournent automatiquement au `npm start`.
