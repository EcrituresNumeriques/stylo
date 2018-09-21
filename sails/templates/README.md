# templates-stylo

Templates et feuilles de style pour l'éditeur sémantique [Stylo](https://stylo.ecrituresnumeriques.ca).

La chaîne éditoriale de Stylo se base sur un fichier pivot en markdown et une série de conversions faites avec [pandoc](http://pandoc.org) et des feuilles de style.

## Description des templates :

- `templateHtmlDcV2.html5` : conversion pandoc md>html
- `templateHtmlDcV2-preview.html5` : conversion pandoc md>html intégrant une feuille de style (css)
- `templateLaTeX.latex` : conversion pandoc md>tex
- `XHTML2eruditV2.xsl` : conversion xslt html>xmlErudit
- `Erudit2HTML.xsl` : conversion xmlErudit>html5 (traitement des archives SP)
- `teiV0.template` : conversion pandoc md>xmlTEI
- `chicagomodified.csl` : feuille de style CSL modifiée pour formatter la bibliographie.
