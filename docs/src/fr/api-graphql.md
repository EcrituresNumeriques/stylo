---
title: API GraphQL
---

## API GraphQL de Stylo - Une introduction

Stylo intègre dorénavant une API GraphQL à laquelle les utilisateurs peuvent avoir accès en lecture et en écriture.

L'API donne accès aux données de Stylo grâce au langage de requête GraphQL.
Depuis l'*endpoint* https://stylo.huma-num.fr/graphql, il devient possible de connecter Stylo à tout un ensemble de fonctionnalités réalisées par vos soins, donc sur mesure.
Par exemple, l'API vous permet de récupérer vos articles et de les intégrer dans votre générateur de site statique préféré.

GraphQL signifie **Graph Query Language**. C'est un langage de requête et un environnement d'exécution pour les interfaces de programmation d'application (API). C'est tout d'abord une création de Facebook en 2012, qui fut publié en libre accès en 2015. Vous obtenez de vos requêtes uniquement les données demandées et vous en définissez la structure.

### Pourquoi utiliser GraphQL?

- Cet environnement est très simple d'utilisation. 
- Elle vous permet de visualiser et de manipuler vos données contenues dans Stylo. 
- Vous obtenez exactement ce que vous demandez et pas plus. Vous pouvez ainsi avoir plusieurs types de données dans une seule demande. 
- C'est rapide.
- L'environnement ne requiert pas de savoir coder, les demandes disponibles sont présentes dans la documentation.

### Avant de commencer

1. Installer un client GraphQL

Vous pouvez choisir votre client préféré, que ce soit GraphQL Playground, Altair ou autre. La démonstration qui suit est réalisée avec le client GraphQL Playground.

2. Entrer l'URL

Une fois l'extension ou l'environnement installé, assurez-vous d'entrer dans le champ de l'URL, celle fournie plus haut, soit https://stylo.huma-num.fr/graphql. C'est l'endpoint de l'API.

3. Clé API

Il vous faut aussi entrer votre clé API. Dans l'application Stylo, cliquez sur votre nom, le menu déroulant s'ouvrira et vous cliquez ensuite sur votre adresse courriel. Cela vous mènera aux informations de votre compte. C'est dans cette section que vous trouverez votre clé. Copiez-la. De retour dans GraphQL, en bas à gauche se trouve l'onglet "HTTP HEADERS". Entrez la clé comme suis : 

```
{
"Authorization":"VOTRE CLÉ API" 
}
```

Assurez-vous d'être bien dans l'onglet "HTTP HEADERS".

![Commencer avec GraphQL](https://upload.wikimedia.org/wikipedia/commons/2/22/Capture_d%E2%80%99%C3%A9cran_2024-01-23_181249.png)

Vous êtes maintenant prêt à entrer votre première requête!


## Pour commencer

Dans cette initiation à l'API GraphQL de Stylo, nous verrons comment utiliser les requêtes et les mutations. Les requêtes vous permettront de visualiser vos données disponibles dans Stylo et les mutations vous permettront de les manipuler, d'en créer ou de les supprimer.

### Les requêtes

Il suffit de demander une requête (Query). C'est le premier mot de votre demande. 
Ensuite, il faut spécifier le type de requête, dans le premier exemple, nous lui demandons une liste de tous vos articles contenus dans Stylo. Entre crochets, nous spécifions quelles autres informations nous aimerions avoir. Dans ce cas, nous voulons savoir quel est l'utilisateur associé, le titre de l'article, ainsi que son identifiant. 

Vous pouvez bien sûr demander d'autres informations. Les possibilités sont immenses et vont de pair avec vos besoins. 
Il ne faut pas oublier de refermer les crochets après l'ouverture de chacun. Quand vous êtes prêts cliquez sur le bouton d'exécution. 

```
Exemple 1 :
query tousMesArticles {
    user {
     _id
     email
     
     articles {
      _id
      title
      }
   }
}
```

Dans l'exemple 2, il vous faut entrer l'identifiant de l'un des article de la liste précédente. Gardez-le, vous en aurez aussi besoin pour le dernier exemple. Une fois la requête entrée, vous devriez voir le titre de votre article, ainsi que la personne qui le détient.

``` 
Exemple 2 :
query articles {
    article(article: " ID DE L'ARTICLE "){
    title
       owner {
    displayName
    username
    email
    }
}
}
```

Pour ce dernier exemple, il vous faut encore une fois entrer votre identifiant d'article dans l'espace approprié. Cette fois-ci, GraphQL vous montre le titre de votre article, ceux qui y ont contribué, mais aussi le Markdown, Yaml et BibTex qu'il contient! 

```graphql
Exemple 3 :
query {
    article(article: " ID DE L'ARTICLE "){
    title
    contributors{user{displayName}}
    workingVersion{md yaml bib}
    }
}

```

Vous aurez peut-être remarqué que l'application vous offre des options d'autocomplétions lorsque vous écrivez. Cela vous donne des exemples de ce que vous pouvez demander par la suite. 

Vous trouverez aussi une liste complète dans l'onglet à gauche de l'écran « Schema » ou dans certaines version « Doc ». Si vous cliquez dessus, l'onglet s'ouvre. 
L'onglet de documentation de l'API est une fonctionnalités très intéressantes de GraphQL Playground. Il vous permet de prévisualiser toutes les requêtes et mutations possibles, ainsi que leurs détails en un seul champ d'un schéma donné.

![Schema](https://upload.wikimedia.org/wikipedia/commons/c/c6/Capture_d%E2%80%99%C3%A9cran_2024-01-23_184801.png)


### Les mutations

En plus des requêtes, vous pouvez aussi utiliser des mutations dans l'interface. 
Qu'est-ce que c'est? Les mutations sont une autre forme de requête. Cependant, toutes les opérations qui provoquent des écritures doivent être envoyées explicitement via une mutation. Pour faire simple, alors que les requêtes vous permettent de voir vos données, les mutations servent à créer, modifier ou supprimer des données ou du contenu. 

Regardons la liste dans l'onglet "Schema" : ![Mutations](https://upload.wikimedia.org/wikipedia/commons/4/48/Capture_d%E2%80%99%C3%A9cran_2024-01-23_191722.png)

Vous pouvez créer des articles, partager vos articles, les dupliquer et plus encore. La liste est longue.

Regardons un exemple de mutation : 

```
mutation{createArticle(title:"TITRE DE L'ARTICLE",
    user:" VOTRE ID ")
    {title _id}}

```

Dans cet exemple, nous demandons à l'API de nous créer un article. Pour ce faire entrer votre numéro d'identification que vous trouverez soit dans les informations de votre compte Stylo ou que vous pouvez demander dans GraphQL Playground. Entrez ensuite le titre que vous voulez dans l'espace approprié. Une fois la mutation lancée, retournez sur la page « Articles » de Stylo et vous verrez votre nouvel article avec le titre choisi. 

## Pour finir

GraphQL Playground est tel un bac-à-sable, c'est-à-dire un environnement de développement intégré (IDE) où il est possible de créer des scripts, quel que soit le langage utilisé. Ces scripts intègrent des requêtes GraphQL pour automatiser certaines tâches : par exemple, on pourrait imaginer une sauvegarde en local des données de Stylo!

Comme vous avez pu voir, l'API GraphQL de Stylo est simple à utiliser. Il suffit de d'entrer le nom des données souhaitées ou les mutations voulues et l'application vous les donne. La formation se termine ici, il ne vous reste plus qu'à essayer différentes requêtes et mutations par vous-mêmes!

Formation plus avancée à venir...
