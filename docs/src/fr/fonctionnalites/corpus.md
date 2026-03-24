---
title: "Les corpus"
---

La fonctionnalité **Corpus** permet de regrouper un ensemble d'articles Stylo. Elle sert principalement deux objectifs :

- ajouter un niveau supplémentaire d'organisation des articles (en plus des étiquettes). Dans le cas de l'édition d'un numéro de revue par exemple, il devient possible de rattacher tous les articles de ce numéro à un seul corpus, ce qui permet d'obtenir un nouveau niveau hiérarchique dans l'organisation des documents ;
- regrouper des articles que l'on souhaiterait exporter en lot, par exemple pour un numéro de revue [pour un site legénéré avec le Crieur](https://stylo-doc.ecrituresnumeriques.ca/fr/fonctionnalites/site-web-crieur/).

Les corpus sont implémentés dans l'espace de travail personnel (« mon espace ») et dans les espaces de travail partagés. Ainsi un corpus peut être créé pas forcément pour un·e utilisateur·ice unique mais pour un groupe de personnes.

_La page dédiée à la gestion des corpus donne désormais accès aux articles qui les composent, au travers d'hyperliens. Toutefois, cette page est avant tout dédiée à la création, la modification et la manipluation de corpus._

## Créer un corpus

Pour créer un corpus, il faut tout d'abord aller sur la page de gestion des corpus en cliquant sur le bouton \[Corpus\] dans le bandeau noir en haut de l'interface.

![bouton corpus](/uploads/images/refonte_doc/Corpus.png)

Ensuite, le bouton \[Créer un corpus\] affiche un formulaire dans une fenêtre pop-up. Ce formulaire contient trois champs : titre, type et description. Les deux premiers (titre et type) sont obligatoires, et le troisième (description) est optionnel. Par défaut, le corpus est de type neutre.

Une fois créé, le corpus apparaît dans le gestionnaire de corpus et offre quatre nouvelles fonctionnalités :

- Modifier les métadonnées ; 
- Modifier ;
- Copier l'identifiant ;
- Supprimer ;
- Exporter le corpus (le bouton en forme d'imprimante) ;
- Partager un lien public et annotable du corpus (le bouton en forme de bulle avec une flèche).

## Ajouter des articles à un corpus

Pour ajouter des articles à un corpus, il suffit de cliquer sur « choisir des articles », ce qui affichera un fenêtre de pop-up avec ceux dans l'espace de travail sur lequel vous vous trouvez, que vous pourrez ajouter ou retirer (n'oubliez pas de cliquer sur « choisir ces articles » pour confirmer ces choix).

## Ordonner un corpus

Lorsque plusieurs articles Stylo sont reroupés dans un même corpus, il est possible de les ordonner. Il faut déplier la fenêtre d'informations du corpus et ordonner les articles grâce à un glisser-déposer (maintenir le clic gauche enfoncé et déplacer le curseur pour positionner l'article à la bonne place, puis relâcher).

## Éditer un corpus

Les informations du corpus (titre et description) peuvent être mises à jour en cliquant sur « modifier » dans le « menu à trois points » : ![menu à trois points](/uploads/images/menu-trois-points.png)

Une fenêtre pop-up contenant un formulaire va s'ouvrir et permettre de modifier ces deux champs. Toutefois, il ne sera pas possible de modifier le type de corpus une fois créé, pour éviter des conflits de métadonnées selon les types - vous devrez créer un nouveau corpus avec le bon type et supprimer l'ancien.

Pour modifier les métadonnées de votre corpus, vous devez cliquer sur « modifier les métadonnées » dans le menu à trois points : vous aurez un formulaire de métadonnées prédéfini pour votre type de corpus, que vous pouvez toutefois enrichir et compléter d'autres d'autres métadonnées qui vous seraient utiles en modifiant les métadonnées en YAML brut : ![YAML](/uploads/images/refonte_doc/YAML.png)

## Copier un identifiant de corpus

Il peut être utile de copier l'identifiant d'un corpus pour l'utiliser avec d'autres outils tels que [Le Pressoir](https://pressoir.org/) et [Le Crieur](https://gitlab.huma-num.fr/ecrinum/crieur), qui peuvent prendre en entrée des corpus Stylo pour générer des sites web statiques à partir de ceux-ci.

Vous pouvez copier l'identifiant dans le presse-papiers au travers de l'option dédiée dans le menu à trois points. 

## Exporter un corpus

L'export d'un corpus se réalise de la même manière que l'export d'un article.

Pour exporter un corpus, il faut se rendre sur la page de gestion des corpus et cliquer sur le bouton d'export.

![Exporter un corpus](/uploads/images/refonte_doc/ExportCorpus.png)

**Note :** à la différence des articles, il n'y pas d'accès à la fonctionnalité d'export depuis l'interface d'édition des documents puisque le corpus exporte plusieurs articles en même temps.

Une fenêtre s'ouvre et propose plusieurs options d'export :

- le format à produire :
    - HTML5 ;
    - ZIP ;
    - PDF ;
    - LATEX ;
    - XML (ÉRUDIT) ;
    - ODT ;
    - DOCX ;
    - EPUB ;
    - XML TEI ;
    - ICML.
    - des options additionnelles :
    - présence ou non d'une table des matières ;
    - la numérotation ou non des chapitres et sections ;
    - le type de division des contenus.

![Formulaire d'export d'un corpus](/uploads/images/corpus-formulaire-export.png)
