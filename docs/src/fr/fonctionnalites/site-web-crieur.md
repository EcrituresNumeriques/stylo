---
title: "Générer un site Web pour ses articles"
---

Avec le générateur de site statique le Crieur, développé spécialement pour les articles Stylo, vous pouvez générer un site Web pour vos articles. 

Les informations principales sur le Crieur et pour le prendre en charge sont dans [cette vidéo dans "Scénarios d'utilisation"](/fr/scenarios_utilisation/site_Crieur). 

## Commandes du Crieur

Vous trouverez l'ensemble des commandes possibles, sur [le repo du Crieur](https://gitlab.huma-num.fr/ecrinum/crieur/). Les deux principales sont : 

1. `uv run --with crieur crieur stylo <stylo-corpus-id-1> <stylo-corpus-id-2> …`

Pour importer des sources de Stylo avec UV et le Crieur ;

2. `uv run --with crieur crieur generate serve --title <'titre du site'>`

Pour générer votre site à partir des sources Stylo importées dans votre dossier, et le visualiser sur votre navigateur (notez qu'il vous faut indiquer le titre de votre site à cette étape).

Il vous faudra au préalable télécharger UV, comme gestionnaire de paquets en Python : vous trouverez [les indications pour cela à ce lien](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).

## Personnalisation

Pour personaliser votre site, vous pouvez éditer les styles public/statics/custom.css. 

Il est également possible possible d’éditer les templates dans public/templates/base.html. Pour la modification plus avancée des templates, il faut aller voir [les templates du Crieur](https://gitlab.huma-num.fr/ecrinum/crieur/-/tree/main/crieur/templates) et en copier-coller le contenu, tout en conservant le nom original, puis relancer le site avec la commande `uv run --with crieur crieur build`.


