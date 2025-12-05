---
title: "Générer un site Web pour ses articles"
---

Avec le générateur de sites statiques [le Crieur](https://ecrinum.gitpages.huma-num.fr/crieur/), développé spécialement pour Stylo, vous pouvez générer un site Web pour vos articles et corpus sur Stylo. Il permet de publier des revues en ligne ou de créer un blog avec l’avantage d'utiliser Stylo comme "CMS" sémantique et collaboratif et de rester au formatage léger et ouvert en Markdown et YAML.

Une démonstration pour prendre en charge le Crieur avec Stylo et la ligne de commande se trouve dans [cette vidéo](/fr/videos/site_Crieur), et un guide écrit "pas à pas" sur [cette page de la documentation du Crieur](https://ecrinum.gitpages.huma-num.fr/crieur/numero/utilisation/article/le-crieur-pas-a-pas/).

## Commandes du Crieur

Vous trouverez l'ensemble des commandes possibles avec le Crieur, sur [son repo sur l'instance GitLab d'Huma-Num](https://gitlab.huma-num.fr/ecrinum/crieur/). Les deux principales sont : 

1. `uv run --with crieur crieur stylo <stylo-corpus-id-1> <stylo-corpus-id-2> …` : pour importer des sources de Stylo avec UV et le Crieur ;

2. `uv run --with crieur crieur generate serve --title <'titre du site'>` : pour générer votre site à partir des sources Stylo importées dans votre dossier, et le visualiser sur votre navigateur (notez qu'il vous faut indiquer le titre de votre site à cette étape).

Il vous faudra au préalable télécharger UV, comme gestionnaire de paquets en Python : vous trouverez [les indications pour cela à ce lien](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).

## Personnalisation

Le Crieur a été pensé pour permettre un degré élevé de personnalisation graphique et organisationnelle de votre site, sans nécessiter de ressources économiques et de compétences techniques trop importantes. Cela est particulièrement important pour les revues qui ont leur propre identité, leurs besoins particuliers, et pour lesquelles [l'uniformisation nécessaire pour la diffusion sur les plateformes est souvent source de frustration](https://revue30.org/projets/production-sites-web-par-stylo/).

Vous trouverez des indications pour personnaliser votre site sur [cette page de la documentation du Crieur](https://ecrinum.gitpages.huma-num.fr/crieur/numero/utilisation/article/configuration-avancee/).

## Mise en ligne

La mise en ligne de votre projet généré avec le Crieur peut se faire avec une instance git telle que le Gitlab d'Huma-Num. Vous pouvez y déposer votre projet et vous inspirer du [fichier .gitlab-ci.yml](https://gitlab.huma-num.fr/ecrinum/crieur/-/blob/main/.gitlab-ci.yml) du dépôt du Crieur. Il vous faudra bien sûr adapter les identifiants de corpus et le titre du site. 

Vous trouverez une documentation et des configurations plus avancées concernant le déploiement de votre projet en ligne et ses configurations dans [cette rubrique de la documentation du Crieur](https://ecrinum.gitpages.huma-num.fr/crieur/numero/deploiement/).
