---
title: Export Page 
---

The [export page](https://stylo-export.ecrituresnumeriques.ca/) lists custom exports from Stylo including : 

- exports for journals that use Stylo in their editorial chains: 
     - [Sens public](http://sens-public.org/)
     - [Scriptura](https://www.facebook.com/RevueScriptura/)
     - [Nouvelles vues](https://nouvellesvues.org/presentation-de-la-revue/)
- exports according to the University of Montreal's templates
- conversion of a document from DOCX to Markdown format

## University of Montreal Template Exports 

The Pen Exports [University of Montreal Templates](https://stylo-export.ecrituresnumeriques.ca/exportudem.html) page was created to allow students at the University of Montreal to produce their renderings directly with the regulatory formatting. 

Three templates are available: 

- The Department of Littératures en Langue Française (DLLF) template
  - with /or/ without table of contents (coming soon)

- The Lesson template 

- The École de bibliothéconomie et des sciences de l'information (EBSI) model

### DLLF model
template (coming soon)

### Lesson Template

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
2. Register a Version (major or minor) and select it
3. Select in the version url the version key (the last digits after "/version/")
4. Copy the version key 
5. In the Lesson Plan export page, paste the version key in the dedicated location
6. Then enter a name for the export, select the Lesson Plan template and click on "Submit".

### EBSI template 

To export your document according to the EBSI template, you need to : 

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

2. Save a Version (major or minor) and select it
3. Select in the version url the version key (i.e. the last digits after "/version/")
4. Copy the version key 
5. In the EBSI export page, paste the version key in the dedicated location
6. Then enter a name for the export, select the EBSI model and click on "Submit".

**Warning**: do not forget to refresh the export page if you make several exports in a row. 
