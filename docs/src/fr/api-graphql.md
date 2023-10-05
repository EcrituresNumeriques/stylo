---
title: API GraphQL
---

## Configurer sa requête GraphQL

Stylo intègre dorénavant une API GraphQL à laquelle les utilisateurs peuvent avoir accès en lecture et en écriture.

L'API donne accès aux données de Stylo grâce au langage de requête GraphQL.
Depuis l'*endpoint* [https://stylo.huma-num.fr/graphql](https://stylo.huma-num.fr/graphql), il devient possible de connecter Stylo à tout un ensemble de fonctionnalités réalisées par vos soins, donc sur mesure.
Par exemple, l'API vous permet de récupérer vos articles et de les intégrer dans votre générateur de site statique préféré.

Pour exécuter une requête, vous devez tout d'abord récupérer votre *APIkeys* dans les paramètres de votre compte Stylo.
Les paramètres de votre compte utilisateur se trouvent dans le menu déroulant qui apparaît lorsque vous cliquez sur votre nom d'utilisateur en haut de l'interface.


La clef utilisateur pour la configuration de l'API se trouve dans la deuxième section des paramètres du compte sous l'entrée `API Key`.
Un bouton permet de copier l'intégralité de la clef dans le presse-papier.

Ensuite, vous pouvez écrire votre requête dans votre environnement préféré (ex: [GraphQL Playground](https://github.com/graphql/graphql-playground)) et commencer à jouer avec vos données Stylo.
Si vous utilisez GraphQL Playground, l'API s'auto-documente directement dans votre interface.
Vous accéderez à l'ensemble des requêtes et paramètres utilisables en seulement quelques clics.

Voici un exemple de requête pour récupérer tous vos articles : 

```graphql
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

## Exemples et applications

À venir.
