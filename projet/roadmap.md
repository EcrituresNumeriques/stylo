

## Roadmap pour Stylo (voir détails ci-dessous):

### Bloc 1
1. améliorer la gestion des versions
2. mettre en place un url pour une vue HTML
### Bloc 2
3. Yaml/yamlEditor
4. mettre en place la gestion du partage
5. exports
### Bloc 3
6. editeur md wysiwym intégré/standalone
7. déploiement sur serveur de la chaire
### Bloc 4
8. markup inline
9. customisation du yaml Editor (v2)

---
## Détails

1. Améliorer la gestion des version

  il faudrait corriger un peu le scénario actuel sur la gestion des versions:
   * à la création d'un document, ou d'une nouvelle version, la vX.0 ne peut jamais être éditée/sauvée. Il faudrait pouvoir éditer et sauver dans la vX.0. Ou bien y a t il une logique contraire ? Peut-on envisager d'intégrer un autosave ?
   * ~~l'interface ne permet pas de comprendre que ce qu'on édite sera toujours sauvé dans une version incrémentée (+0,1 ou +1). Il faudrait donc éclaircir ce point en ajoutant sur ou à côté du bouton [Edit] la version qui sera effectivement sauvée. Exemple, si j'ai une v1.0 et v1.1 existantes, le bouton [Edit] devient [Edit v1.2]. De la même manière, le bouton [Quicksave] devrait devenir [Quicksave v1.2] et le bouton [New version] devrait devenir [New version v2.0]~~


2. mettre en place une url partageable pour une vue html
  ~~* Le scénario d'usage est que chaque version du document possède une version html dont l'url est partageable et accessible publiquement (comme sur google doc, on ne peut y accéder que si on nous envoie l'url).~~
  1. Développer une css minimale pour présenter correctement les articles.
  2. Intégrer par défaut le widget d'annotation hypothes.is (voir https://web.hypothes.is/for-publishers/#embedding)
  3. Sur la page listant les documents et versions, utiliser [l'API hypothesis](https://hypothes.is/api/) pour indiquer pour chaque version (vue html), le nombre d'annotations sur la vue et pourquoi pas, l'heure/date et user de la dernière annotation (indication pertinente pour un auteur qui aurait partagé en lecture/annotation son document). Voir [la doc Hypothes.is](http://h.readthedocs.org/).

3. Yaml/yamlEditor
  1. intégrer les préconisations Joanna sur la production du html. Son nouveau template pandoc md2html nécessite quelques modifications dans la structure du yaml. Il faudra intégrer ces modifs dans le yamlEditor.
  2. implémenter des appels à l'API isidore pour :
    * concepts/mots-clés (récupérer autorité+id)
    * auteurs (récupérer l'ORCID)
    * voir scénario évoqué avec Isidore [[stylo_scenarioAPIisidore]]

4. mettre en place la gestion du partage _(à détailler)_
  1. ajout d'utilisateur
  2. organisation des documents : labels/tags
5. export  _(à détailler)_:
  1. latex/pdf
  2. xml erudit (saxon + XSLT)
6. editeur md wysiwym intégré/standalone _(à détailler)_

7. déploiement sur serveur de la chaire _(à détailler)_
8. markup inline  _(à détailler)_
9. customisation du yaml Editor (v2) _(à détailler)_
