---
title: Versionner ses documents
---

![Active](/uploads/images/Nom-Version-V2.PNG)

Versionner un document n'est pas un geste anodin.
Réaliser cette action peut souvent être assimilé à la création d'une sauvegarde, pourtant les deux notions diffèrent légèrement.
Là où la sauvegarde permet de créer une archive des documents à un instant donné, le versionnement crée une arborescence dans laquelle sont enregistrées les évolutions apportées aux documents.

Chacune de ces évolutions fait l'objet d'une version créée explicitement par l'utilisateur.
Cette version peut ensuite être rappelée à tout moment, c'est-à-dire que l'on peut remettre le fichier de travail dans un état antérieur grâce au principe de versionnement.
Alors que dans le cas de la sauvegarde, pour revenir à un état antérieur, il faudrait naviguer dans des archives pour retrouver l'état souhaité et ouvrir un autre document pour ensuite éditer les informations contenues dans cet état antérieur.
L'arborescence des versions permet d'empiler l'historique des modifications d'un document sur lui-même, dans un arbre des versions, sans avoir à dupliquer en une multitude d'archives les étapes importantes que l'on souhaite conserver.

Dans le cadre d'un travail collaboratif, le système de versionnement permet également la mise en place d'une dynamique d'écriture asynchrone, où chacun peut versionner ses modifications et les rendre facilement accessibles aux autres personnes qui travaillent sur ce document.

Dans Stylo, une version d'un document contient toujours les trois éléments de l'article : métadonnées, bibliographie, corps de texte. En chargeant une ancienne version, ce sont donc ces trois éléments qui sont mis à jour. 

Votre travail est par défaut automatiquement sauvegardé sur Stylo, mais vous devez créer vous-mêmes les versions. Pour ce faire, vous pouvez donc - et cela est conseillé - utiliser la fonction de sauvegarde [New Version] qui permet de générer une nouvelle version du travail :

![New-Version](/uploads/images/New-Version-V2.PNG)

Ainsi, lorsque vous êtes parvenu·e·s à une version que vous jugez satisfaisante, il vous est possible de nommer votre version dans le champ *Label of the version* avant de l'enregistrer en tant que version mineure (**[Create Minor]**) ou majeure (**[Create Major]**). 

![Label Version](/uploads/images/Label-Version-V2.PNG)

Une version mineure correspond à des modifications mineures, tandis qu'une version majeure acte l'établissement d'une version dont les modifications sont importantes. 

À tout moment, vous pouvez visualiser votre travail, qu'il s'agisse de la version actuelle que vous êtes en train d'éditer ou des versions précédentes. Il suffit de cliquer sur le bouton **[Preview]** :

![Preview](/uploads/images/Preview-Bouton-V2.PNG)

Chaque version comporte plusieurs fonctionnalités :

- Pour la version éditable (*Edition*) :

|                        Bouton                        |Fonction|
|:----------------------------------------------------:|:--|
| ![Majeure](/uploads/images/Create-Major-V2.PNG) | pour sauvegarder une version majeure de votre travail |
| ![Mineure](/uploads/images/Create-Minor-V2.PNG) | pour sauvegarder une version mineure de votre travail |
|       ![Export](/uploads/images/Export-V2.PNG)       | pour exporter et télécharger la version dans différents formats |
|  ![Prévisualisation](/uploads/images/Preview-Bouton-V2.PNG)   | pour accéder à la prévisualisation de votre travail et l'annoter |

- Pour une version antérieure :
	- **[Comparer]** pour comparer les différentes versions (une version antérieure et la version actuelle ou deux versions antérieures). Pour davantage d'informations sur la fonction **[Compare]**, vous pouvez consulter la [page suivante](/fr/interface);
	- **[Exporter]** : pour exporter et de télécharger le document dans différents formats : HTML, PDF, XML, etc.;
	- **[Prévisualiser]** pour accéder à la prévisualisation de votre travail et l'annoter. Pour davantage d'informations sur la fonction **[Preview]**, vous pouvez consulter la [page suivante](/fr/preview).

Pour visualiser une ancienne version, il vous suffit de cliquer sur son titre. Pour retourner à la version éditable, il vous faut cliquer sur le bouton **[Edit Mode]**.
