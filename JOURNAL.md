# Journal de développement

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
