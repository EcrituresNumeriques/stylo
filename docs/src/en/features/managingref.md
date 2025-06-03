---
title: Managing references
---

The bibliography function lists the bibliographic references you have added to your article. To add your references, click on *Bibliography* on the right menu. This opens the *Bibliography Manager* tool, offering you a number of options.

## Zotero

You can synchronize a bibliography (a collection or sub-collection) by connecting your Zotero account to Stylo (private or public groups/collections). This is what we recommend! 

You can also import your bibliography from a Zotero collection via a URL.
This URL can be a user, a group or a private or public collection.

![Bibliography-Zotero](/uploads/images/refonte_doc/ANG/biblio-zotero_ANG.png)

Here's how to synchronize a collection in your Zotero account:

From the Bibliographic Reference Manager, connect your Zotero account using the “Connect my Zotero account” option. A dialog box will open, entitled “New Private Key”, asking you to validate the connection between Stylo and Zotero.

By activating the drop-down list, you can now choose a collection (or sub-collection) from your Zotero account, of which you will see the URL show in the "import from URL" field.
After selecting a collection, you'll need to confirm your choice by clicking on “Replace current bibliography with this collection”.

**Please note**: *You cannot import more than one collection at a time. In addition, each synchronization or import overwrites your bibliographic data. If you use the synchronization option, we advise you to modify your references in Zotero and re-import them (there is no automatic synchronization), and so on until you obtain the expected result.

## Raw BibTeX 

You can enter your bibliography manually in BibTeX format. Your entries will be validated.

![Bibliography-Raw BibTeX](/uploads/images/refonte_doc/ANG/biblio-bibtex_ANG.png)

It is possible to correct the BibTeX directly. 

You can directly [structure your references in BibTeX](http://www.andy-roberts.net/writing/latex/bibliographies) or export your references in BibTeX using your bibliography management tool:

- See tutorials: [Zotero](https://bib.umontreal.ca/en/citer/logiciels-bibliographiques/zotero/installer) and [Mendeley](https://libguides.usask.ca/c.php?g=218034&p=1446316)

*We suggest you consult the section on BibTeX on "Tutorials" for more information*.

## Include references in your article

Inserting bibliographical references into Markdown text requires precise syntax in order to be dynamic.
The advantage of integrating bibliographical references in BibTeX format lies in the possibility of generating dynamic bibliographies and managing several parameters to obtain the wanted renderings. 

In this configuration, a special syntax is required to indicate a reference in the text, known as a citation key, in the following form: `[@citation-key]`.
A citation key is enclosed in square brackets `[ ]`, then called with the symbol `@`.

It is these keys that will then be transformed when exported according to the desired standards.

There are several ways to quickly write these quotation keys in Stylo:

- An autocomplete function is implemented in the text editor. Just start typing `[@` or simply `@` and the text editor will suggest all your references associated with the article. If you wish to refine autocompletion, simply add the first letter of the author's name to narrow down the suggestions provided: `[@b`.

- You can also click on the icon associated with the reference in the left-hand pane, then paste it (Ctrl+V) into the text at the desired location. It will then appear as `[@shirky_here_2008]`. To be clear, one click “copies” the reference's BibTeX key to the clipboard. 

![Bibliography example](/uploads/images/refonte_doc/ANG/biblio-exemple_ANG.png)

Inserting a BibTeX key in the body text has two effects:

1. The key is automatically replaced by the properly formatted citation in the body text, for example: (Shirky 2008);
2. The full bibliographic reference is automatically added at the end of the document (previewed or exported).

## General use

Markdown syntax can be used to structure your bibliographic references in the finest detail. Depending on your needs, here are some examples of how to produce a citation call:
- `[@shirky_here_2008]` will produce: (Shirky 2008)
- `[@shirky_here_2008, p194]` will produce: (Shirky 2008, p194)
- `@shirky_here_2008` will produce: Shirky (2008)
- `[-@shirky_here_2008]` will produce: (2008)

For example:

- If you wish to cite the author, the year and page in parentheses :

|In the editor | In the preview|
|:--|:--|
|`Real space, the space of our material life, and cyberspace (which is certainly not completely virtual) should not be considered separately, as they are increasingly intertwined.[@shirky_here_2008, p. 194].` | `Real space, the space of our material life, and cyberspace (which is certainly not completely virtual) should not be considered separately, as they are increasingly intertwined.(Shirky 2008, 194).`|

- If the author's name already appears and you only want to add the year of publication in parentheses :

|In the editor | In the preview|
|:--|:--|
|`Clay @shirky_here_2008[p. 194] has suggested that real space, the space of our material lives, and cyberspace (which is certainly not entirely virtual) should not be referred to separately, as they are increasingly intertwined.` | `Clay Shirky (2008, 194)has suggested that real space, the space of our material lives, and cyberspace (which is certainly not entirely virtual) should not be referred to separately, as they are increasingly intertwined.`|

- To avoid repeating a name and to indicate only the year, insert a `-` in front of the key.

|In the editor | In the preview|
|:--|:--|
|`Conceptual artists had tried (apparently without much success or conviction, if we are to believe Lucy Lippard [-@lippard_six_1973 ; -@lippard_get_1984])`<br/>`to circumvent the rules of the art market.` | `Conceptual artists had tried (apparently without much success or conviction, if we are to believe Lucy Lippard (1973 ; 1984))`<br/>`to circumvent the rules of the art market.`|

**Warning:** do not use Markdown syntax to accompany a quote. For example, don't use markup like: `[@shirky_here_2008, [link to a web page](https://sens-public.org)]`.

## Special cases

- Capital letters for English titles

Bibliographic styles in English often require capitalization of each word in the reference title. Stylo (and the conversion software it uses, Pandoc) will style titles correctly, provided the references declare the language used. 

Document language Stylo sets the default bibliographic style language for all references, except for bibliographic references containing other language data. For example, if the language declared in the document metadata is `fr`, the references will be treated as such. If, among these references, one is declared `en`, then title capitalization will apply.

**Note: Bibtex format includes several language properties: `language`, `langid`. Stylo (and Pandoc) only take the `langid` property into account, while the Zotero interface only allows you to enter the `language` property! It will therefore be necessary to manually add the `langid: en` property. There are two ways of doing this: 

1. Either in Zotero, use [the Extra section](https://www.zotero.org/support/kb/item_types_and_fields#citing_fields_from_extra) which allows you to enter additional `property: value` pairs, for example in our case: `langid: en`. After synchronization Zotero/Stylo, the property will be taken into account in Stylo.
2. Either in Stylo, open the [Bibtex brut] tab in the bibliography manager, and add the pair `langid: en` to the reference concerned.   

```bibtex
@book{coleman_coding_2013,
	address = {Princeton},
	title = {Coding freedom: the ethics and aesthetics of hacking},
	isbn = {978-0-691-14460-3},
	shorttitle = {Coding freedom},
	language = {eng},
	langid = {en},
	publisher = {Princeton University Press},
	author = {Coleman, E. Gabriella},
	year = {2013},
}
```

- Further information: [documentation Pandoc | Capitalization in titles](https://pandoc.org/MANUAL.html#capitalization-in-titles)

---

Here are some other resources:

- [What is Zotero?](http://editorialisation.org/ediwiki/index.php?title=Zotero)
- [How to install and use Zotero](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer)
- [How to quickly import a bibliography into Zotero](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer#h5o-13)
