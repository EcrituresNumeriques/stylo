---
title: "Writing in YAML"
---

## Introduction to YAML

YAML Ain't Markup Language is a very popular data serialization (and storage) language.
This _full text_ format is often used to describe document metadata or to create configuration files.

YAML syntax is very light, which is one of the strengths of this format, unlike others such as JSON, which can be more verbose.

All YAML documents begin and end with three hyphens.
This syntax marks and delimits YAML data in a document, enabling most parsers to understand that it is YAML data.

This syntax can be found both in a document containing exclusively YAML (with the extension `.yaml`) and in other formats such as Markdown, within which serialized data is delimited.

```yaml
---
# toutes les données vont entre les séparateurs
title: "Letter to John"
author: "Bruce Wayne"
date: 1990-01-12
---
```

```md
---
title: "Letter to John"
author: Bruce Wayne
date: 1990-01-12
<!-- métadonnées en YAML -->
---

## Titre en markdown

Bruce Wayne wrote these words. 
```
As you can see from the examples above, data description in YAML is based on the principle of \[key: value].

In the same way as in a dictionary, we first indicate the key, for example `title`, to which we assign a value `"Letter to John"`.

One of the special features of YAML, which also helps to make it attractive, is that there are no imposed keys in the choice of associating a key with a value. 

In other words, it's up to the author to choose the keys he or she wishes to use to describe the different data to be serialized.

For example, the author of a document can be described by creating an `author` key, or an `auteur` key, or anything else you can think of.

Thus : 

```yaml
author: "Bruce Wayne"

```
is exactly the same as :

```yaml
auteur: "Bruce Wayne"

```
So far, we haven't prioritized the data shown as examples.
They are still all structured on the same level, "flat".
YAML also allows you to add levels of depth to your data description.

If we take the author example again, we've simply assigned a character string to the `author` key.
Now we'd like to formally describe that an author has a first and last name.

```yaml
author:
    - name: "Wayne"
      firstname: "Bruce"
```

By following this principle, we can declare several authors for a single document.
The important point of this syntax is to check the indentations between the information, as these define the depth levels and hierarchy between the different keys.

```yaml
author:
    - name: "Wayne"
      firstname: "Bruce"
    - name: "Wayne"
      firstname: "John"
```

The information declared in YAML documents is not necessarily text (in the sense of a character string).
As in most programming languages, there are several types of data that can be described and manipulated: 

- character strings, encapsulated between `" "` ;
- integers, for example: `6` ;
- booleans: `true` or `false` ;
- decimals: `6.2`.

Good writing practice in YAML recommends specifying strings with `" "` even if software recognizes them without these symbols, to avoid conflicts with other data types: `"6"` and `6` are different.

These different data types aren't the only objects that can be assigned to a YAML key.
The YAML format also supports more complex objects: arrays, lists or dictionaries.

We've already seen lists in the last example.
They rely on indentation and the use of `-` dashes to announce a new entry in the list.

Arrays, on the other hand, are delimited with square brackets `[ ]`, and the elements they contain are separated by commas `,`.

```yaml
forenames: ["Bruce", "John", "Céline"]
numbers: [1, 4, 8, 3, 55]
```
Finally, YAML dictionaries take the same form as dictionaries found in the Python programming language.
They are delimited by square brackets `{}` and the elements they contain are separated by commas `,`.
The objects described in a dictionary are based on the same `key:value` principle we described earlier.

Thus, a YAML dictionary takes the following form:

```yaml
myDictionary: {key1: "value1", key2: "value2", key3: "value3", key4: "value4", key5: 8}
```
These more complex objects can contain all the data types we've mentioned: integers, strings, booleans and decimals.

## Metadata in Stylo

Data in Stylo is already structured.
As a user, you don't need to modify this structure.

To conclude this page presenting the YAML language, it's interesting to see how it's implemented in an application.
For an article in Stylo, in write mode, the pane on the right of the interface lets you manage the document's metadata.

The third mode, `raw`, visualizes the metadata structure associated with an article.
If we take only the `raw` mode metadata of a new article, we can observe the following structure:

```yaml 
---
bibliography: ''
title: ''
title_f: ''
surtitle: ''
subtitle: ''
subtitle_f: ''
year: ''
month: ''
day: ''
date: ''
url_article_sp: ''
publisher: ''
prod: ''
funder_name: ''
funder_id: ''
prodnum: ''
diffnum: ''
rights: >-
  Creative Commons Attribution-ShareAlike 4.0 International (CC
  BY-SA 4.0)
issnnum: ''
journal: ''
journalsubtitle: ''
journalid: ''
director:
  - forname: ''
    surname: ''
    gender: ''
    orcid: ''
    viaf: ''
    foaf: ''
    isni: ''
abstract: []
translatedTitle: []
authors: []
dossier:
  - title_f: ''
    id: ''
redacteurDossier: []
typeArticle: []
translator:
  - forname: ''
    surname: ''
lang: fr
orig_lang: ''
translations:
  - lang: ''
    titre: ''
    url: ''
articleslies:
  - url: ''
    titre: ''
    auteur: ''
reviewers: []
keyword_fr_f: ''
keyword_en_f: ''
keyword_fr: ''
keyword_en: ''
controlledKeywords: []
link-citations: true
nocite: '@*'
issueid: ''
ordseq: ''
---
```
_Note: this list is only valid for items for which no metadata has been entered._