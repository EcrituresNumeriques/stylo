---
title: "Writing your Metadata in YAML"
---

## Introduction to YAML

YAML Ain't Markup Language is a very popular data serialization (and storage) language.
This _full text_ format is often used to describe document metadata, or to create configuration files.

YAML syntax is very light, which is one of the strengths of this format, unlike others such as JSON, which can be more verbose.

This syntax can be found in a document containing only YAML (with the extension `.yaml`), but also in other formats, such as Markdown. To add YAML to a Stylo article, simply add separators in the form of three dashes `---` on the lines before and after your data. This syntax marks and delimits YAML data in a document, allowing parsers to understand what language it is. You can also add metadata in YAML, in the right-hand “Metadata” pane, then by clicking on the button to activate YAML mode.

**Note**: Your metadata is automatically added in raw YAML if you write it in the metadata pane.

Here's an example of a YAML entry:

```yaml
---
title: "Title of my article"
author: "My name"
date: "AAAA-MM-DD"
---
```

Data description in YAML is based on the principle of \[key: value].

In the same way as a dictionary entry, we first indicate the key, for example `title`, to which we assign a value `“Title of my article”`.

One of the particularities of YAML, which also helps to make it attractive, is that there are no imposed keys in the choice of associating a key with a value. In other words, it's up to the author to choose the keys he or she wishes to use to describe the different data to be serialized.

For example, the author of a document can be described by creating an `author` key, or an `author` key, or anything else you can think of.

For example 

```yaml
author: "My name"
```
is exactly the same as :

```yaml
author: "My name"
```

So far, we haven't hierarchized the data shown as an example.
They are all still on the same level of structuring, i.e. “flat”.
YAML also allows you to add levels of depth to your data description.

If we take the author example again, we've simply assigned a character string to the `author` key.
Now we'd like to formally describe the author's first and last name.

```yaml
author:
    - last name: "Delannay"
      first name: "Roch"
```

By following this principle, we can declare several authors for the same document.
The important point of this syntax is to check the indentations between the information, as these define the depth levels and hierarchy between the different keys. 

```yaml
authors: 
    - last name: "Delannay"
      first name: "Roch"
    - last name: "Germain"
      first name: "Camille"
```

The information declared in YAML documents is not necessarily text (in the sense of a character string).
As in most programming languages, there are several types of data that can be described and manipulated: 

- character strings, encapsulated between `" "`;
- integers, for example: `6`;
- Booleans: `true` or `false`;
- decimals: `6.2`.

Good writing practice in YAML recommends specifying strings with `“”` even if software recognizes them without these symbols, to avoid conflicts with other data types: `"6"` and `6` are different.

These different data types aren't the only objects that can be assigned to a YAML key.
The YAML format also supports more complex objects: arrays, lists or dictionaries.

We've already seen lists in the last example.
They rely on indentation and the use of `-` dashes to announce a new entry in the list.

Arrays are delimited with square brackets `[ ]`, and the elements they contain are separated by commas `,`.

```yaml
first names: ["Roch", "Camille", "Victor"]
numbers: [1, 4, 8, 3, 55]
```

Finally, YAML dictionaries take the same form as dictionaries found in the Python programming language.
They are delimited by square brackets `{}` and the elements they contain are separated by commas `,`.
The objects described in a dictionary are based on the same `key:value` principle we described earlier.

So a YAML dictionary takes the following form: 

```yaml
myDictionary: {key1: "value1", key2: "value2", key3: "value3", key4: "value4"}
```

These more complex objects can contain all the data types we've mentioned: integers, strings, Booleans and decimals.

Here are some examples of YAML entries (this was the structure used for metadata in Stylo before the new version):

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

## Metadata in Stylo

Data structuring in Stylo has already been completed and is displayed in the right-hand pane. All the metadata associated with your article will be processed in YAML by Stylo. As a user, you can modify the predefined metadata structuring to suit your needs, using the “raw mode” tab.

Here's the structure for a Stylo item for which no metadata has been entered:

```yaml 
---
'@version': '1.0'
production:
  entities: []
senspublic:
  categories: []
type: article
---
```

---

For more information on YAML syntax, please consult other user guides. We welcome any suggestions you may have for additions to our documentation. 


