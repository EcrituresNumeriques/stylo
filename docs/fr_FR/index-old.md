# Stylo: l'éditeur de texte sémantique pour les sciences humaines et sociales

Stylo est un éditeur de textes pour articles scientifiques en sciences humaines et sociales.

Stylo intègre en un seul environnement de travail une chaîne éditoriale qui comprend:

  - un éditeur de métadonnées, dont certaines données sont alignées à des référentiels (auteurs, mot-clés)
  - un versionnage du texte
  - une gestion de la bibliographie
  - des exports possibles vers différents formats\ : html5, xml (TEI, Erudit), pdf...
  - l'annotation des articles
  - le partage de document

[Tester Stylo](http://stylo.ecrituresnumeriques.ca)
[Premiers pas](pages/premierspas.md)



## Création d'un article

- Connectez vous ou créez un profil
- Cliquez sur le bouton "Create new article"
- Nommez l'article (vous pourrez changer le nom ensuite)

Vous êtes sr la page principale de Stylo, où vous avez accès à l'ensemble de vos articles.


## Éditer un article
Cliquez sur "Edit". Vous ouvrirez ainsi l'environnement d'édition.
Vous disposez de 5 menus et d'un espace d'écriture à proprement parler:
1. Le menu "Versions" affiche la version actuelle et vous permets:
  - de sauvegarder votre travail en créant une nouvelle version mineure (par exemple, la version 0.1, 0.2 etc.) ou une nouvelle version majeure (par exemple 1.0 ou 2.0). Selon la nature de vos modifications vous pouvez décider s'il s'agit d'une version mineure ou majeure.
  - d'exporter votre article en un fichier html à télécharger ("Export")
  - de prévisualiser votre article mis en page ("Preview")
  - de visualiser votre article avec des outils d'annotation ("Annotate")
  - d'exporter votre article en xml eruditArticle ("XML")
  - de visualiser l'historique des version (en bas du menu) et d'afficher une ancienne version du texte (en cliquant sur le numéro de version souhaité)
  - de tagguer une version de l'article (en cliquant sur la version et ensuite sur "Tag" en haut du menu)
2. Le menu "Sommaire" affiche automatiquement le sommaire de l'article sur la base des niveaux de titres dans votre texte (un # est un titre de niveau 1, ## de niveau 2 etc.)
3. Le menu "Biblio" permet:
  - d'ajouter une ou plusieurs références bibliographiques (en cliquant sr "Add reference" et en collant dans le box qui s'ouvre des références bibtex)
  - de visualiser les références existantes
  - d'insérer des références dans le texte (en cliquant sur la référence et en la collant dans le texte avec un paste ou un Ctrl-V)
  - de visualiser et éditer les références insérées (en cliquant sur "See source")
4. Le menu "Stats" vous donne les statistiques de l'article: nombre de mots, de caractères et de références dans le texte
5. Le menu "Métadonnées" vous permet d'ouvrir l'éditeur de métadonnées

Vous pouvez éditer le texte dans le champ au milieu de la page en utilisant la syntaxe [markdown](https://guides.github.com/features/mastering-markdown/).

## Versions, partage et fork
Une version est l'état du texte à un moment particulier. Toutes les versions restent accessibles dans l'historique du texte et sont numérottées avec deux chifres divisés par un point. Le premier chifre se réfère à des versions majeures, le second à des versions mineures. La décision de sauvegarder une version en tant que version mineure ou majeure dépend de la volonté de l'auteur.
Au moment de sa création, un article est dans sa version 0.0.
Stylo sauvegarde automatiquement les changements en cours sur la version dans laquelle il se trouve.
L'auteur peut faire des changements mineurs - admettons qu'il ajoute seulement un titre de section - et sauvegarder la version en tant que version mineure: 0.1.
Ensuite, il pourra écrire quelques pages et décider de sauvegarder en tant que version 1.0. Chaque version peut être exportée et prévisualisée. Le lien de prévisualisation d'une version est un lien perenne: si vous l'envoyez à quelqu'un, il verra toujours le même document - et non la dernière version du texte.   

## Gestion de la bibliographie
Les références bibliographiques peuvent être ajoutées une à la fois, ou grouppées. Les références doivent être ajoutées dans lee format bibtex.
- Vous pouvez exporter vos citations en bibtex depuis zotero ([cf. tutoriel ici](http://sens-public.org/IMG/pdf/Utiliser_Zotero.pdf).
Vous pouvez directement structurer vos références en bibtex ([cf. cette documentation](http://www.andy-roberts.net/writing/latex/bibliographies).

## Gestion des métadonnées

Cliquez sur le boutton "Metadata". Vous avez deux modes d'édition:
1. Mode auteur. Ce mode permet d'éditer les métadonnées fondamentales: Titre, sous-titre, résmés, auteurs et mots-clés
2. Le mode éditeur. Ce mode permet d'éditer l'ensemble des métadonnées: par exemple renseigner un identifiant de l'article, donner des informations sur le dossier dans lequel il est publié etc.


## Exporter le texte

## Annotation

## TODO
### Déjà réalisé, juste à implémenter
- Exportation xml erudit
- exportation pdf

### À réaliser
- Gestion de suivi de modification via un diffmerge
- Implémentation versionnage git
- possibilité de customisation des métadonnées
- exportation vers d'autres formats (TEI)
- importation bibliographie via zotero
