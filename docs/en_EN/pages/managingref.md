# Managing references

The bibliography lists the bibliographic references that you have added to your article. To add your references, click on **\[Manage\]** in the left side panel, to the right of the *Bibliography* tab. The *Bibliography Manager* tool opens and offers you several options:

- **Zotero**: you can synchronize a bibliography by connecting Stylo to your Zotero account (public or private groups/collections). We reccomend this method. See below for more details.

![Bibliography manger](uploads/images/BibliographieZotero-V2.png)

- **Zotero**: you can import your bibliography from a Zotero collection of a public gropu by entering the collection's URL.
- **Citations** : you can fill in your bibliography manually in BibTeX format.

![Bibliography citations](uploads/images/BibliographieCitations-V2.png)

- **Raw bibtex** : you can correct the BibTeX directly.

![Bibliographie Raw](uploads/images/BibliographieRawBibTeX-V2.png)

You can directly [structure your references in BibTeX](http://www.andy-roberts.net/writing/latex/bibliographies), or export your references in bibtex thanks to your bibliography management tool:

- see tutorials : <a class="btn btn-info" href="http://archive.sens-public.org/IMG/pdf/Utiliser_Zotero.pdf" role="button">Zotero</a> <a class="btn btn-info" href="https://libguides.usask.ca/c.php?g=218034&p=1446316" role="button">Mendeley</a>

## Synchronize a Zotero collection

It is possible to synchronize the references of an article with a collection or sub-collection of your Zotero account or a Zotero group (public or private). Here are the steps to follow:

1. In the left panel select the *Bibliography* tab, then click **\[Manage\]**.
2. Connect your Zotero account with the option "Connect my Zotero Account".
3. A window will open entitled "New Private Key" asking you to validate your connection between Stylo and Zotero. Click on "Accept Defaults".
4. By activating the drop-down list, you can now choose a collection (or sub-collection) from your Zotero account.
5. Click on the button **\[Replace bibliography with this account collection\]** so that the bibliographic references (these will appear in the left side panel under the bibliography tab)

**Here are some important remarks concerning synchronization with a Zotero collection:**
- This feature also allows for the importation of collections from public or priavte groups.
- You cannot import more than one collection.
- Each synchronization or import overwrites your bibliographic data. If you use the synchronization option, we advise that you change your references in Zotero and then re-import them, and so on until you obtain the expected result.
- There is no automatic synchronization. You must re-import each change made in Zotero. 

## Insert a bibliographic reference
An autocomplete feature has been added. Just start by typing `[@` or simply `@` and the text editor will suggest all of your references assocaited with the article. If you wish to refine the autocompletioon, just add the first letter of the author name to reduce suggestions provided: `[@b`. 

![Bibliographie-Autocomplétion](uploads/images/BibliographieAutocompletion-V2.png)

You can also click on the icon associated with the reference in the left pane, then paste (Ctrl+V) the reference into the text at the desired location. It will then appear as `[shirky_here_2008]`. To explain, one click is equivalent to "copying" the bibtex key of the reference in the clipboard.

![Bibliographie exemple](uploads/images/Bibliographie-Exemple-V2.PNG)

Inserting a bibtex key in the body text has two effects:

1. The key is automatically replaced by the correct formatted quote call in the body text, for example: (Shirky 2008).
2. The complete bibliographic reference is automatically added at the end of the document.

## General scenarios

The Markdown syntax allows you to finely structure your bibliographical references. Depending on your needs, here are different cases to produce the citation call:
- `[@shirky_here_2008]` will produce: (Shirky 2008)
- `[@shirky_here_2008, p194]` will produce: (Shirky 2008, p194)
- `@shirky_here_2008` will produce: Shirky (2008)
- `[-@shirky_here_2008]` will produce: (2008)

For example :

- If you want to quote the author + the year and the page in parentheses:

| In the editor | In the preview|
|:--|:--|
|`Real space, the space of our material life, `<br/>`and cyberspace (which is certainly `<br/>`not so completely virtual) should not be `<br/>`called separately, since they `<br/>`interpenetrate each other more `<br/>`firmly [@shirky_here_2008, p. 194]. `|` Real space, the space of our material life,`<br/>` and cyberspace (which is certainly `<br/>`not so completely virtual) should not be `<br/>`called separately, since they `<br/>`interpenetrate each other more `<br/>`firmly (Shirky 2008, 194).`|

- If the author's name already appears, and you just want to add the year of publication in brackets :

|In the publisher | In the preview|
|:--|:--|
|`Clay @shirky_here_2008 [p. 194] suggested that real space,`<br/>` that of our material life, and `<br/>`cyberspace (which is certainly not so completely `<br/>`virtual) should not be called `<br/>`separate since they interpenetrate `<br/>` more and more firmly. ` | `Clay Shirky (2008, 194), suggested that real space, `<br/>`that of our material life, and `<br/>`cyberspace (which is certainly not so completely `<br/>`virtual) should not be called `<br/>`separate since they interpenetrate `<br/>` more and more firmly.`|

- To avoid repetition of a name, and to indicate only the year, put a `-` in front of the key.


|In the editor | In the preview|
|:--|:--|
|`Conceptual artists had tried to circumvent`<br/>` the rules of the art market (apparently`<br/>` without much success or`<br/>` without much conviction, if`<br/>` we are to believe Lucy Lippard [-@lippard_six_1973; -@lippard_get_1984])`<br/>` to circumvent the rules of the art market. ` | ` Conceptual artists had tried to circumvent`<br/>` the rules of the art market`<br/>` (apparently without much success or`<br/>` without much conviction according to Lucy Lippard (1973; 1984)) `<br/>` to circumvent the rules of the art market.`|

**Careful**: Do not use Markdown syntax to accompany a citation. For example, do not use markings like this: `[shirky_here2008, [link to a website](https://sens-public.org)]`

## Some resources

- [What is Zotero?](http://editorialisation.org/ediwiki/index.php?title=Zotero)
- [How to install and use Zotero?](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer)
- [How to quickly import a bibliography to Zotero?](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer#h5o-13)
