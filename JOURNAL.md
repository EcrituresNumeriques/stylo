# Journal de développement

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
