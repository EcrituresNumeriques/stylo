---
title: "Sérialiser ses métadonnées en YAML"
---

## Introduction à YAML

YAML Ain't Markup Language est un langage de sérialisation (et de stockage) de données très populaire.
Ce format _plein text_ est souvent utilisé pour décrire les métadonnées d'un document ou encore pour créer des fichiers de configuration.

La syntaxe YAML est très légère, c'est l'une des forces de ce format, contrairement à d'autres comme JSON qui peuvent être plus verbeux. La description des données en YAML repose sur le principe de \[clef : valeur\].

On peut retrouver cette syntaxe dans un document qui ne contient que du YAML (avec l'extension `.yaml`), mais aussi dans d'autres formats, tel que le Markdown. Pour ajouter du YAML à un article Stylo, simplement ajouter des séparateurs sous la forme de trois tirets `---` sur les lignes avant et après vos données. Cette syntaxe permet de marquer et de délimiter les données en YAML dans un document, permettant aux analyseurs de comprendre de quel langage il s'agit. Vous pouvez aussi ajouter des métadonnées en YAML, dans le volet de droite « Métadonnées », puis en cliquant sur le bouton pour activer le mode YAML.

**Note**: Vos métadonnées s'ajoutent automatiquement en YAML brut si vous les écrivez dans le volet de métadonnées.

Voici un exemple d'entrée en YAML :

```yaml
title: "Titre de mon article"
author: "Mon nom"
date : "AAAA-MM-JJ"
```

De la même façon qu'une entrée de dictionnaire, on indique d'abord la clef, par exemple `title` à laquelle on affecte une valeur `"Titre de mon article"`.

Une des particularités du YAML, qui participe aussi à le rendre attractif, est qu'il n'y a pas de clefs imposées dans le choix d'association d'une clef à une valeur. C'est-à-dire qu'il revient à l'auteur·e de choisir les clés qu'iel souhaite utiliser pour décrire les différentes données à sérialiser.

Par exemple, on peut décrire l'auteur·e d'un document en créant une clef `auteur` ou encore `author` ou tout ce que l'on peut imaginer.

Ainsi : 

```yaml
author: "Mon nom"
```
est exactement la même chose que :

```yaml
auteur: "Mon nom"
```

Jusqu'à présent, nous n'avons pas hiérarchisé les données montrées en exemple.
Elles sont encore toute sur un même niveau de structuration, c'est-à-dire « à plat ».
Le YAML permet également d'ajouter des niveaux de profondeur dans la description de ses données.

Si nous reprenons l'exemple de l'auteur, nous avons simplement affecté une chaîne de caractères à la clef `auteur`.
Or nous souhaiterions décrire formellement le nom et le prénom de l'auteur·e.

```yaml
auteur:
    - nom: "Delannay"
      prenom: "Roch"
```

En suivant ce principe, nous pouvons déclarer plusieurs auteur·e·s pour un même document.
Le point important de cette syntaxe est de bien vérifier les indentations entre les informations puisque ce sont elles qui définissent les niveaux de profondeur et la hiérarchie entre les différentes clefs. 

```yaml
auteurs: 
    - nom: "Delannay"
      prenom: "Roch"
    - nom: "Germain"
      prenom: "Camille"
```

Les informations déclarées dans les documents YAML ne relèvent pas forcément du texte (au sens d'une chaîne de caractères).
Comme dans la plupart des langages de programmations, il existe plusieurs types de données que l'ont peut donc décrire et manipuler : 

- les chaînes de caractères que l'on encapsule entre des `" "` ;
- les nombres entiers, par exemple : `6` ;
- les booléens : `true` ou `false` ;
- les décimaux : `6.2`.

Les bonnes pratiques d'écriture en YAML recommandent de bien spécifier les chaînes de caractères avec les `" "` même si les logiciels savent les reconnaître sans ces symboles pour éviter tout conflit avec les autres types de données : `"6"` et `6` sont différents.

Ces différents types de données ne sont pas les seuls objets qui peuvent être affectés à une clef YAML.
Le format YAML prend également en charge des objets plus complexes : des tableaux, des listes ou des dictionnaires.

Nous avons déjà vu les listes dans le dernier exemple.
Elles reposent sur l'indentation et l'utilisation des tirets `-` pour annoncer une nouvelle entrée dans la liste.

Les tableaux quant à eux sont délimités avec des crochets `[]`, et les éléments qu'ils contiennent sont séparés par des virgules `,`.

```yaml
prenoms: ["Roch", "Camille", "Victor"]
chiffres: [1, 4, 8, 3, 55]
```

Enfin les dictionnaires YAML prennent la même forme que les dictionnaires que l'on trouve dans le langage de programmation Python.
Ils sont délimités par des crochets `{}` et les éléments qu'ils contiennent sont séparés par des virgules `,`.
Les objets décrits dans un dictionnaire sont basés sur le même principe de `clef:valeur` que nous avons décrit précédemment.

Ainsi un dictionnaire en YAML prend la forme suivante : 

```yaml
monDictionnaire: {clef1: "valeur1", clef2: "valeur2", clef3: "valeur3", clef4: "valeur4"}
```

Ces objets plus complexes peuvent contenir tous les types de données que nous avons mentionnés : des nombres entiers, des chaînes de caractères, des booléens et des décimaux.

Voici des exemples d'entrées en YAML:

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

## Les métadonnées dans Stylo

La structuration des données dans Stylo est déjà réalisée et vous est proposée dans le volet de droite. Ce sont toutes les métadonnées associées à votre article, qui seront traitées en YAML par Stylo. En tant qu'utilisateur·ice et selon vos besoins, vous pouvez modifier la structuration prédéfinie des métadonnées, au travers de l'onglet « mode brut ».

Voici la structure pour un article Stylo dont aucune métadonnée n'a été renseignée :

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

Pour obtenir plus d'informations sur la syntaxe YAML, nous vous invitons à consulter d'autres guides d'utilisation. Toute suggestion d'ajout à notre documentation est la bienvenue. 
