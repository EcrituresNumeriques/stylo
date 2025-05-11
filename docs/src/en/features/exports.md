---
title: Article exports
---

To export an article, simply click on the export button. This function is accessible from your personal space, your workspaces, your corpora and the article editing page. 

![Export button](/uploads/images/refonte_doc/Export.png)

A dialog box will open, offering you several choices:

- Export format:
    - Original files (markdown, yaml and bibtex) ;
    - Markdown files only ;
    - HTML5 ;
    - LaTeX ;
    - PDF ;
    - ODT (LibreOffice) ;
    - DOCX (Microsoft Word) ;
    - ICML (Impress) ;
    - XML-TEI ;
    - XML-Erudit ;
    - XML-TEI Commons Publishing (Métopes).
- Add a table of contents;
- Include all references or only those used;
- Link citations or not.

![Export box](/uploads/images/refonte_doc/ANG/Exporter_ANG.png)

You can also choose from several bibliographic styles: some integrate the reference into the text (e.g. Chicago), others add a footnote with the reference. The export module takes care of formatting the references, adding or removing spaces, inserting “Ibid”, etc. in accordance with the selected bibliographic style.

{% figure "/uploads/gif/exporter-un-article.gif", "Export an article" %}

Exports are produced using the conversion tool [Pandoc](https://pandoc.org/) on the basis of the templates available [here](https://framagit.org/stylo-editeur/templates-stylo).

Export also lets you download Stylo source files (.md, .bib, .yaml) and any media inserted in the article. By selecting export with original files, it is possible to produce customized exports (layout, graphics, metadata, etc.) using the features of the Pandoc.

For more information on the use of templates, see this [tutorial](https://gitlab.huma-num.fr/ecrinum/manuels/tutoriel-markdown-pandoc).

*The export module is also available on [this page dedicated to exports](https://export.stylo.huma-num.fr/), for exports adapted to the styles and needs of your journals. To use it, you'll need the identifier of your article or corpus, which you can find, for example, on the URL link "share and annotate" for an article, or "export" for a corpus.*
