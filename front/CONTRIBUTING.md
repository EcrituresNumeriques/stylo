# Contribuer au frontend de Stylo

Ce document décrit l'organisation des fichiers et les principes en place dans le dossier `front`.
Il s'adresse à toute personne (ou tout agent) qui modifie le code, afin que les contributions restent cohérentes entre elles.

Les conventions communes à tout le dépôt (messages de commit, titres de pull request, lint) sont décrites dans le fichier [`CONTRIBUTING.md`](../CONTRIBUTING.md) à la racine.
Les commandes d'installation, de développement et de build sont décrites dans le fichier [`README.md`](README.md).

## En résumé

- Les composants suivent le principe de l'_atomic design_ (atomes, molécules, organismes, pages) et les dépendances vont toujours du plus gros vers le plus petit.
- L'état de l'application repose sur [SWR](https://swr.vercel.app/) pour les données du serveur et sur [React Router](https://reactrouter.com/) pour l'URL et la session. Il n'y a ni Redux ni contexte React global.
- Chaque composant a son propre fichier de styles (module SCSS).
- Tout texte affiché est traduit en français, en anglais et en espagnol.
- Un composant réutilisable est présenté sur la page `/ux`.
- Le code est écrit en JavaScript (ESM) et typé avec des commentaires JSDoc. Il n'y a pas de TypeScript.
- [Biome](https://biomejs.dev/) assure le lint et le formatage, [Vite](https://vite.dev/) le développement, le build et la prévisualisation, [Vitest](https://vitest.dev/) et [Playwright](https://playwright.dev/) les tests.

## Organisation des fichiers

```
front/
├── e2e/                  tests de bout en bout (Playwright)
├── public/               fichiers statiques servis tels quels (polices, images, favicons)
├── tests/setup.js        configuration des tests Vitest et fonction renderWithProviders
├── index.html            gabarit HTML (Handlebars)
├── vite.config.js        configuration de Vite et de Vitest
└── src/
    ├── index.jsx         point d'entrée : Sentry, déclaration des routes
    ├── config.js         configuration de l'application (URL des services)
    ├── i18n.js           configuration des traductions
    ├── components/
    │   ├── atoms/        briques élémentaires
    │   ├── molecules/    assemblages génériques d'atomes
    │   ├── organisms/    blocs fonctionnels, rangés par domaine métier
    │   └── pages/        une page par route
    ├── hooks/            hooks React et requêtes GraphQL (fichiers .graphql)
    ├── helpers/          fonctions sans React (GraphQL, Markdown, BibTeX, préférences…)
    ├── locales/          traductions (fr, en, es)
    ├── schemas/          schémas JSON des formulaires de métadonnées
    ├── stories/          page de démonstration des composants (/ux)
    └── styles/           variables, mixins et styles globaux
```

## Composants

### Les quatre niveaux

| Niveau | Dossier | Rôle | Exemples |
| --- | --- | --- | --- |
| Atome | `components/atoms` | Élément d'interface indivisible, sans connaissance du métier et sans accès aux données | `Button`, `Field`, `Checkbox`, `Badge` |
| Molécule | `components/molecules` | Assemblage générique d'atomes, réutilisable dans n'importe quel domaine | `Modal`, `Alert`, `DropdownMenu`, `Loading` |
| Organisme | `components/organisms/<domaine>` | Bloc fonctionnel lié à un domaine métier, qui peut charger et modifier des données | `article/ArticleForm`, `tag/TagsList`, `workspace/WorkspaceItem` |
| Page | `components/pages` | Composant associé à une route, qui compose des organismes | `Articles`, `Corpus`, `Workspaces` |

Le niveau « templates » de l'_atomic design_ n'est pas utilisé.
La mise en page commune (entête, pied de page, zone principale) est portée par le composant `pages/App.jsx`.

Les organismes sont rangés dans un sous-dossier par domaine : `article`, `bibliography`, `corpus`, `export`, `metadata`, `tag`, `textEditor`, `user`, `version`, `workspace`, etc.

### Limiter les interdépendances

Un composant n'importe que des composants de niveau inférieur :

- un atome n'importe aucun autre niveau ;
- une molécule importe des atomes ;
- un organisme importe des atomes et des molécules ;
- une page importe des organismes, des molécules et des atomes.

Les imports entre organismes de domaines différents sont à éviter autant que possible.
Si deux domaines ont besoin du même élément, il vaut mieux en extraire la partie générique dans une molécule, ou composer les deux organismes au niveau de la page.
La même règle s'applique aux feuilles de styles, un composant n'importe donc jamais celle d'un composant de niveau supérieur.
Quand une molécule générique a besoin d'un élément propre à un domaine, l'organisme qui l'utilise le lui fournit par ses props (voir `molecules/Form.jsx` et `organisms/metadata/MetadataForm.jsx`).

### Écrire un composant

- Un composant est une fonction, exportée par défaut, dans un fichier `NomDuComposant.jsx`.
- Les fichiers qui l'accompagnent portent le même nom et sont placés à côté : `NomDuComposant.module.scss`, `NomDuComposant.test.jsx`.
- Les atomes et les molécules sont exposés par le fichier `index.js` de leur dossier, et importés par ce biais (`import { Button } from '../atoms/index.js'`).
- Les imports relatifs précisent toujours l'extension du fichier (`.js`, `.jsx`, `.scss`, `.graphql`).
- Les classes CSS conditionnelles sont combinées avec `clsx`.
- Les icônes viennent de `lucide-react`.
- Les notifications utilisent `react-toastify`, et les boîtes de dialogue le hook `useModal` avec la molécule `Modal` (élément `<dialog>` natif).
- Les props et les valeurs de retour des hooks et des fonctions utilitaires sont documentées avec JSDoc.
- Avant d'ajouter une dépendance, vérifiez qu'une solution native ou déjà présente ne suffit pas. C'est pour cette raison que le projet se passe de Storybook, par exemple.

## État et données

### Données du serveur avec SWR

Les données de l'API GraphQL sont lues avec SWR, qui tient lieu de cache partagé entre les composants.
Deux composants qui appellent le même hook avec les mêmes variables partagent la même requête et le même résultat, sans avoir besoin d'un _store_.

- Les requêtes et les mutations GraphQL sont écrites dans des fichiers `.graphql`, dans le dossier `hooks`, et importées par leur nom (`import { getTags } from './Tag.graphql'`).
- La lecture passe par `useFetchData` ou `useConditionalFetchData` (`hooks/graphql.js`), qui construisent la clé SWR. Cette clé contient le jeton de session, ce qui évite de partager le cache entre deux comptes.
- Une mutation est envoyée avec `executeQuery` (`helpers/graphQL.js`), puis le cache est mis à jour avec la fonction `mutate` renvoyée par `useFetchData` ou par `useMutateData`.
- Cette logique est regroupée dans un hook par domaine (`hooks/article.js`, `hooks/corpus.js`, `hooks/workspace.js`, etc.) qui expose les données et les actions. Les composants appellent ces hooks plutôt que SWR directement.
- Les API REST (service d'export, Nakala, flux de la communauté) suivent le même principe avec `useSWR` dans un hook dédié.

Les fichiers `.graphql` sont validés par rapport au schéma de l'API dans les tests du workspace `graphql`.
Une modification du schéma ou d'une requête doit donc être vérifiée avec `npm test -w graphql`.

### URL et session avec React Router

- Les routes sont déclarées à un seul endroit, dans `src/index.jsx`. Les pages sont chargées à la demande avec `lazy`.
- Ce qui décrit « où se trouve » l'utilisateur·ice appartient à l'URL : identifiant de l'article ou de l'espace de travail (`useParams`), filtres et options d'affichage (`useSearchParams`). Un lien copié doit rouvrir le même écran.
- L'utilisateur·ice connecté·e est chargé·e par le `loader` de la route `app` et se lit avec `useRouteLoaderData('app')` ou avec les hooks de `hooks/user.js`.
- Les routes qui demandent une authentification sont enfants de `RequireAuth` (`pages/PrivateRoute.jsx`).

### Fonctionnalités activables

Une fonctionnalité en cours de développement peut être désactivée ou réservée à certaines personnes.
L'API renvoie les fonctionnalités activées pour la personne connectée, et un composant le vérifie avec le hook `useFeature('<nom>')` (`hooks/features.js`).
Le format du fichier qui les déclare est décrit dans la section « Fonctionnalités activables » du fichier [`SERVER.md`](../SERVER.md).

### Préférences et état local

- Les préférences conservées d'une visite à l'autre (panneau ouvert, options d'export, espace de travail actif) sont enregistrées dans le `localStorage` et se lisent avec le hook `usePreferenceItem` (`hooks/user.js`).
- Le reste (champ en cours de saisie, élément déplié) est un état local géré avec `useState`.
- Le contenu de l'article en cours d'édition est synchronisé en temps réel avec Yjs à travers un WebSocket (`hooks/collaboration.js` et `organisms/textEditor/collaborating.js`).

## Styles

- Chaque composant a son propre module SCSS, importé sous le nom `styles` (`import styles from './Button.module.scss'`). Les noms de classes sont ainsi locaux au composant, ce qui évite qu'un style ait un effet de bord ailleurs.
- Les couleurs, les points de rupture et les mixins partagés sont définis dans `src/styles` et s'importent avec `@use '../../styles/variables' as *;`. Une couleur ou un point de rupture n'est pas écrit en dur dans un composant.
- Les styles globaux (`styles/general.scss`) sont réservés aux éléments HTML de base et à la typographie. Ils ne doivent pas grossir pour répondre au besoin d'un composant en particulier.
- Un composant parent ajuste le placement d'un enfant en lui passant une `className`, pas en ciblant ses classes internes.

## Traductions

L'interface est disponible en français, en anglais et en espagnol, avec [i18next](https://www.i18next.com/).

- Aucun texte visible (libellé, `aria-label`, `title`, message d'erreur) n'est écrit en dur dans un composant. Il passe par la fonction `t` du hook `useTranslation`.
- Les traductions sont dans `src/locales/<langue>/<namespace>.json`. Le namespace par défaut est `translation`, et les autres regroupent les textes par domaine (`article`, `corpus`, `workspace`, `editor`, `user`, etc.).
- Une nouvelle clé est ajoutée dans les trois langues en même temps.
- La page `/ux` fait exception, puisque ses textes d'exemple sont en français.

## Accessibilité

L'accessibilité fait partie des critères de qualité du projet, et plusieurs règles Biome de la catégorie `a11y` sont actives.

- Privilégiez les éléments HTML sémantiques (`<button>`, `<nav>`, `<search>`, `<dialog>`) aux `<div>` rendues interactives.
- Tout élément interactif est utilisable au clavier et porte un nom accessible.
- Le focus est géré lors des changements de page et à l'ouverture des boîtes de dialogue (`helpers/focus.js`, `hooks/focusZone.js`).

## Page de démonstration `/ux`

La page [`/ux`](http://localhost:3000/ux) présente sur un seul écran la typographie et les composants de l'interface, à la manière de Storybook mais sans cette dépendance.
Elle sert à vérifier visuellement un composant dans ses différents états et à repérer ce qui existe déjà avant d'en créer un nouveau.

- La page est le composant `src/stories/Story.jsx`.
- Quand la présentation d'un composant demande plusieurs variantes, elle est écrite dans un fichier `src/stories/<Composant>.story.jsx`, puis ajoutée dans une section de `Story.jsx`.
- Un nouvel atome ou une nouvelle molécule est ajouté à cette page, de même que toute nouvelle variante d'un composant existant.

## Tests

La couverture de tests est encore partielle.
Toute contribution est l'occasion de l'améliorer, en commençant par les tests qui décrivent l'intention de la modification.

### Tests unitaires et de composants

Ces tests utilisent Vitest, [Testing Library](https://testing-library.com/) et jsdom.

```bash
npm test -w front
```

- Le fichier de test est placé à côté du fichier testé (`Button.jsx` et `Button.test.jsx`, `markdown.js` et `markdown.test.js`).
- Les fonctions de `helpers` sont testées directement, sans rendu.
- Un composant qui dépend du routeur ou des traductions est rendu avec `renderWithProviders` (`tests/setup.js`).
- `fetch` est simulé globalement. Un test fournit la réponse attendue avec `fetch.mockResolvedValue(...)` et peut vérifier la requête envoyée.
- Les éléments sont recherchés de préférence par leur rôle et leur nom accessible (`getByRole`), comme le ferait une personne, et à défaut par un `data-testid`.

### Tests de bout en bout

Les tests de bout en bout utilisent Playwright et se trouvent dans le dossier `e2e`.
Ils sont encore très peu nombreux (page d'accueil et connexion) et ont vocation à couvrir les parcours principaux.

```bash
npm run test:e2e -w front
```

Ils demandent que MongoDB et l'application soient démarrés (`npm run dev`), et créent un compte de test `teste2e` qui est supprimé à la fin.
Ces tests ne sont pas lancés automatiquement sur les pull requests. Le workflow GitHub « Tests e2e » se déclenche à la main.

## Outils

| Besoin | Outil | Commande |
| --- | --- | --- |
| Développement | Vite | `npm run dev` (frontend et API) ou `npm start -w front` |
| Build | Vite | `npm run build -w front` |
| Prévisualisation du build | Vite | `npm run preview -w front` |
| Lint et formatage | Biome | `npm run lint -w front` et `npm run lint:fix -w front` |
| Tests unitaires et de composants | Vitest | `npm test -w front` |
| Tests de bout en bout | Playwright | `npm run test:e2e -w front` |

Les commandes se lancent depuis la racine du dépôt.
N'utilisez ni Prettier ni ESLint.
La commande `npm test` enchaîne les tests et le lint, comme l'intégration continue, qui lance ensuite le build.

### Configuration

Les variables d'environnement sont lues dans le fichier `.env` à la racine du dépôt.
Celles destinées au frontend sont préfixées par `FRONT_`, injectées au build par `vite.config.js` et regroupées dans `src/config.js`.
Un composant lit la configuration depuis `applicationConfig` et jamais depuis une variable globale.

## Avant d'ouvrir une pull request

- [ ] Le composant est placé au bon niveau (atome, molécule, organisme, page) et n'importe que des niveaux inférieurs.
- [ ] Les styles sont dans un module SCSS propre au composant et utilisent les variables partagées.
- [ ] Les textes sont traduits en français, en anglais et en espagnol.
- [ ] Le composant est utilisable au clavier et porte des noms accessibles.
- [ ] Les données passent par un hook du dossier `hooks`, et ce qui doit survivre à un rechargement de page est dans l'URL.
- [ ] Un nouveau composant réutilisable est présenté sur la page `/ux`.
- [ ] Des tests couvrent la modification et `npm test -w front` passe (tests et lint).
