---
title: "Exports d'articles"
---

Pour exporter un article, commencez par cliquer sur le bouton export. Cette fonctionnalité est accessible depuis votre espace personnel, vos espaces de travail et la page d'édition d'un article. 

![Bouton export](/uploads/images/refonte_doc/Export.png)

Une boîte de dialogue s'ouvrira, vous offrant plusieurs choix :

- Le format d'export :
    - Fichiers originaux (markdown, yaml et bibtex) ;
    - Fichiers Markdown seuls ;
    - HTML5 ;
    - LaTeX ;
    - PDF ;
    - ODT (LibreOffice) ;
    - DOCX (Microsoft Word) ;
    - ICML (Impress) ;
    - XML-TEI ;
    - XML-Erudit ;
    - XML-TEI Commons Publishing (Métopes).
- Ajouter une table des matières ;
- Inclure toutes les références ou seulement celles utilisées ;
- Lier les citations ou non.

![Boîte d'export](/uploads/images/refonte_doc/Exporter.png)

Il est aussi possible de choisir parmi plusieurs styles bibliographiques : certains intègrent la référence dans le texte (par exemple Chicago), d’autres ajoutent une note de bas de page avec la référence. Le module d’export se charge de mettre en forme les références, d’ajouter ou d’enlever les espaces, d’insérer des « Ibid », etc. en accord avec le style bibliographique sélectionné.

{% figure "/uploads/gif/exporter-un-article.gif", "Exporter un article" %}

Les exports sont produits grâce à l’outil de conversion [Pandoc](https://pandoc.org/) sur la base des templates disponibles [ici](https://framagit.org/stylo-editeur/templates-stylo).

L'export permet aussi de télécharger les fichiers source de Stylo (.md, .bib, .yaml) et les médias insérés dans l'article s'il y en a.

En sélectionnant l'export avec les fichiers originaux, il est possible de produire des exports personnalisés (mise en page, graphismes, métadonnées, etc.) en s’appuyant sur les fonctionnalités de Pandoc.

Pour plus d’informations sur l’emploi des templates, voir ce [tutoriel](https://gitlab.huma-num.fr/ecrinum/manuels/tutoriel-markdown-pandoc).

*Le module d'export est aussi accessible sur [cette page dédiée aux exports](https://export.stylo.huma-num.fr/), pour des exports adaptés aux styles et besoins des revues. Pour l'utiliser, il vous faudra l'identifiant de votre article ou de votre corpus, que vous pourrez par exemple trouver sur le lien URL "partager et annoter" d'un article, ou "exporter" d'un corpus.*

