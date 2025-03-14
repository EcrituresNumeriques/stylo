---
title: Manage my articles
---

Your articles are available on the page *Articles*, clickable via the sidebar of your Stylo account:

![BarreLaterale](/uploads/images/BarreLateraleStyloNoire-V2.PNG)

At the top of this page, there are a number of functions:

- Create a new article
- Edit and manage tags
- Search for an article

![BarreLaterale2](/uploads/images/BarreLaterale-V2.PNG)

## Create a new article

Click on the button "Create a new article" (you must enter the title of the article in the appropriate box, then click again on the button "Create").

To create a new article, just click on the button:

![Nouvel article](/uploads/images/CreateNewArticle-V2.PNG).

You must then enter the name of the document in the appropriate field:

![nommer un article](/uploads/images/ArticleTitle-V2.PNG)

and validate by clicking on the button:

![Nouvel article](/uploads/images/CreateThisArticle-V2.PNG).

While doing this, you can also add tags to the article by clicking on the button:

![Add Tags](/uploads/images/SelectTag-V2.PNG)

**Careful**: you can only add tags that are already edited in your Stylo account.

The article will now appear in your list of articles.

## Edit and manage your tags

To create and edit your tags, click on "Manage tags". A pain then appears on the left:

![TagManage](/uploads/images/CreateNewTag-V2.PNG)

You can click on the tag name to select from your list of articles, but only the articles related to the selected tag.

You can view the tag details but clicking on the arrow next to the tag name:

![TagDetail](/uploads/images/DescriptionTag2-V2.PNG)

You then have access to the tag description in reading mode, but also to many other functions:

|Button|Function|
|:-:|:--|
| ![Delete](/uploads/images/DeleteTag-V2.PNG) | To delete the tag|
| ![Edit](/uploads/images/EditTag-V2.PNG) | To open the tag in editing|

The tag editing mode looks like this:

![TagDetail2](/uploads/images/DescriptionTag-V2.PNG)

This space allows you to:

- Change the tag name
- Change the tag description
- Choose a tag colour

Do not forget to save your changes once you have finished editing your tag.

## Search within your articles

A search sidebar appears to allow searching within your articles.

## Article pages in your Stylo account

On your Article page, your articles are listed one below the other according to your most recent changes:

![Articles](/uploads/images/PageArticles.PNG)

Each article appears as a block in your list. This space is designed for just one article, and only allows you to perform a number of immediate operations:

|Button|Function|
|:-:|:--|
| ![Rename](/uploads/images/Rename-V2.png) | To rename the article|
| ![See](/uploads/images/Preview-V2.png) |  To preview the article|
| ![Share](/uploads/images/Share-V2.png) | To share the article and its version history with another Stylo user|
| ![Duplicate](/uploads/images/Duplicate-V2.png) | To duplicate only the last version of the article which will be called: "[Copy]Article title"|
| ![Export](/uploads/images/Download.png) | To print only the last version of the article|
| ![Edit](uploads/images/Edit.png) | To open the article in editing mode|
| ![Delete](/uploads/images/Edit-V2.png) | To delete the article|

You can also expand the article block by clicking on the rafter, positioned to the left of your article title. You will then have access to:

|Button|Function|
|:-:|:--|
| ![Versions](/uploads/images/Version-V2.PNG) | To consult the history of saved versions|
| ![Tag](/uploads/images/SelectTag-V2.PNG) | To select the tags of the article|


## Rename an article

You can rename your article by clicking on the "Rename" button, positioned beside you're your article\'s current title and shown with a pencil icon:

![AncienTitre](/uploads/images/AncienTitre-V2.PNG)

After having changed the article title to your liking, do not forget to save:

![Renommer](/uploads/images/NouveauTitre-V2.PNG)

## Preview an article

You can preview your article by clicking on the following icon:

![See](/uploads/images/Preview-V2.png)

