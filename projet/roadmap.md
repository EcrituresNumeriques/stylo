## Roadmap :

### > septembre 2018

**Priorité 1 (d'ici Noël)**

- migration (20nov)
  - [x] **la suppression d'un article** partagé ne doit pas supprimer chez les autres

- [ ] **gestion de la liste des articles** (2j. pour les labels)
    - principe: gestion de labels par utilisateur et non par article: ce qui permet à chacun d'avoir sa propre organisation.
    - pouvoir drag&dropper les articles dans des "dossiers"

- [ ] **liste des utilisateurs par article** (1 semaine)

- [X] **visualisation des espaces insécables** non encodés (si 1j de travail, on y va. Sinon on descend la priorité)
  - [X] hacker la font pour afficher l'espace insécables (&160;)
    - [X] vérifier si le hack fonctionne pour le diff.
  - [ ] bouton pour ajouter un espace insécable

- [ ] **diff entre versions**
  - bouton rétablir + commentaire + clic sur modif positionne le curseur d'édition
  - POC (1 semaine) dans une page dédiée

- [x] **import/synchro Zotero**
  - [x] synchro sur sous-collection (done pour version sails 1.0)
  - [ ] compte privé
  - [ ] issue #41 (
  - [ ] contacter zotero pour un acces api privilégié. (nicolas)
  - [ ] Autre piste : betterbibtex

- [ ] limitation des nbrs de version (1h30)
  - [x] on ne charge que les 30 dernières
  - [ ] on met un nbr de version infini via un bouton pour charger les anciennes versions

- [ ] Templates & process (Nicolas et Marcello)
  - [ ] 1 neutre pour la preview HTML (Nicolas)
  - [ ] choix entre 3 types de documents : article, mémoire,
  - [ ] mémoire, thèse


- [ ] Ergo des autres modals:
  - [ ] Bibliography : icônes sur les références biblio pour dire : "cliquer et coller la clé dans le presse papier"
    - [ ] visualiser les infos : auteur/titre/date
    - [ ] affichage conflictuel : metadonnées VS comparaison de fichier
  - [ ] Versions :
    - icônes preview sur chaque version ?
    - fetcher le nbr d'annotation + la date de la dernière annotation (idée->>regarder l'api hypothes.is pour récupérer toutes les annotations sur une url tronquée des versions)
  - [ ] Sommaire : améliorer le saut de section : flash/surlignage de la ligne (v. nouvel éditeur)


- [ ] gestion du lock avec message d'avertissement, subscribe côté frondend
- [ ] gestion utilisateur (avec affichage de la liste)


**Priorité 2**

- [ ] **Comparaison** - quelques soient les versions

- [ ] **Affichage** - gestion du header éditeur
  - Edition du Titre de l'article + gestion titre long pour bouton compare


- [ ] améliorer l'éditeur wysiwym (v. nouvel éditeur)
  - [ ] correction ortho.
  - [ ] surlignage de la ligne curseur.
  - [ ] "fausse pagination"
  - [ ] mode visuel + tooltips footnote/biblio ? + agrandir/réduire la police

- [ ] push > git
- [ ] image dropping
- [ ] gestion du lock : websocket : ajout des modifications du live + versions en semi-temps réel.
- [ ] dashboard usages - tracking/logging
- [ ] synchro locale
- [ ] export pdf

**Priorité 3**

- pipelines vers erudit, vers site de revue
  - service Erudit pour générer le xml ?
- version standalone

### > fin mai2018


1. [x] Sortie xml. Pour la démo fin mai, peut-être intégrer un bouton "preview xml"..
  * voir : https://docs.gravitee.io/apim_policies_xslt.html
2. Modal export :
  1. pdf
  2. [x] html
  3. (xml tei) / ~~xml erudit~~
  4. zip (avec seulement md/yaml/bibtex)
3. vers un certain standing... :
  1. [x] ajouter un how-to : on se disait que ce pourrait être un article par défaut chez tous les utilisateurs.
  2. github doc : stylo-doc
  3. permettre un feedback :
    - ~~un [bandeau github](https://blog.github.com/2008-12-19-github-ribbons/), vers une issue~~
    - un bouton formulaire de support ou formulaire de retours (en structurant un peu le retour d'expérience
  4. [x] faire une passe design graphique sur l'ensemble du site. à rediscuter.
  5. No-cite dans le Yaml


---

* liste d'usagers pour les inscrits : envoyer à qlq plutôt que l'email : avec profil public (listé publiquement)/privé (passe uniquement par l'email/username), ou profil followé/ami ?
- Gestion de suivi de modification via un diffmerge : implémentation d'un client git en js.
  - on utilisera https://neil.fraser.name/software/diff_match_patch/demos/diff.html
- Importation bibliographie via zotero (fin mai ?)
  - scénario : on choisit dès le début si zotero (clé dossier public) sinon bibtex
  - on implémente d'abord la version group public, membership n'importe.
  - requête pour 1 collection d'1 user au format bibtex : https://api.zotero.org/users/458284/collections/BXJZJKTI/items?format=bibtex&v=1
  - requête pour 1 groupe public https://api.zotero.org/groups/1062519/items/top?start=0&limit=25&format=bibtex&v=1
- ajouter dans le yamleditor le parametrage de nocite : citer tout ou pas.
  - [ ] issue sur yamleditor
- Implémentation versionnage git (sur framagit)
  - simple push (version 2019)
  - full git compliant (version 2021 ?)
- possibilité de customisation des métadonnées (en prévision des diff. revues.)
- exportation vers d'autres formats (TEI)



---

### Prioriétés jan2017
1. User
2. intégrer le dernier yamlEditor
  * [ ] éditeur SP vérifie le fonctionnement
  * [ ] intégrer à stylo.
3. autosave
  * [ ] affiner l'autosave à partir d'un diff
4. intégrer un éditeur MD
  * [ ] simplemde.com
  * [ ] utiliser atom pour éditer un text area dans le browser https://addons.mozilla.org/fr/firefox/addon/ghosttext/

### Bloc 1
1. [x] améliorer la gestion des versions
2. [x] mettre en place un url pour une vue HTML
### Bloc 2
3. [x] Yaml/yamlEditor
4. mettre en place la gestion du partage
5. exports
### Bloc 3
6. editeur md wysiwym intégré/standalone
7. déploiement sur serveur de la chaire
### Bloc 4
8. markup inline
9. customisation du yaml Editor (v2)

---

## Estimés

### bloc 1
- AutoSave : 3x8heures (8h restant)

### bloc 2
- css export articles (2 heures)
- ~~deploiement en ligne (Variable)~~
- ~~utilisation Hypothes.is (en ligne necessaire)~~
 - migrer le YamlEditor pour utiliser le state (plus de dépendance à Redux): 8h
- Editor Yaml nouveau schema YAML (4 heures)
- implementation de l'API isidore (5x 8heures)
- Intégrer BIBtext processor en javascript:4h (un semble bien fonctionner aux premiers test)
- export XML erudit (8 heures)
- export Latex/PDF (A rechercher)

### bloc 3
- alleger le chargement de api/v1/articles (contient toutes les versions pour le moment) et propager les changement au front end: 8h
- fix login/register : 4h
- attribuer correctelent les articles/versions: 4h
- fork + send : 2h
- integrer un git-like diff pour les versions mineures: 2j

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
