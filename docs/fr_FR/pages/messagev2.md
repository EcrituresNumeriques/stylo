# Stylo v2.0 : message pour la documentation

## *New release* : Stylo.2.0

### Stylo fait peau neuve !

Chères utilisatrices, chers utilisateurs de Stylo,

Pour ce début d'année, nous vous avons concoté une nouvelle mouture de Stylo et de nouvelles fonctionnalités pour continuer à se rapprocher de vos pratiques d'écriture savante et de vos besoins en la matière !

Quoi de neuf dans Stylo 2.0 ? Ci-dessous un tour d'horizon des modifications apportées : 

- Des changements graphiques de l'interface utilisateur ;
- L'implémentation de l'éditeur de texte Monaco ;
- L'autocomplétion de vos références bibliographiques directement dans votre texte ;
- De nouvelles entrées pour vos métadonnées (notamment pour le mode éditeur) ;
- Un nouveau module d'export ;
- Un service dissocié pour l'utilisation du logiciel Pandoc (SaaS) ;
- Une stabilisation de la fonctionnalité de partage ;
- Une API GraphQL.

#### Changements graphiques

Quelques changements graphiques ont été fait pour rafraîchir un peu l'interface : 
- Les colonnes gestionnaires (édition et métadonnées) ont été légèrement retouchées
- Les boutons de *preview* et d'export ont été déplacés : ils ne sont plus à l'intérieur du volet de gestion à gauche mais dans la partie centrale de l'écran, au-dessus de l'éditeur de texte.

![](uploads/images/stylo-v2-interface.png)

![](uploads/images/stylo-v2-voletsOuverts.png)


#### Monaco

L'éditeur de texte, pièce centrale de Stylo, a été complètement refondu ! Nous avons intégré un nouvel éditeur : [Monaco](https://microsoft.github.io/monaco-editor/index.html). De nouvelles fonctionnalités sont maintenant disponibles : 

- L'utilisation d'expressions régulières ;
- Un comportement plus précis de la fonctionnalité de comparaison entre différentes versions d'un même document (fonctionnement ligne à ligne).

![](uploads/images/stylo-v2-regex.png)
![](uploads/images/stylo-v2-diff.png)



#### Autocomplétion

Grâce à l'éditeur de texte Monaco, nous pouvons automatiser certains aspects de l'écriture en suivant le principe d'autocomplétion. À ce jour, nous avons ajouté la possibilité d'autocompléter les clés BibTeX pour ajouter vos références bibliographiques plus simplement et sans erreur ! Il vous suffit de commencer à écrire "\[@" ou simplement "@" pour que l'éditeur de texte vous propose toutes vos références associés à l'article. Si vous souhaitez affiner l'autocomplétion il suffira d'ajouter la première lettre du nom de l'auteur pour réduire les propositions faites.

#### Module d'export

Fort de notre expérience en matière de chaîne basée sur le concept de *single source publishing*, nous sommes repartis de zéro pour vous proposer un nouveau module d'export plus stable, plus beau et plus performant. Contrairement au module *legacy*, le nouveau module d'export permet dorénavant un export vers l'infrastructure [Métopes](http://www.metopes.fr/) !

![](uploads/images/stylo-v2-export.png)


#### Service Web Pandoc

Le cœur technologique de notre module d'export repose sur le logiciel de conversion [Pandoc](https://pandoc.org/). Dans un souci d'être au plus proche des besoins des utilisateurs, nous avons décidé de décentraliser Pandoc dans une interface Web indépendante de Stylo. Ainsi, Pandoc devient accessible via une interface graphique et offre la possibilité de customiser à souhait les documents que l'on souhaite transformer ! Ce service repose sur une API que nous utilisons pour notre module d'export Stylo.

#### API GraphQL

L'API donne accès aux données de Stylo grâce au langage de requête GraphQL ! Depuis l*endpoint* (https://stylo.huma-num.fr/graphql), il devient possible de connecter Stylo à tout un ensemble de fonctionnalités réalisées par vos soins, donc sur mesure ! Par exemple, l'API vous permet de récupérer vos articles et de les intégrer dans votre générateur de site statique préféré.

Pour exécuter une requête POST, vous devez tout d'abord récupérer votre *APIkeys* dans les paramètres de votre compte Stylo. Ensuite, vous pouvez écrire votre requête dans votre environnement préféré (ex: GraphQL Playground) et commencer à jouer avec vos données Stylo ! Si vous utilisez GraphQL Playground, l'API s'auto-documente directement dans votre interface ! Vous accéderez à l'ensemble des requêtes et paramètres utilisables en seulement quelques clics.

Voici un exemple de requête pour récupérer tous vos articles : 

```
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

### À découvrir bientôt

Nous modifierons bientôt la documentation de Stylo pour vous préciser tous ces changements.

Nous prévoyons d'ores et déjà d'autres améliorations pour Stylo, comme le remplacement du partage de compte par une nouvelle fonctionnalité ou encore l'amélioration de celle liée aux ouvrages !  
N'hésitez pas à nous suivre sur Twitter ou sur le site de la CRCEN pour obtenir les dernières informations sur Stylo.

À vos Stylo(s) !

L'équipe de la CRCEN