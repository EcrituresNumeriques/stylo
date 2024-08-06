---
title: Getting started with Stylo
---

## Creating an account
In order to edit in Stylo, creating a user account via Huma-Num is recommended. To create an account, go to Stylo: <https://stylo.huma-num.fr> and choose the type of account:

![Register](/uploads/images/Login-Huma-Num-V2.PNG)

If you already have a Stylo or Huma-Num account, log in [here](https://stylo.huma-num.fr).

## User page
The home page of your Stylo account lists your personal articles as well as those that have been shared with you by other Stylo users.

By default, a first article, called "How to Stylo", appears on the platform, and it details each involved with writing an article. Do not hesitate to refer to it if you wish to write your article directly in Stylo, or if you have questions about articles that require special treatment (illustrations, etc.).

For each article, many actions are possible:

![](/uploads/images/fonctions-article.png)

|                     Button                     |Function|
|:----------------------------------------------:|:--|
|    ![Delete](/uploads/images/Delete-V2.png)    | to delete the article |
| ![Duplicate](/uploads/images/Duplicate-V2.png) | to duplicate only the last version of the article|
| ![Send](/uploads/images/send.png) | to send a copy of the article and its version history with another Stylo user, who will be titled : "[Copy]New article"|
|     ![Share](/uploads/images/Share-V2.png)     | to share the article and its version history with another Stylo user |
|      ![Export](/uploads/images/Export.png)      | to export the last version of an article |
|      ![Collaborative editing](/uploads/images/collaborative-editing.png)      | to launch en collaborative session |
|      ![Edit](/uploads/images/Edit-V2.png)      | to open an article and edit|
|      ![Preview](/uploads/images/Preview-V2.png)      | to preview the article in a new window (HTML)|

![Extend functionnalities relating to the article](/uploads/images/article-extend-functionnalities.png)

|                     Button                     |Function|
|:----------------------------------------------:|:--|
|    ![Rename](/uploads/images/Rename-V2.png)    | to rename the article |
|      ![Plus](/uploads/images/Plus-V2.png)      | to expand other functions relating to the article:|
|  ![Versions](/uploads/images/Version-V2.PNG)   | to consult the history of saved versions |
|      ![Tags](/uploads/images/Tag-V2.png)       | to choose the tags of the article |
| ![Ajouter aux espaces de travail](/uploads/images/ajout-dans-espace-de-travail.png) | to add an article to a workspace |
| ![Ajouter aux corpus](/uploads/images/add-to-corpus.png) | to add an article to a corpus |

Note: The document name, as it visible in Stylo, does not correspond to the title of the article that will be generated. The title must be filled in the metadata (right pane on the article) to appear on the preview or the exports.

**Careful :** Deleting an article is irreversible. If the article is shared with another user, it will remain available for this user even after it is deleted.

## Understand the article structure

An article in Stylo is made up of the following three separate elements:

  - the text body;
  - metadata;
  - a bibliography.

Stylo offers an integrated interface to edit each of these elements, whose sources are accessible at any time via [the export module](#export).

## Editing interface
The article editing interface offers many modules:

  - A **body text**: a space for editing the body text of the article;
  - A **metadata manager**: a space for editing information about the article (summary, author, keywords, publication date, etc.);
  - A **versions manager**: a space for saving and renaming minor (*Create Minor*) and major (*Create Major*) versions, that accesses successive versions to consult, export and compare them with other versions;
  - A **table of contents**: automatically presenting a summary of the article, based on the titles within body text;
  - A **bibliography manager**: a space for editing references (quoted or not in the body text);
  - A **statistics** tool: presenting statistical information about the article (words and characters count, etc.).

![Schéma de l'interface d'édition de Stylo](/uploads/images/SchémaInterface.PNG)


## Share option

The **[Share]** function allows you to invite co-authors to work on the same article. These users then have access to the entire history. The article versions will synchronize for all the users as modifications are made to the document.

**Careful** : Sharing an article with another user is possible only by entering the email address that the other user entered to create their Stylo account.

## New article

To create a new article, simply click on the button:

![New article](/uploads/images/CreateNewArticle-V2.PNG)

You must then enter the name of the document in the field provided for this purpose

![name an article](/uploads/images/Title.png)

and validate the operation by once again clicking on the button

![Nouvel article](/uploads/images/CreateThisArticle-V2.PNG)

During this operation, you can also choose the tags related to the article:

![Add Tags](/uploads/images/AddTag.png)

The article will then appear in your list of articles. 

Click on the button

![Edit](/uploads/images/Edit.png)

to access the editing environment and begin to work on your article.

## Editing

The editing environment is made up of 5 modules:

- In the center: the writing space dedicated to the body text of the article;
- To the right: the **[Metadata]** button opens the metadata editor;
- To the left:
  - The history of document versions (*Versions*) to navigate and interact with different saved versions;
  - The *Table of contents* lists the titles at 2^nd^, 3^rd^, 4^th^, etc. levels;
  - The *Bibliography* lists the bibliographic references;
  - The *Stats* offer some quantitative data on the article.

## Writing in Markdown

The Stylo article must be written in Markdown, an easy-to-learn markup language.

Markdown language allows a syntax structure that is easy to both read and write. Here are the main writing rules for Markdown:

- Title: the levels of the title (level 1 for the title of the article, level 2 for the titles of the section, etc.) are organised using ```#```, like this: 
	- ```# Title of the article```, ```## Introduction```, etc.

Careful: The article's body text does not support titles for level 1; titles for level 1 are only used for the *Title* fields in the metadata.

- **Italics**: italics can be created in two ways: ```_word_``` or ```*word*``` 
- **Bold**: bold can be created like this: ```**word**```
- **Long citation**: long citations are created like this: ```> long citation```
- **Footnote**: a footnote can be created with or without a number:
	- with a number :

```
Here is my text[^1]

[^1]:A footnote with a number and reference
```

- Without a number :

```
Here is my text^[inline footnote.]
```

To improve your knowledge in Markdown syntax, you can see this [page](http://stylo-doc.ecrituresnumeriques.ca/en/markdownsyntax/).

## Versions

![Active](/uploads/images/Nom-Version-V2.PNG)

A document version corresponds to a backup of your work. A version always contains the following article elements: metadata, bibliography, body text. Therefore, in loading an old version, each of these three elements are updated.

Your work is automatically saved on Stylo by default, but you must create the versions yourself. To do this, you can - and it is recommended - use the save function [New Version] which allows you to generate a new version of the work:

For more information on versions in Stylo, please visit the [dedicated page](/en/versioning/).

## Export

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

Exports are produced using the conversion tool [Pandoc](https://pandoc.org/) based on the templates available [here](https://framagit.org/stylo-editor/templates-stylo).

For more information on Stylo exporting, you can see this [page](/en/exports/)

## Table of Contents

![Sommaire](/uploads/images/Sommaire-V2.PNG)

The table of contents appears in a list of titles at levels 2, 3, and so on. These titles are clickable, for quick access to that part of the corresponding text.

## Bibliography

The bibliography lists the bibliographic references that you have added. The bibliographic references can be added either one by one, or grouped. To add your reference, you have to click on **[Manage Bibliography]** in the left pane: the *Bibliography* tool then opens and offers you a number of possibilities:

1. **Zotero** : you can synchronize a bibliography by connecting Stylo to your Zotero account (private or public groups/collections). You can also indicate the URL of a collection in a public Zotero group;
2. **Citations** : you can manually fill in your bibliography using BibTex format;
3. **Raw bibtex** : to edit the BibTeX directly.

You can directly [structure your references in BibTex](/en/bibtexsyntax/), or export your references in BibTex with your bibliography management tool:

- See tutorials : <a class="btn btn-info" href="https://research.library.gsu.edu/c.php?g=115275" role="button">Zotero</a> <a class="btn btn-info" href="https://libguides.usask.ca/c.php?g=218034&p=1446316" role="button">Mendeley</a>

To add a reference to the article, you just need to click on the reference, then paste (Ctrl+V) the reference in the desired place of the text. This way, a click is the same as "copying" the reference key to the clipboard. Then, you just need to paste it into the body text.

An autocomplete system also allows you to display the available references by typing \[@ or @ followed or not by the first letters of the reference identifier.

![biblioex](/uploads/images/Bibliographie-Exemple-V2.PNG)

For more information on managing the bibliography, you can see this [page](/en/managingref/).

## Metadata

![Metadata-Button](/uploads/images/Metadata-Bouton-V2.PNG)

![Metadata-Edition](/uploads/images/Metadata-Edition-V2.PNG)

The [Metadata] button opens the metadata pane. Three editing modes are available:

1. **Basic Mode** : allows editing the basic metadata: title, subtitle, summaries, authors and keywords;
2. **Editor Mode** : allows editing all metadata related to a scholarly journal: article identifier, folder information, review information, journal categories, journal keywords, etc.;
2. **Raw Mode** : an editing space for an advanced user, where you can modify fields directly in the YAML format structure.

**Important :** In order to export an article, these fields must be filled in:

- A title;
- An author name.

For more information on metadata editing, you can see this [page]().

**Careful**: In the metadata pane is the "Bibliography" division, including the *Display* option, which allows you to choose to view the bibliography either in its entirety ("All citations"), or just the references which have been cited in the body of the article ("Only used"). 

![All citation](/uploads/images/allCitation.png)

## Statistics

![Statistics](/uploads/images/statistiques.png)

The *Stats* menu provides information on:

- The number of words;
- The number of characters, without spaces;
- The number of characters, with spaces;
- The number of citations.

## Annotation

There are two annotation possibilities:

1. Annotate a version;
2. Annotate the article.

To annotate a version, click on the version number you want to annotate and then click **[preview]**. A preview of the article in HTML will open with the annotation tool *Hypothes.is* on the right.

![Hypothes.is](/uploads/images/Hypothesis.png)

**Important**: If you annotate a version, your annotation will not be visible on the other version.

To annotate the article, click **[Edit]** and then **[Preview]**. The annotations will relate to the article. However, given that the editable version is subject to changes, annotations can no longer be anchored in the correct parts of the text (which could have been deleted or moved).