Previewing allows you to read the content of the article and the [annotation](http://stylo-doc.ecrituresnumeriques.ca/fr_FR/#!pages/preview.md).

## Share an article

You can also share your article with other Stylo users by clicking on the following icon:

![Share](/uploads/images/Share-V2.png)

To share, you must enter the email address of the Stylo user: it must be the address that the user entered to create the Stylo account. Once the address is entered, you must add to the list of users by clicking the button "Add".

![Share](/uploads/images/ShareContact-V2.PNG)
![Share](/uploads/images/SendCopy_GrantAccess-V2.PNG)

The [Grant Access] function allows many Stylo users to work on the same article. These users therefore have access to the entire history. The article versions will synchronise for all the users as changes are made to the document.

This function also allows you to send the article with the same system:

The [Send a Copy] option is not sharing the article; only the last version of the article will be visible for the user and the changes will not be visible to other users. In the [Send a Copy] process, two versions of the article are created and the users each work on a version that is not visible to the other.

## Take over

When an article is shared (via a workspace or the share button) with another user, the article editing function is only available to one person at a time. You'll see by the red dot in the box that a collaborator is editing the article or has not properly closed his editing session. If you also want to edit the article, you can take over the editing session by pressing ![Edit](/uploads/images/edit-red.png) and confirm. The other collaborator will then be in read-only mode and you will be able to edit the article.

To properly close an editing session, simply return to the *Articles* page when you've finished your work.

{% figure "/uploads/gif/reprise-de-session.gif", "Take over" %}

## Duplicate an article

You can duplicate your article by clicking on the following icon:

![Duplicate](/uploads/images/Duplicate-V2.png)

A duplicate of the article will then be generated and will appear at the top of the list of your Stylo articles. This article will be automatically titled as follows: "[Copy] Article title". This duplicate is created from the current article version (the one that you are in the process of editing) and does not contain the version history.

## Export an article

To export an article, you must click on the "Export" button, then the page "My articles", or from the article editing page:

![Export](/uploads/images/Download.png)

The export menu allows you to choose the export format. It also contains the option to include or exclude a table of contents.

![Export](uploads/images/ExportConfig-V2.PNG)

Supported formats are:

- Original files (markdown, yaml, and BibTex)
- HTML5
- LaTeX
- PDF
- ODT (LibreOffice)
- DOCX (Micrsoft Word)
- ICML (InDesign)
- XML-TEI
- XML-Érudit
- XML-TEI Commons Publishing (Métopes and OpenEdition)

It is possible to choose from several bibliographic styles, some of which integrate references into the text (Chicago, for example, which uses parentheses to insert the reference into the text body) and others, who add footnotes for references.

The export module manages the reference formatting, adding or removing spaces, and inserting "ibid" according to the style, etc.

Exports are produced thanks to the [pandoc](https://pandoc.org/) conversion tool, based on [`stylo-export` templates](https://gitlab.huma-num.fr/ecrinum/stylo/stylo-export/-/tree/main/templates/generique).

The export also downloads the Stylo source files (.md, .bib, .yaml) and the media inserted in the article, if this is the case.

### Personalise the export

From the source files, it is possible to produce personalised exports (layout, graphics, metadata) by using the [pandoc](https://pandoc.org/) conversion tool.

For more information on using the templates, see this [tutoriel](https://framagit.org/marviro/tutorielmdpandoc/blob/master/parcours/04_edition.md#les-templates-dans-pandoc).

## Develop other article functions

To develop other article functions, you must click on the arrow, positioned to the left of the title of your article:

![Plus](/uploads/images/ChevronArticle-V2.PNG)

### Access versions of the article

You then have access to the major and minor versions of the articles: clicking on the name of a version takes you to the page in \"Editing\" mode of the respective version.

![Versions](/uploads/images/AccesVersion-V2.PNG)

**Careful**: the page version to which you have access, although it is in \"Editing\" mode, does not allow you to change the content of the article. This is just a reading mode page from which you can [export]() and [compare]().

![ManageTags](/uploads/images/CreateNewTag-V2.PNG)

### Tag an article

You can also assign tags to your article from the list of current tags, simply by clicking on the tag you wish to add.

![TagEdit](/uploads/images/SelectTag-V2.PNG)

**Careful**: to create tags, you must refer to the [Manage tags] tool.

![BarreLaterale2](/uploads/images/CreateNewTag-V2.PNG)

### Delete an article

To delete an article in your list of articles, click on the following icon:

![Delete](/uploads/images/Delete-V2.png)

A red tab will automatically open, informing you that your file will be deleted:

![Delete2](/uploads/images/DeleteRouge-V2.PNG)

To permanently delete your article, you must double click on "Delete".
