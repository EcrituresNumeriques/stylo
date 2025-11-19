---
title: "Générer un site Web pour ses articles"
---

Avec le générateur de sites statiques le Crieur, développé spécialement pour Stylo, vous pouvez générer un site Web pour vos articles et corpus sur Stylo. 

Une démonstration pour prendre en charge le Crieur avec Stylo et la ligne de commande se trouve dans [cette vidéo de "scénarios d'utilisation"](/fr/scenarios_utilisation/site_Crieur). 

## Commandes du Crieur

Vous trouverez l'ensemble des commandes possibles avec le Crieur, sur [son repo sur l'instance GitLab d'Huma-Num](https://gitlab.huma-num.fr/ecrinum/crieur/). Les deux principales sont : 

1. `uv run --with crieur crieur stylo <stylo-corpus-id-1> <stylo-corpus-id-2> …` : pour importer des sources de Stylo avec UV et le Crieur ;

2. `uv run --with crieur crieur generate serve --title <'titre du site'>` : pour générer votre site à partir des sources Stylo importées dans votre dossier, et le visualiser sur votre navigateur (notez qu'il vous faut indiquer le titre de votre site à cette étape).

Il vous faudra au préalable télécharger UV, comme gestionnaire de paquets en Python : vous trouverez [les indications pour cela à ce lien](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).

## Personnalisation

Le Crieur a été pensé pour permettre un degré élevé de personnalisation graphique et organisationnelle de votre site, sans nécessiter de ressources économiques et de compétences techniques trop importantes. Cela est particulièrement important pour les revues qui ont leur propre identité, leurs besoins particuliers, et pour lesquelles [l'uniformisation nécessaire pour la diffusion sur les plateformes est souvent source de frustration](https://revue30.org/projets/production-sites-web-par-stylo/).

Pour personnaliser votre site Web, ajoutez un dossier `templates` à la racine de votre dossier hébergeant votre projet, et téléchargez-y [un des templates HTML ici](https://gitlab.huma-num.fr/ecrinum/stylo/crieur-atelier/-/tree/main/templates?ref_type=heads). Puis, créez un dossier `statics`, toujours à la racine, et ajoutez-y [ce fichier simple.css](https://gitlab.huma-num.fr/ecrinum/stylo/crieur-atelier/-/blob/main/statics/simple.css?ref_type=heads). Créez enfin un fichier `custom.css`, dans lequel vous pouvez définir tous les styles que vous souhaitez pour votre site.

Pour générer le site Web avec vos personnalisations, vous devrez ajouter ces éléments à votre commande, sur votre terminal :
- `--statics-path=statics`
- `--templates-path=templates`

Ce qui donne ceci :
`uv run --with crieur crieur generate serve --statics-path=statics --templates-path=templates --title <"le titre de votre site">`

Commande dans laquelle vous pouvez ajouter d'autres éléments et paramètres. 

Vous trouverez un exemple de personnalisation minimaliste [sur ce repo](https://gitlab.huma-num.fr/ecrinum/stylo/crieur-atelier), qui donne [ce rendu graphique](https://crieur-atelier-149600.gitpages.huma-num.fr/).

Le template Crieur le plus à jour et par défaut se trouve [ici](https://gitlab.huma-num.fr/ecrinum/crieur/-/blob/main/crieur/templates/base.html?ref_type=heads). Pour l'utiliser, vous devrez y ajouter des lignes dans le `head` pour bien appeler le fichier `statics/simple.css` et `statics/custom.css`. Des templates plus spécifiques se trouvent [dans le repo du Crieur](https://gitlab.huma-num.fr/ecrinum/crieur/-/tree/main/crieur/templates).


