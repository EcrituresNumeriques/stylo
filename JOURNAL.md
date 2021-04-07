# Journal de développement

## Mercredi 7 avril 2021

### Ce que j'ai aimé/appris

- la propriété `gap` (et qu'on pouvait pas l'utiliser partout — cf. compat navigateur)

### Ce que j'ai trouvé difficile

- le formulaire (avec accordéons) qui explose parce qu'on n'affiche pas les mêmes champs
- copier/coller les changements CSS à 3 endroits différents parce que c'est pareil, mais pas (encore) mutualisé

### Ce qu'on pourrait améliorer la prochaine fois

- nan ça va

## Jeudi 4 mars 2021

### Ce que j'ai aimé/appris

- Aimé l'API Isidore, simple, répond rapidement et cohérente
- Appris les petites subtilités sur json-reactschema-form… et j'aime qu'on arrive toujours à trouver une solution
- Ne pas mutualiser tout de suite le code de l'autocomplétion, on a pu produire un résultat plus vite
- Réutiliser le `PartialUpdate`, ça a fonctionné du premier coup
- Matinée productive
- Déclarer des fields custom, et les piloter depuis le schéma (robuste et statique)

### Ce que j'ai trouvé difficile

- Je me suis perdu dans les props passées aux composants de Downshift, en suivant la doc j'ai pas réussi… heureusement l'autocomplétion basée sur les types TypeScript nous a débloqué

### Ce qu'on pourrait améliorer la prochaine fois

- Obtenir des retours
- Mettre en prod

## Jeudi 25 février 2021

### Ce que j'ai aimé/appris

