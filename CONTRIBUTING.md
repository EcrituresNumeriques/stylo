# Contribuer à Stylo

Merci de votre intérêt pour Stylo !
Ce document décrit les conventions à suivre pour proposer une modification du code.
Pour installer le projet et le lancer en local, consultez la section « Développement local » du fichier [`README.md`](README.md).

## Messages de commit

Les messages de commit suivent la convention [Conventional Commits](https://www.conventionalcommits.org/fr/) (aussi appelée « commits sémantiques ») :

```
<type>(<portée>): <description>
```

Les types les plus utilisés sont :

- `feat` pour une nouvelle fonctionnalité
- `fix` pour une correction de bug
- `refactor` pour une modification du code qui ne change pas son comportement
- `test` pour l'ajout ou la modification de tests
- `docs` pour la documentation
- `ci` pour les workflows GitHub Actions
- `chore` pour le reste (outillage, configuration, dépendances, etc.)

La portée est facultative et précise la partie du projet concernée, par exemple `front`, `graphql`, `editor`, `export`, `infra` ou `deps`.
Un changement non rétrocompatible est signalé par un `!` après le type ou la portée (par exemple `feat(graphql)!: …`).

La description est rédigée en français, commence par un verbe au présent de l'indicatif et ne se termine pas par un point.
Par exemple :

```
fix(front): recharge la page quand un fichier de l'application est introuvable
feat(graphql): ajoute User.contacts, Tag.creator et Corpus.workspaceId
chore(sentry): réduit le bruit des erreurs remontées
```

## Pull requests

### Titre

Les notes de version (_changelog_) sont générées automatiquement par GitHub à partir des titres des pull requests fusionnées.
Ces notes sont lues par les utilisateur·ices de Stylo, c'est pourquoi le titre d'une pull request **n'utilise pas** le format des commits sémantiques.
Il s'agit d'une phrase en français, compréhensible par une personne qui ne connaît pas le code, qui décrit l'effet du changement du point de vue des utilisateur·ices.

Le titre commence par une majuscule et un verbe au présent, sans préfixe `fix:` ou `feat:` et sans point final.
Il évite autant que possible le vocabulaire technique (noms de fichiers, de composants, de bibliothèques, etc.).

| À éviter                                                                 | À privilégier                                                                     |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `fix(security): empêche la fuite des jetons OAuth tiers entre utilisateurs` | `Empêche la fuite des jetons OAuth tiers entre utilisateurs`                      |
| `fix(i18n): restreint la langue détectée aux langues prises en charge`   | `Corrige le plantage de la page d'accueil avec certaines langues de navigateur`   |
| `feat: compression gzip des réponses GraphQL`                             | `Compresse les réponses de l'API pour accélérer le chargement`                    |

### Description

La description explique le problème résolu et la solution retenue.
Si la pull request corrige une issue, mentionnez-la avec un mot-clé (par exemple `Closes #123`) afin de lier les deux.
Indiquez également comment vérifier le changement, en particulier quand il n'est pas couvert par des tests automatisés.

## Formatage et lint

Le formatage et le lint du code reposent sur [Biome](https://biomejs.dev/), configuré dans le fichier [`biome.json`](biome.json) à la racine du dépôt (complété par un fichier `biome.json` dans chaque workspace).
N'utilisez pas Prettier ni ESLint.

Pour vérifier le code de l'ensemble des workspaces :

```bash
npm run lint
```

Pour corriger automatiquement les erreurs de formatage et une partie des erreurs de lint :

```bash
npm run lint:fix
```

Ces commandes sont aussi disponibles pour un seul workspace, par exemple `npm run lint -w front`.
Le lint est exécuté automatiquement après les tests (`npm test`), donc une erreur de lint fait échouer l'intégration continue.

> [!TIP]
> Biome propose une [extension pour la plupart des éditeurs](https://biomejs.dev/guides/editors/first-party-extensions/) qui permet de formater le code à l'enregistrement.

## Tests

Chaque workspace a ses propres tests, exécutés par l'intégration continue sur chaque pull request.
Ajoutez ou mettez à jour les tests qui correspondent à votre modification.

Avant de lancer les tests pour la première fois, créez le fichier `.env` à la racine du dépôt s'il n'existe pas encore :

```bash
cp stylo-example.env .env
```

### `front`

Les tests unitaires utilisent [Vitest](https://vitest.dev/) :

```bash
npm test -w front
```

Les tests de bout en bout utilisent [Playwright](https://playwright.dev/).
Ils nécessitent que l'application soit démarrée (voir le fichier [`README.md`](README.md)) :

```bash
npx playwright install chromium # la première fois
npm run test:e2e -w front
```

### `graphql`

Les tests utilisent le lanceur de tests intégré à Node.js (`node --test`) :

```bash
npm test -w graphql
```

Une partie des tests démarre une base de données MongoDB avec [Testcontainers](https://testcontainers.com/), il faut donc que Docker soit disponible sur votre machine.
Ces tests valident également les requêtes GraphQL du `front` (fichiers `front/src/**/*.graphql`) par rapport au schéma de l'API.
