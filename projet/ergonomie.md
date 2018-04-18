# Point Ergonomie Stylo (16 avril 2018)

## Blocs de la page

1. Bibliographie :
  - accordéon ou escamotable mais il va être très présent et utilisé
2. Sommaire :
  - accordéon ou escamotable
  - action: naviguer dans l'éditeur
3. Versions :
  - double accordéon : versions majeures et sous-versions
  - Données à afficher/éditer pour chaque version :
    - date/rebours non modifiable, mais tooltip sur rebours pour consulter la date/heure précise
    - num de version (non modifiable)
    - titre de la modification (clicable pour éditer)
    - user qui a fait la modification
    - nbr d'annotations sur le html de cette version (clicable)
    - [preview html] (ouvre le html dans l'environnement stylo + hypothesis)
4. Métadonnées (yamleditor)
  - volet fermé par défaut
5. Titre
6. Editeur
7. Encart version chargée

## Agencement des blocs

on se base sur une interface utile de 1400+ px de large :
  - sur petit écran (1400px de large): ca rentre juste
  - sur écran hd (1920px de large): on a de la place
  - comprend ~400 pour les blocs accordéons (versions, sommaire, biblio) et ~1000 pour l'éditeur de texte
  - Volet Métadonnées s'ouvre et se ferme au-dessus des autres blocs


## Bibliographie

Actions:

- bouton [+]/[-] ajouter/supprimer une référence : champs texte / uploader un fichier .bib
- voir la source bibtex: on visualise tout le fichier
- affichage juste de la clé bibtex + boutons d'action + tooltip pour voir la référence
- bouton [intégrer] ou plutôt bouton [copier vers presse-papier]
- v2: autocomplétion à partir de @cardon...

## Editeur

- source md stylée (pas de preview html)
- soft wrap
- vue pagination
- statut bar avec : nbr de mots/caractères, nbr de page,
- import docx/odt/html, via commande pandoc, typiquement celle utilisée actuellement
  - `> pandoc
    -f docx
    -t markdown
    --extract-media=./
    --atx-headers
    SPxxxx.docx
    -o SPxxxx.docx.md`
- v2: gestion du copier-coller word/html

## Versions

Principe :

  - quand on commence à taper, l'interface doit être explicite sur le fait qu'on est en train d'écrire la version suivante.
  - 1 seul bouton save à côté du nouveau num de version
  - si on veut créer une nouvelle version majeure : on le fait à partir de la nouvelle sous-version créée : à ce moment-là on peut ajouter un message plus long que le titre.

Données à afficher/éditer pour chaque version :

  - date/rebours non modifiable, mais tooltip sur rebours pour consulter la date/heure précise
  - num de version (non modifiable)
  - titre de la modification (clicable pour éditer)
  - user qui a fait la modification
  - nbr d'annotations sur le html de cette version (clicable)
  - [preview html] (ouvre le html dans l'environnement stylo + hypothesis)

# Actions générales sur l'article en cours

on retrouve ces actions/bouton dans le bloc "Encart version chargée"

- bouton [preview] rendu html + [copier url vers presse-papier]
  - le bouton est accompagné du nbr d'annotation si disponible
  - ouvre un nouvel onglet qui charge le html avec css basic mais on simule l'environnement stylo  d'article scientifique
  - ouvre hypothes.is par défaut
- bouton [télécharger] l'article
  - zip avec html, médias, md, bibtex, yaml, éventuellement xml erudit (v2)
- bouton fork
