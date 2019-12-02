## Exporter un article

Pour exporter un article, il faut cliquer sur le bouton "Export" depuis la page "My articles" ou depuis la page d'édition de l'article.

Le menu d'export permet de choisir le format d'export, le style bibliographique et si l'on veut ou pas intégrer une table des matières.

Les formats supportés sont :

- HTML5
- PDF
- ODT
- tex
- DOCX
- EPUB
- TEI
- ICML
- XML Erudit
- ZIP (avec les fichiers source: markdown, yaml et bibtex)

Il est possible de choisir parmi plusieurs styles bibliographiques dont certains intègrent la référence dans le texte (par exemple Chicago, qui insère la référence dans le corps du texte entre parenthèses) et d'autres ajoutent une note avec la référence.

Le module d'export se charge de mettre en forme les références, d'ajouter ou enlever les espaces, d'insérer des "Ibid." en accord avec le style etc.

Les exports sont produits grâce à l'outil de conversion [pandoc](https://pandoc.org/) sur la base de tempates disponibles [ici](https://framagit.org/stylo-editeur/templates-stylo).

L'export permet aussi de télécharger les fichiers source de Stylo - et les médias insérés dans l'article s'il y en a.

## Personnaliser son export

À partir des fichiers source, il est possible de produire des exports personnalisés - mise en page, graphisme, métadonnées - en utilisant l'outil de conversion [pandoc](https://pandoc.org/).

Pour plus d'informations sur l'emploi des templates, cf. [ce tutoriel](https://framagit.org/marviro/tutorielmdpandoc/blob/master/parcours/04_edition.md#les-templates-dans-pandoc).
