---
title: "Gérer ses métadonnées"
---

Les métadonnées des documents créés dans Stylo sont sérialisées en YAML. Il s’agit d’un format de texte brut permettant de décrire explicitement des données selon le principe de `[clef : valeur]`.

Les métadonnées de chaque article sont visibles dans le volet à droite de l’interface, dans la section correspondante.

![Volet métadonnées](/uploads/images/refonte_doc/Metadonnees.png)

Vous pouvez éditer vos métadonnées en inscrivant les informations dans les champs définits par défaut dans le formulaire de métadonnées. Autrement, en activant le mode YAML brut dans le coin supérieur droit ![YAML](/uploads/images/refonte_doc/YAML.png), vous pouvez renseigner vos métadonnées directement en YAML, ce qui peut vous permettre d'ajouter des clefs qui ne sont pas présentes dans le formulaire par défaut ou de les modifier. Notez que la clef et la valeur ajoutées en YAML brut ne s'afficheront pas dans le mode formulaire.

Les métadonnées de vos articles correspondent à un certain « type » (article, billet de blog, note de réunion, chapitre) pour lesquels des champs particuliers de métadonnées ont été pensés. Vous pouvez passer d'un type de métadonnées à un autre sans perdre d'information et avec des correspondances faites entre différents champs (comme « titre » pour chaque type). S'il vous manque des champs, il vous faudra le rajouter l'option en mode YAML brut.

*Pour plus d'information sur la gestion de vos métadonnées, nous vous conseillons de consulter la section sur le YAML dans « Tutoriels ».*
