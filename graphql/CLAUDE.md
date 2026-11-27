# Stylo — backend GraphQL

L'organisation des fichiers, les principes à suivre et la liste de vérification avant une pull request sont décrits dans `CONTRIBUTING.md`, qui fait foi et qui est chargé ci-dessous.
Ne dupliquez pas son contenu ici. Une règle nouvelle ou modifiée s'écrit dans `CONTRIBUTING.md`.

@CONTRIBUTING.md

## Autres documents à lire selon la tâche

- [`CONVENTIONS.md`](CONVENTIONS.md) avant toute modification de `schema.js`, y compris la section « Après une modification du schéma ».
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) pour les messages de commit et les titres de pull request.
- [`../SERVER.md`](../SERVER.md) pour les migrations sur les serveurs et l'exécution à blanc (`--dry-run`).

## Commandes depuis le dossier `graphql`

`CONTRIBUTING.md` donne les commandes à lancer depuis la racine du dépôt (`npm test -w graphql`…).
Depuis ce dossier, les équivalents sont les suivants :

```bash
npm start                             # applique les migrations puis lance le serveur (port 3030)
npm test                              # tests et couverture (c8), puis lint (Biome)
node --test '**/*.test.js'            # tests seuls
node --test resolvers/tagResolver.test.js  # un seul fichier
npm run lint:fix                      # corrige le formatage avec Biome
npm run migrations                    # migrations seules
```

Les tests démarrent un conteneur MongoDB, donc Docker doit être démarré.
