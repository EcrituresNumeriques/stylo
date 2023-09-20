---
title: Sérialiser ses métadonnées en YAML
---

## Introduction au YAML

YAML Ain't Markup Language est une langage de sérialisation de données très populaire.
Ce format _plein text_ est souvent utilisé pour décrire les métadonnées d'un document ou encore pour créer des fichiers de configuration.

La syntaxe YAML est très légère, c'est l'une des forces de ce format contrairement à d'autres comme JSON qui peuvent être plus verbeux.

Tous les documents YAML débutent et finissent par trois tirets.
Cette syntaxe permet de marquer et délimiter les données YAML dans un document, permettant ainsi à la plupart des parsers de comprendre qu'il s'agit de données YAML.

On peut retrouver cette syntaxe soit dans un document qui ne contient exclusivement que du YAML (avec l'extension `.yaml`) mais aussi dans d'autres formats tels que Markdown à l'intérieur duquel on délimite les données sérialisées.

```yaml

---

# toutes les données vont entre les séparateurs
title: "Lettre à John"
author: "Bruce Wayne"
date: 1990-01-12

---


```


```md

---
title: "Lettre à John"
author: Bruce Wayne
date: 1990-01-12
<!-- métadonnées en YAML -->
---

## Titre en markdown

Bruce Wayne a écrit ces mots. 


```

Comme on peut le voir dans les exemples ci-dessus, la description des données en YAML repose sur le principe de \[clef : valeur\].

De la même façon que dans un dictionnaire, on indique d'abord la clef, par exemple `title` à laquelle on affecte une valeur `"Lettre à John"`.

Une des particularités de YAML, qui participe aussi à le rendre attractif, est qu'il n'y a pas de clefs imposées dans le choix d'association d'une clef à une valeur. 

C'est-à-dire qu'il revient à l'auteur.e de choisir les clés qu'iel souhaite utiliser pour décrire les différentes données à sérialiser.

Par exemple, on peut décrire l'auteur d'un document en créant une clef `auteur` ou encore `author` ou tout ce que l'on peut imaginer.

Ainsi : 

```yaml
author: "Bruce Wayne"

```
est exactement la même chose que :

```yaml
auteur: "Bruce Wayne"

```

Jusqu'à présent, nous n'avons pas hiérarchisé les données montrées en exemple.
Elles sont encore toute sur un même niveau de structuration, "à plat".
YAML permet également d'ajouter des niveaux de profondeur dans la description de ses données.

Si nous reprenons l'exemple de l'auteur, nous avons simplement affecté une chaîne de caractères à la clef `auteur`.
Or nous souhaiterions décrire formellement qu'un auteur à un nom et un prénom.

```yaml

auteur:
    nom: "Wayne"
    prenom: "Bruce"

```

En suivant ce principe, nous déclarer plusieurs auteurs pour un même document.
Le point important de cette syntaxe est de bien vérifier les indentations entre les informations puisque ce sont elles qui définissent les niveaux de profondeur et la hiérarchie entre les différentes clefs. 

```yaml

auteurs: 
    - nom : "Wayne"
      prenom : "Bruce" 
    - nom : "Wayne"
      prenom : "John"

```

Les informations déclarées dans les documents YAML ne relévent pas forcément du texte (au sens d'une chaîne de caractères).
Comme dans la plupart des langages de programmations, il existe plusieurs types de données que l'ont peut donc décrire et manipuler : 

- les chaînes de caractères que l'on encapsule entre des `" "` ;
- les nombres entiers, par exemple : `6` ;
- les booléen : `true` ou `false` ;
- les décimaux : `6.2`.

Les bonnes pratiques d'écriture en YAML recommandent de bien spécifier les chaînes de caractères avec les `" "` même si les logiciels savent les reconnaître sans ces symboles pour éviter tout conflit avec les autres types de données : `"6"` et `6` sont différents.


## Les données dans Stylo

Lorsque l'on crée un nouvel article dans Stylo et que l'on passe en mode écriture, le volet de droite de l'interface permet de gérer les métadonnées du document.

Le troisième mode, le mode `raw` offre quant à lui une visualisation de la structure des métadonnées associée à un article : 

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

_Note : cette liste n'est valide que pour un article dont aucune métadonnée n'a été renseignée._