- La finalisation de tous ces travaux engagés
- Merger et déployer sur stylo-dev
- Tout rassembler permet de déceler les petits cas à la marge, de peaufinage. Le dernier coup de pinceau. C'est agréable !
- J'ai appris quelques trucs sur l'image Docker de Nginx
- J'ai appris les moteurs de recherche sur Firefox
- Le REPL Node !
- C'est un peu magique, cette histoire de "Cookie Proxy" (mais solution rapidement trouvée)
- J'ai aimé le côté distribué de Git : les commits que j'ai écrasé avec un force push étaient encore sur ta machine (merci `cherry-pick`)
- Alterner tests/implémentation sur la transformation des données, c'était hyper adapté
- J'ai aimé proposer un fix à react-jsonschema-form pour le bug des valeurs vides dans les select/enum
- J'ai un peu peur de l'écriture de fonctions récursives, mais écrire l'usage, puis ensuite écrire l'implémentation
- Notre premier jeudi ! (alors que d'hab on travaille les mercredi)

### Ce que j'ai trouvé difficile

- Non, aujourd'hui tranquille !
- Un peu peu sur la partie "Cookies", mais avec un coup de Stackoverflow j'ai vite vu que c'était une histoire de Proxy

### Ce qu'on pourrait améliorer la prochaine fois

- Proposer des rendez-vous à Antoine pour valider des PR critiques (typiquement les métadonnées) — genre si pas de retours d'Antoine la semaine prochaine

## Mercredi 10 février 2021

### Ce que j'ai aimé/appris

- La matinée, avec Maïtané : prises de décision rapide, partage d'idées, etc.
- J'ai appris les marges ! L'ordre (haut, droite, bas, gauche)
- Sass a été pratique pour la réutilisation des styles
- J'ai mieux la relation entre "styled components" et quels composants enfants ça impacte
- J'ai aimé l'isolation des styles qu'on a introduit, avec une cascade limitée
- On a (quasi) fini les formulaires, style homogène et plus sympa à utiliser (moins austère)
- Factoriser le composant "Edit" / "Versions" à 3 été un chouette moment, et on a rendu le composant plus explicite
- Revenir dans le générateur, m'a donné l'impression d'avoir mieux digéré son fonctionnement — le styler à parité sans surcharger les composants

### Ce que j'ai trouvé difficile

- Les styles, ça a pris des plombes — mutualiser, sans effet de bord
- Y'a des composants bizarrement fichus qui donnent envie de les réécrire/simplifier la maintenance

### Ce qu'on pourrait améliorer la prochaine fois

- davantage se préparer avec Maïtané sur l'objectif de groupe
- les sidebars…
- …et mémoriser les choix utilisateur·ices (sidebar ouverte/fermée, panneaux ouvert/fermés, etc.)
- proposer une session test/review/validation avec Antoine histoire de mettre en prod

## Mercredi 3 février 2021

N/A

## Mercredi 20 janvier 2021

### Ce que j'ai aimé/appris

- Quelques trucs sur le HTML sémantique (un seul `<main>` par page, par exemple)
- Le `<input type="color">` ! Très pratique
- Le module `@snowpack/plugin-react-refresh`
- L'aspect composant poussé par l'UX
- On rationalise pas mal de choses côté styles, ça semble moins fragile désormais… ça nous a permis de découvrir davantage d'écrans
- Le redirect `/*` vers la page `index.html` avec Netlify
- Chouette d'avoir pairé sur un seul ordi, en partage d'écran
- Trouvé ça cool de faire une petite démo à Maïtané en début d'aprem
- Je suis content que des boutons ressemblent à des boutons (on prend plus plaisir sur l'appli)

### Ce que j'ai trouvé difficile

- Un peu au début pour savoir pourquoi un style ne s'applique pas (Sass modules appliqués à React)
- Partage d'écran sur le moniteur externe qui plombait les perfs de mon ordi (temps de compilation ultra lent, etc.)

### Ce qu'on pourrait améliorer la prochaine fois

- Inviter Maïtané sur un bout de la session

## Mercredi 13 janvier 2021

### Ce que j'ai aimé/appris

- Remplacer Gatsby/Webpack en 2h par Vanilla/Snowpack (et gagner en temps d'install, temps de build)
- Moins de magie avec Snowpack
- On commence à avoir des éléments d'UX qui arrivent (merci @maiwann !)
- Réduction du stress sur la "magie" du démarrage de l'application (côté front)
- Surprenants apprentissages sur les cookies (modes `Lax` et `Strict`), combiné à CORS
- Meilleure compréhension de CORS et des cookies avec le branchement
- Gagner en visibilité grâce aux "Deploy Preview" — top pour refacto ou ne pas casser `stylo-dev` à chaque merge de pull request
- Déployer le front en 25Mo au lieu de 750Mo

### Ce que j'ai trouvé difficile

- Un peu galéré sur l'erreur "Password"… et la structure de base de données en général
- Un peu en manque de jus

### Ce qu'on pourrait améliorer la prochaine fois

- Prendre le temps de creuser Snowpack, pour mieux l'utiliser (notamment distinguer le build de production/dev, etc.)
- Alterner pair et solo
- Pairer : alterner qui écrit/regarde via le partage d'écran

## Mercredi 2 décembre 2020

N/A

## Mercredi 18 novembre 2020

### Ce que j'ai aimé/appris

- j'ai appris qu'on pouvait appliquer des styles nested avec `styled-components` (via `:global`)
- la librairie `react-jsonform` est vraiment chouette, sur le découpage donnée/apparences
- travailler en synchro sur l'UI, quand on paire en mode "1 qui écrit, 1 qui pense/observe/dicte" marche bien
- j'ai trouvé que l'implémentation des groupes a été rapide/facile… beaucoup plus que prévu
- en combinant `uiSchema:classNames` + `:global` ça nous a permis de styler finement les groupes
- l'intégration technique du formulaire s'est faite toute seule, le branchement au flux de données n'a pas posé de problème
- j'ai trouvé ça chouette de virer un doublon de fonctionnalité (import YAML et Raw YAML) et ajouter une validation de syntaxe

### Ce que j'ai trouvé difficile

- pas mal de temps sur les aspects design, pour styler le formulaire comme il faut
- quand on est deux à travailler sur l'UI, le live reload refresh l'interface et ralentit la progression

### Ce qu'on pourrait améliorer la prochaine fois

- être en synchro sur le dév d'interface qui touche aux styles

## Mercredi 30 septembre 2020

### Ce que j'ai aimé/appris

- j'ai bien aimé diagnostiquer la fuite mémoire, ça prouve que l'outillage qu'on a mis en place fait le travail
- cool d'aller voir la lib `Dataloader` pour comprendre comment elle était à l'origine
- chouette de monter en compétence sur du React avec le composant `Downshift` — très chouettes exemples tout prêt, faciles à rebrancher
- la petite sieste de ce midi c'était bien
- on a bien avancé, le composant est quasi fini en terme fonctionnel
- chouette de virer une fuite mémoire en virant un truc utilisé une fois, et qui fait de l'optimisation
- content de voir une preuve de démonstration de l'intégration avec Isidore
- l'aspect progressif de l'amélioration par petite touche ce qui rend le truc tout doux
- j'étais content de voir le résultat du monitoring arriver en live

### Ce que j'ai trouvé difficile

- ce matin j'avais mal au crâne donc j'étais un peu off
- cette aprem j'étais un peu dans les vapes donc je t'ai suivi
- quelques soucis sur le réseau mais c'était gérable

### Ce qu'on pourrait améliorer la prochaine fois

- N/A

## Mercredi 16 septembre 2020

### Ce que j'ai aimé/appris

- une nouvelle librairie — react-jsonschema-form — qui est assez cool
- je me sens plus à l'aise, plus familier avec la syntaxe JSX, les props et tout
- idem avec Gatsby, faire une passe sur les composants a bien aidé
- on a bien avancé dans l'aprem
- j'aime bien supprimer des trucs
- j'ai l'impression qu'on va recoder une fonctionnalité en écrivant peu de code, et en s'appuyant sur un principe plus solide
- refondre le chargement et la validation de l'authentification en nettoyant l'application, en la rendant plus solide
- merger les pull request en attente ! ça libère
- j'ai aimé la proposition d'écrire le composant en dehors du code, on a testé notre intuition
- on a quasiment un schéma fini à une exception près

### Ce que j'ai trouvé difficile

- N/A

### Ce qu'on pourrait améliorer la prochaine fois

- refaire du pair programming en présentiel

### Ce qu'on pourrait améliorer la prochaine fois

## Mardi 21 juillet 2020

### Ce que j'ai aimé/appris

- j'ai trouvé que la répartition du travail était plus confortable (Thomas front, Guillaume back)
- je me sens plus à l'aise avec React au fil des sessions
- j'ai aimé écrire ma première requête GraphQL, et brancher ça à la base de données
- on a un flot Zotero complet (avec un bouton Unlink), et toutes les collections !
- trouver où ajouter les "scopes" Zotero pour autoriser en lecture l'accès aux groupes privés

### Ce que j'ai trouvé difficile

- le mix entre state global, state local, données distantes, données de l'API, structure de base de données
- `window.postMessage()` qui ne fonctionnait plus lors de la reprise, on a passé 1h à remettre des choses en l'état, alors qu'on avait l'impression que ça fonctionnait

### Ce qu'on pourrait améliorer la prochaine fois

- se faire une démo 10 minutes avant la fin de la session pour avoir des idées claires sur quoi on termine

## Mercredi 15 juillet 2020

### Ce que j'ai aimé/appris

- le débrief avec Antoine
- on a des pistes assez claires pour améliorer ce qu'on a développé (validation bibtex, etc.)
- connecter le bouton "m'identifier avec Zotero" avec une popup ça rendait le flux assez simple

### Ce que j'ai trouvé difficile

- la synchronisation des données du profil une fois connecté (à Stylo, à Zotero), pour que l'information redescende dans les composants, _et_ lorsqu'on affiche l'application de zéro (refresh, ou nouvelle session) ; ça pris du temps alors que je ne l'avais pas identifié comme un point de blocage

### Ce qu'on pourrait améliorer la prochaine fois

- rien de spécial

## Mardi 7 juillet 2020

### Ce que j'ai aimé/appris

- j'ai appris encore un peu de Passport (pour l'OAuth Zotero)
- j'ai réappris les `--fixup` git (généralement je fais des rebase interactive en devant me rappeler où mettre quoi)
- utiliser l'API zotero dans un flow OAuth
- y'a toujours des trucs un peu magiques dans React (`useState`, `useEffect`) ; pas clair pourquoi on les met (ça te sort de ton code, on fait plaisir à React)
- j'ai aimé la réutilisation de Passport pour l'OAuth mais pas pour l'authentification, juste pour récupérer le token Zotero
- j'ai bien aimé comment on a résolu deux bugs sans le savoir — ajouter le parseur pour reformer le Bibtex raw après avoir supprimer un élément bibliographique, a résolu le bug de parsing — qui était en fait déjà avant qu'on intervienne sur le projet, mais qu'on ne pouvait pas voir en raison de l'absence de pagination
- j'ai trouvé ça chouette de tester les flux de données, j'étais en confiance quand on refactorait l'import des collections
- la gestion du state de React rend le processus d'import assez chouette en terme d'expérience utilisateur
- je suis content de l'utilisation du temps : on est allé plus lentement que prévu sur la correction de bugs, et on est allé plus vite sur l'OAuth Zotero

### Ce qu'on pourrait améliorer la prochaine fois

- pas cette fois-ci (je me suis souvenu qu'on pouvait suivre un·e participant·e)

## Mercredi 1er juillet 2020

### Ce que j'ai aimé/appris

- il fait chaud, ça commence à devenir dur de bosser
- j'ai aimé la partie "tests", qui manquait cruellement
- j'ai appris les "styled components", les assertions Jest
- j'ai appris comment parser du bibtex
- écrire des tests ça m'a soulagé, et permis d'aller plus vite sur des parties "ardues"/logiques, critiques pour l'interface (genre les appels à l'API Zotero), notamment pour s'intégrer à l'existant
- j'ai appris que valider une chaine de texte, et synchroniser un formulaire de manière cohérente pour un utilisateur, et bien ça prend du temps vu le nombre de chemins possibles (plusieurs vues de la même donnée, qui se recroisent…)
- je suis content qu'on aie mis la validation bibtex côté navigateur, près de l'utilisateur (mieux que avec pandoc en service côté serveur, lors de l'export)
- j'aime la lib `biblatex-csl-converter`, avec de chouettes erreurs compréhensibles, et le numéro de ligne associé (même si on ne les affiche pas encore dans l'interface)

### Ce qu'on pourrait améliorer la prochaine fois

- des fois c'est pas simple de contribuer quand on touche la même partie de code — de savoir qui fait quoi : la prochaine fois on se met d'accord sur qui écrit, et qui soutient ?
