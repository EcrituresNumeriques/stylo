# Conventions de l'API GraphQL

Ce document décrit les règles à suivre pour faire évoluer le schéma de l'API GraphQL (`schema.js`).
L'objectif est qu'un client (le front, les outils d'export, les scripts des utilisateurs) puisse deviner le nom et la forme d'une requête ou d'une mutation à partir des autres.

Ces règles ont été décidées dans le cadre de [#1976](https://github.com/EcrituresNumeriques/stylo/issues/1976).
Une partie du schéma ne les respecte pas encore : les anciennes formes sont dépréciées et seront supprimées lors de la prochaine version majeure ([#2132](https://github.com/EcrituresNumeriques/stylo/issues/2132)).
Tout nouveau champ, argument ou type doit suivre ces règles.

## Requêtes

- Une requête qui renvoie **une** ressource porte le nom de la ressource au singulier et prend son identifiant : `article(articleId: ID!)`, `workspace(workspaceId: ID!)`.
- Une requête qui renvoie **une liste** porte le nom au pluriel et prend un filtre facultatif : `articles(filter: ArticleFilterInput)`, `corpora(filter: CorpusFilterInput)`.
- Pas de préfixe `get` : `user`, pas `getUser`.

```graphql
type Query {
  tag(tagId: ID!): Tag
  tags: [Tag!]!
}
```

## Mutations

- Toutes les mutations sont **à la racine** du type `Mutation`.
  Un type ne contient pas de champ qui modifie des données (pas de `Article.rename`, `Corpus.delete`…).
- Une mutation est nommée `<verbe><Ressource>` : `createArticle`, `deleteCorpus`, `addArticleTags`, `removeWorkspaceMember`.
- **Attributs** d'une ressource (titre, nom, description, métadonnées…) : une mutation générique `update<Ressource>(<ressource>Id, input)` qui ne modifie que les champs fournis dans l'input.
  Pas de mutation dédiée à un seul attribut (`renameCorpus`, `updateCorpusMetadata`…).
- **Relations** entre ressources (articles d'un corpus, contributeurs d'un article, membres d'un espace de travail…) : des mutations dédiées `add<Ressource><Relation>` / `remove<Ressource><Relation>`.
- Ne pas ajouter une mutation qui fait la même chose qu'une mutation existante ([#2134](https://github.com/EcrituresNumeriques/stylo/issues/2134)).

```graphql
type Mutation {
  updateCorpus(corpusId: ID!, input: UpdateCorpusInput!): Corpus!
  addCorpusArticle(corpusId: ID!, articleId: ID!): Corpus!
  removeCorpusArticle(corpusId: ID!, articleId: ID!): Corpus!
}
```

## Arguments

- Les identifiants sont nommés explicitement : `articleId`, `corpusId`, `userId`, `versionId`… (pas `article`, `id` ou `to`).
- Quand une mutation prend un input type, l'argument s'appelle `input`.
- L'identifiant de la ressource modifiée est **à côté** de l'input, jamais dedans : `updateArticle(articleId: ID!, input: UpdateArticleInput!)`.
  L'input reste ainsi réutilisable et la forme est la même que pour les mutations sans input.
- Les champs d'un input `update…` sont facultatifs : un champ absent n'est pas modifié.
- Les listes en argument sont non nullables : `[ID!]!`.

## Utilisateur

L'utilisateur qui fait la requête est **toujours** celui du contexte d'authentification (`context.userId`).
Il n'est jamais passé en argument ni dans un input, y compris pour renseigner l'auteur d'une ressource (par exemple l'auteur d'une version, [#2133](https://github.com/EcrituresNumeriques/stylo/issues/2133)).

Un argument `userId` désigne toujours **un autre** utilisateur : le contributeur à ajouter, le membre à inviter…

## Types

- Nommage :
  - types en `PascalCase`, champs et arguments en `camelCase` ;
  - input types en `<Verbe><Ressource>Input` (`CreateTagInput`, `UpdateUserInput`) ;
  - filtres en `<Ressource>FilterInput` (`CorpusFilterInput`).
- Chaque ressource expose `id: ID!`.
  `_id` est un détail d'implémentation de MongoDB : il est déprécié et ne doit plus être utilisé.
- Les identifiants sont de type `ID`, pas `String`.
- Une relation est exposée comme un objet, pas comme un identifiant brut : `creator: User`, pas `creator: ID`.
- Les listes renvoyées sont non nullables, avec des éléments non nuls : `[Article!]!` (une liste vide plutôt que `null`).
- Les champs en anglais : `summary`, pas `sommaire` ; `contacts`, pas `acquaintances`.
- Valeurs d'enum : leur casse n'est pas encore tranchée ([#1941](https://github.com/EcrituresNumeriques/stylo/issues/1941)) ; en attendant, suivre la casse de l'enum existant.

## Retours des mutations

- Une mutation renvoie la **ressource modifiée** (jamais un booléen), pour que le client puisse mettre à jour son cache.
  Une suppression renvoie la ressource supprimée.
- Une mutation qui réussit renvoie toujours la ressource : son type de retour est non nullable (`Article!`).
- Une erreur passe par `errors`, pas par une valeur `null`.

## Erreurs

Les erreurs sont levées avec les classes de `helpers/errors.js` :

| Classe | Code | Usage |
| --- | --- | --- |
| `BadRequestError(code, message)` | `code` donné (`INVALID_INPUT`, `NO_CHANGE`…) | données invalides ou argument manquant |
| `NotAuthenticatedError` | `UNAUTHENTICATED` | aucun utilisateur authentifié |
| `NotAuthorizedError` | `NOT_AUTHORIZED` | utilisateur authentifié sans droit sur la ressource |
| `NotFoundError(type, id)` | `NOT_FOUND` | ressource introuvable (ou inaccessible, pour ne pas révéler qu'elle existe) |

Vérifier l'authentification avant les arguments : un utilisateur non authentifié doit recevoir `UNAUTHENTICATED`, même si un argument manque.

## Documentation du schéma

- Les descriptions et les raisons de dépréciation sont rédigées en anglais.
- Chaque requête et mutation a une description qui précise ce qu'elle renvoie et les droits nécessaires (`Requires authentication with access to the article.`).

## Faire évoluer le schéma sans casser les clients

Le front est déployé en même temps que l'API, mais les outils d'export ([stylo-export](https://github.com/EcrituresNumeriques/stylo-export)) et les scripts des utilisateurs ne le sont pas.
Un changement se fait donc en deux temps :

1. dans une version mineure, ajouter la nouvelle forme et marquer l'ancienne avec `@deprecated` ;
2. lors de la version majeure suivante, supprimer l'ancienne forme, une fois les clients migrés.

La raison de dépréciation indique ce qu'il faut utiliser à la place :

```graphql
renameCorpus(corpusId: ID!, name: String!): Corpus @deprecated(reason: "Use updateCorpus with input.name instead.")
```

### Renommer un argument

Le nouvel argument et l'ancien sont tous les deux **facultatifs** (`graphql-js` n'accepte `@deprecated` que sur un argument facultatif) ; le résolveur utilise le nouveau en priorité et vérifie qu'une des deux formes est fournie avec `requireArgument` (`helpers/arguments.js`) :

```graphql
article(articleId: ID, article: ID @deprecated(reason: "Use articleId instead.")): Article
```

```js
const articleId = requireArgument('articleId', args.articleId, args.article)
```

Lors de la version majeure, l'ancien argument est supprimé et le nouveau devient obligatoire (`ID!`).

### Renommer un input type

Un type ne peut pas être déprécié.
On crée le nouveau type et on l'utilise dans le nouvel argument (`input: CreateUserInput`), l'ancien argument gardant l'ancien type (`details: NewUserInput @deprecated`).
L'ancien type est décrit comme déprécié dans sa description et supprimé avec l'ancien argument.

### Changements qui ne peuvent pas passer par une dépréciation

Ces changements sont réservés à une version majeure et listés dans [#2132](https://github.com/EcrituresNumeriques/stylo/issues/2132) :

- changer le type de retour d'un champ (`[Tag]` → `Article`) ;
- rendre un argument ou un champ d'input obligatoire, ou une liste en argument non nullable ;
- renommer ou supprimer une valeur d'enum renvoyée par l'API ;
- renommer le type d'un argument existant.

À l'inverse, rendre un champ de sortie non nullable, ajouter un champ, un argument facultatif ou un type ne casse pas les clients.

### Vérifier l'absence de changement cassant

`findBreakingChanges` de `graphql-js` compare deux schémas.
Le schéma de `master` est construit à partir de ses seules définitions de types (`buildSchema`) : ses résolveurs ne correspondent plus forcément à ceux de la branche.

```sh
git show origin/master:graphql/schema.js \
  | sed 's/^module.exports = makeExecutableSchema({ typeDefs, resolvers })$/module.exports = require("graphql").buildSchema(typeDefs)/' \
  > graphql/schema.master.tmp.js
node -e "
const { findBreakingChanges } = require('graphql')
const changes = findBreakingChanges(require('./graphql/schema.master.tmp.js'), require('./graphql/schema.js'))
changes.forEach((c) => console.log(c.type, c.description))
console.log(changes.length, 'changement(s) cassant(s)')
"
rm graphql/schema.master.tmp.js
```

## Après une modification du schéma

- Mettre à jour `schema.graphql` à la racine du dépôt (schéma utilisé par l'IDE).
- Mettre à jour les requêtes du front (`front/src/hooks/*.graphql`) : le front ne doit utiliser aucun champ ni argument déprécié.
- Tester la nouvelle forme **et** l'ancienne forme dépréciée dans les tests des résolveurs, ainsi que l'erreur quand aucune n'est fournie.
- Mettre à jour la liste des suppressions prévues dans [#2132](https://github.com/EcrituresNumeriques/stylo/issues/2132).
- Si le changement concerne une requête utilisée dans la documentation, mettre à jour le tutoriel GraphQL (`docs/src/*/tutori*/api-graphql.md`).
