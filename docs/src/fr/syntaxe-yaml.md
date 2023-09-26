---
title: Sérialiser ses métadonnées en YAML
---

## Introduction au YAML

YAML Ain't Markup Language est une langage de sérialisation (et de stockage) de données très populaire.
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
    - nom: "Wayne"
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

Ces différents types de données ne sont pas les seuls objets qui peuvent être affectés à une clef YAML.
Le format YAML prend également en charge des objets plus complexes : des tableaux, des listes ou des dictionnaires.

Nous avons déjà vu les listes dans le dernier exemple.
Elles reposent sur l'indentation et l'utilisation des tirets `-` pour annoncer une nouvelle entrée dans la liste.

Les tableaux quant à eux sont délimités avec des crochets `[]`, et les éléments qu'ils contiennent sont séparés par des virgules `,`.

```yaml

prenoms: ["Bruce", "John", "Céline"]

chiffres: [1, 4, 8, 3, 55]


```

Enfin les dictionnaires YAML prennent la même forme que les dictionnaires que l'on trouve dans le langage de programmation Python.
Ils sont délimités par des crochets `{}` et les éléments qu'ils contiennent sont séparés par des virgules `,`.
Les objets décrits dans un dictionnaire sont basés sur le même principe de `clef:valeur` que nous avons décrit précédemment.

Ainsi un dictionnaire en YAML prend la forme suivante : 

```yaml

monDictionnaire: {clef1:"valeur1", clef2:"valeur2", clef3:"valeur3", clef4:"valeur4", clef5:8}


```

Ces objets plus complexes peuvent contenir tous les types de données que nous avons mentionnés : des nombres entiers, des chaînes de caractères, des booléens et des décimaux.


## Les données dans Stylo

La structuration des données dans Stylo est déjà réalisée.
En tant qu'utilisateur il n'y a pas besoin de modifier cette structure.

Pour clore cette page de présentation du langage YAML, il est intéressant de voir une implémentation de ce dernier dans une application.
Pour un article dans Stylo, en mode écriture, le volet à droite de l'interface permet de gérer les métadonnées du document.

Le troisième mode, le mode `raw` offre quant à lui une visualisation de la structure des métadonnées associée à un article.
Si l'on ne prend que les métadonnées en mode `raw` d'un nouvel article, nous pouvons observer la structure suivante :

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

