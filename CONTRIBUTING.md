# Contribuer à Stylo

Merci de votre intérêt pour Stylo !
Ce document explique où trouver de l'aide, comment signaler un bug ou proposer une évolution, et comment les demandes sont traitées jusqu'à leur mise en production.
Il décrit ensuite les conventions à suivre pour proposer une modification du code.

Pour installer le projet et le lancer en local, consultez la section « Développement local » du fichier [`README.md`](README.md).
L'organisation des fichiers et les principes propres au frontend sont décrits dans le fichier [`front/CONTRIBUTING.md`](front/CONTRIBUTING.md).
Ceux du backend sont décrits dans le fichier [`graphql/CONTRIBUTING.md`](graphql/CONTRIBUTING.md), et les règles d'évolution de l'API dans le fichier [`graphql/CONVENTIONS.md`](graphql/CONVENTIONS.md).

## Obtenir de l'aide

Selon votre besoin, plusieurs ressources sont à votre disposition :

- La [documentation](https://stylo-doc.ecrituresnumeriques.ca/) décrit les fonctionnalités de Stylo et propose des tutoriels. Sa [foire aux questions](https://stylo-doc.ecrituresnumeriques.ca/fr/faq/) recense les [problèmes connus](https://stylo-doc.ecrituresnumeriques.ca/fr/faq/problemes/).
- Le [forum de la communauté Stylo](https://discussions.revue30.org/c/stylo/5) permet de poser une question sur l'utilisation de Stylo, de faire remonter un besoin ou de partager une pratique.
- Une permanence en visioconférence a lieu tous les jeudis de 11 h à 12 h (heure de Montréal) sur [meet.jit.si/stylo](https://meet.jit.si/stylo), pour un accompagnement plus personnalisé.
- L'adresse <contact@ecrituresnumeriques.ca> permet de joindre directement l'équipe, par exemple si vous êtes une revue et que vous souhaitez intégrer Stylo à votre chaîne éditoriale.
- Les [discussions GitHub](https://github.com/EcrituresNumeriques/stylo/discussions) accueillent les questions et les réflexions qui portent sur le code, l'architecture ou l'API.

Les [issues GitHub](https://github.com/EcrituresNumeriques/stylo/issues) sont réservées aux bugs et aux évolutions à réaliser.
Pour une question d'utilisation, préférez le forum.

## Signaler un bug

Avant de signaler un bug, vérifiez qu'il ne figure pas déjà parmi les [problèmes connus](https://stylo-doc.ecrituresnumeriques.ca/fr/faq/problemes/) ou les [issues ouvertes](https://github.com/EcrituresNumeriques/stylo/issues).
Si c'est le cas, ajoutez plutôt un commentaire à l'issue existante pour préciser votre situation.

Sinon, [ouvrez une issue](https://github.com/EcrituresNumeriques/stylo/issues/new) en indiquant si possible :

- ce que vous faisiez, étape par étape, afin que nous puissions reproduire le problème ;
- ce que vous attendiez et ce qui s'est réellement passé (message d'erreur, capture d'écran, etc.) ;
- l'instance concernée (par exemple [stylo.huma-num.fr](https://stylo.huma-num.fr)) et le numéro de version affiché dans le pied de page ;
- votre navigateur et votre système d'exploitation ;
- l'adresse de l'article ou du corpus concerné, s'il peut être partagé.

Ne publiez jamais de mot de passe, de jeton d'API ou de contenu confidentiel dans une issue, car elles sont publiques.
Si vous n'avez pas de compte GitHub, vous pouvez décrire le problème sur le forum ou lors de la permanence et l'équipe se chargera d'ouvrir l'issue.

> [!IMPORTANT]
> Une faille de sécurité ne doit pas être signalée dans une issue publique.
> Suivez la procédure décrite dans le fichier [`SECURITY.md`](SECURITY.md).

## Proposer une évolution

Une idée a plus de chances d'aboutir si le besoin est discuté avant que la solution ne soit développée.

- Si votre proposition concerne l'usage de Stylo (une nouvelle fonctionnalité, un parcours à améliorer, un format d'export, etc.), présentez-la sur le [forum de la communauté](https://discussions.revue30.org/c/stylo/5) ou lors de la permanence.
- Si elle concerne le code, l'architecture ou l'API, ouvrez une discussion GitHub dans la catégorie [« Ideas »](https://github.com/EcrituresNumeriques/stylo/discussions/categories/ideas).

Décrivez le besoin et son contexte (qui est concerné, dans quelle situation, ce qui est gênant aujourd'hui) plutôt que la seule solution envisagée.
Quand le besoin est suffisamment clair, l'équipe le transforme en une ou plusieurs issues.

Si vous souhaitez développer vous-même une évolution, parlez-en d'abord dans une discussion ou dans l'issue correspondante.
Vous éviterez ainsi de travailler sur une solution qui ne pourrait pas être intégrée.
Les issues portant le label [`good first issue`](https://github.com/EcrituresNumeriques/stylo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%20%3Ababy%3A%22) sont de bons points de départ pour une première contribution.

## Comment les demandes sont traitées

### Priorisation

Les issues sont suivies par l'équipe dans le tableau « Backlog Stylo », un projet GitHub de l'organisation EcrituresNumeriques.
Chaque issue y avance de statut en statut :

| Statut               | Signification                                                                   |
| -------------------- | ------------------------------------------------------------------------------- |
| À prioriser          | Nouvelle demande, à trier lors de la prochaine réunion de coordination          |
| Discussions en cours | Demande retenue, dont le besoin ou la solution restent à préciser               |
| Prêt·e               | Design et solution technique clairs, l'issue peut être développée               |
| En cours             | En développement (pull request en brouillon ou en revue)                        |
| À tester             | Fusionnée sur `master` et déployée sur [stylo-dev](https://stylo-dev.huma-num.fr) |
| Validé               | Testée et validée sur stylo-dev, prête pour la prochaine mise en production     |
| Fini·e               | En production, issue fermée                                                     |
| En Pause             | Mise de côté pour le moment                                                     |

Le tri et la priorisation sont faits par l'équipe en réunion de coordination.
L'ordre des issues entre « À prioriser » et « Prêt·e » indique leur priorité.
Si des informations manquent pour comprendre une demande, l'issue reçoit le label `[triage] need information 💬` et nous vous posons la question en commentaire.

Les évolutions de plus grande ampleur sont regroupées en chantiers.
Un chantier est une issue dont le titre commence par [`[META]`](https://github.com/EcrituresNumeriques/stylo/issues?q=is%3Aissue%20state%3Aopen%20in%3Atitle%20%22%5BMETA%5D%22) et dont les tickets sont rattachés en sous-issues.
Les chantiers sont planifiés dans un second projet GitHub, « Roadmap Stylo ».

### De la fusion à la mise en production

Une issue n'est pas fermée quand la pull request qui la corrige est fusionnée.

1. À la fusion sur `master`, le changement est déployé automatiquement sur [stylo-dev.huma-num.fr](https://stylo-dev.huma-num.fr) et les issues liées à la pull request passent en « À tester ».
2. L'équipe teste le changement sur stylo-dev. S'il convient, l'issue passe en « Validé ». Sinon, un commentaire décrit ce qui ne va pas et l'issue retourne en « En cours ».
3. Quand plus aucune issue n'est « À tester », une nouvelle version peut être publiée et déployée sur [stylo.huma-num.fr](https://stylo.huma-num.fr).
4. Après la mise en production, les issues « Validé » incluses dans la version passent en « Fini·e » et sont fermées, avec un commentaire qui indique la version.

Si vous avez signalé un bug, vous pouvez donc vérifier sa correction sur stylo-dev dès que l'issue est « À tester », et votre retour en commentaire est le bienvenu.

### Livraison

La publication d'une version et son déploiement en production sont décrits dans le fichier [`RELEASE.md`](RELEASE.md).
Les notes de chaque version sont publiées sur la page des [releases GitHub](https://github.com/EcrituresNumeriques/stylo/releases).

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

La portée est facultative et précise le domaine concerné, par exemple `front`, `graphql`, `editor`, `export`, `infra` ou `deps`.
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

La description explique le problème résolu, les chemins de pensées et la solution retenue.
Si la pull request corrige une issue, mentionnez-la avec un mot-clé (par exemple `closes #123`) afin de lier les deux.
Ce lien fait passer l'issue en « À tester » à la fusion (voir [De la fusion à la mise en production](#de-la-fusion-à-la-mise-en-production)).
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
Commencez par ajouter des tests qui correspondent à l'intention de votre modification.

Avant de lancer les tests pour la première fois, copiez le fichier `stylo-example.env` vers `.env`, à la racine du dépôt, s'il n'existe pas encore :

```bash
cp stylo-example.env .env
```

### `front`

Les tests unitaires utilisent [Vitest](https://vitest.dev/) :

```bash
npm test -w front
```

Les tests de bout en bout utilisent [Playwright](https://playwright.dev/).
Ils nécessitent que MongoDB et l'application soient démarrés (`npm run dev`, voir le fichier [`README.md`](README.md)) :

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
