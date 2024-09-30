---
title: Export Page 
---

## Export en article

To export an article, click on the "Export" button from the "Articles" page or from the article edit page:

![Export](/uploads/images/Download.png)

The export menu allows you to choose the export format. It also contains the option of including or not including a table of contents.

![Export](/uploads/images/ExportConfig-V2.PNG)

The following formats are supported:

- Fichiers originaux (Markdown, YAML et BibTeX)
- HTML5
- LaTeX
- PDF
- ODT (LibreOffice)
- DOCX (Microsoft Word)
- ICML (InDesign)
- XML-TEI
- XML-Erudit
- XML-TEI Commons Publishing (Métopes et OpenEdition)

It is possible to choose from several bibliographic styles: some embed the reference in the text (e.g. Chicago, which inserts the reference in the body of the text in parentheses), others add a note with the reference.

The export module takes care of formatting references, adding or removing spaces, inserting "Ibids." according to the style, etc.

Exports are produced using the conversion tool [Pandoc](https://pandoc.org/) based on the templates available [here](./export/templates).

The export also allows you to download the source files of Stylo (.md,.bib,.yaml) and the media inserted in the article if there are any.

{% figure "/uploads/gif/exporter-un-article.gif", "Export an article" %}

## Customize your export

From the source files, it is possible to produce custom exports (layout, graphics, metadata) based on the functionalities of the conversion tool [Pandoc](https://pandoc.org/).

For more information on how to use templates, see this [tutorial](https://gitlab.huma-num.fr/ecrinum/manuels/tutoriel-markdown-pandoc).

## Export page

The current version of the Stylo export module ([https://export.stylo.huma-num.fr/](https://export.stylo.huma-num.fr/)) supports generic export and integrated export into the editorial cheange of Métopes (XML-TEI Commons Publisihing schema for Métopes or OpenEdition). 

Stylo's *old* export module (https://stylo-export.ecrituresnumeriques.ca) lists the other custom exports from Stylo, including:

- exports for journals that use Stylo in their editorial chains: 
  - [Sens public](http://sens-public.org/)
  - [Scriptura](https://www.facebook.com/RevueScriptura/)
  - [Nouvelles vues](https://nouvellesvues.org/presentation-de-la-revue/)
- exports according to the University of Montreal's templates
- conversion of a document from DOCX to Markdown format

## Special exports

### University of Montreal Template Exports 

The Stylo exports page for [University of Montreal Templates](https://stylo-export.ecrituresnumeriques.ca/exportudem.html) was created to allow students at the University of Montreal to produce their renderings directly with the regulatory formatting. 

Three templates are available: 

- The Département des littératures de langue fraçaise (DLLF) template
  - with /or/ without table of contents (coming soon)

- The Lesson template 

<iframe src="http://stylo-doc.ecrituresnumeriques.ca/uploads/pdf/testPlanCours.pdf" title="testPlanCours" width="100%" height="500" allowfullscreen></iframe>

- The École de bibliothéconomie et des sciences de l'information (EBSI) model

<iframe src="http://stylo-doc.ecrituresnumeriques.ca/uploads/pdf/test.pdf" title="testEBSI" width="100%" height="500" allowfullscreen></iframe>

#### DLLF model
template (coming soon)

#### Lesson Template

1. Edit the following metadata in the metadata pane in "RAW" mode

```
---
abstract:
  - lang: en
    text_f: This is my abstract.
  - lang: fr
    text_f: C'est mon joli résumé.
authors:
  - forname: Margot
    surname: Mellet
cours:
  - id: Sigle
    title: Titre du cours
date: '2021-09-08'
day: '05'
lang: fr
link-citations: true
month: avril
nocite: '@*'
session: Été
subtitle_f: Sous-titre
teachers:
  - email: margot.mellet@umontreal.ca
    forname: Margot
    surname: Mellet
title_f: Titre
typeTravail: TP2
year: '2021'
---
```
2. Register a version (major or minor) and select it
3. Select in the version url the version key (the last digits after "/version/")
4. Copy the version key 
5. In the Lesson Plan export page, paste the version key in the dedicated location
6. Then enter a name for the export, select the Lesson Plan template and click on "Submit"

#### EBSI template 

To export your document according to the EBSI template, you need to: 

1. Edit the following metadata in the metadata pane in "RAW" mode

```
---
authors:
  - forname: "Author1-Firstname"
    nickname: "Author1-Lastname"
    matricule: "Author1-matricule
  - forname: "Author2-Firstname"
    nickname: "Author2-Lastname
    personnel number: "Author2-matricule
date: 2021/03/05
year: '2021'
month: 'April'
session: 'Summer'
day: '05'
course:
  - id: acronym
    title: Course title
teachers: 
  - forname: First name
    surname: Name
lang: fr
link-citations: true
nocite: '@*'
subtitle: Subtitle
subtitle_f: Subtitle
title: Title
title_f: Title
typeWork: TP2
---
```

2. Save a version (major or minor) and select it
3. Select in the version url the version key (i.e. the last digits after "/version/")
4. Copy the version key 
5. In the EBSI export page, paste the version key in the dedicated location
6. Then enter a name for the export, select the EBSI model and click on "Submit"

**Warning**: do not forget to refresh the export page if you make several exports in a row. 
