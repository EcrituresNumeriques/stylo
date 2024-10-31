---
title: "L'édition collaborative synchrone"
---

## Les pré-requis pour l'écriture synchrone

L'édition collaborative synchrone permet à plusieurs utilisateurs d'éditer en même temps un article dans Stylo.
C'est une fonctionnalité similaire à celle que l'on peut rencontrer dans d'autres applications comme [Hedgedoc](https://hedgedoc.org/) ou encore Google Docs.

Contrairement à ces applications où le partage d'une simple URL suffit à accorder les droits en écriture sur un document, Stylo nécessite l'authentification des usagers pour obtenir ce droit.

Les informations relatives à l'authentification se trouvent sur la page [Pour commencer avec Stylo](/fr/premierpas/#création-d'un-compte).

Ensuite, les utilisateurs qui souhaitent écrire sur un article Stylo lors d'une session collaborative doivent avoir accès à l'article à éditer. 
Pour avoir les droits d'accès à un article 3 solutions sont mises à disposition : 

- [créer un article](/fr/mesarticles/#créer-un-nouvel-article) 
- [partager un article](/fr/#partager-un-article)
- accéder à un article dans un [espace de travail](/fr/espace-de-travail).

## Initialiser une session d'écriture synchrone

{% figure "/uploads/gif/edition-collaborative.gif", "Session d'édition collaborative" %}

L'écriture synchrone dans Stylo n'est pas un mode par défaut pour tous les articles. 
C'est un mode qu'il faut initialiser en appuyant sur l'icône \[*Collaborative editing*\] dans la page de gestion des articles, qu'il s'agisse de l'espace personnel ou d'un espace de travail.

![Collaborative editing button](/uploads/images/collaborative-editing.png)

Le premier utilisateur à appuyer sur ce bouton devient le modérateur de la session d'écriture collaborative.
Pour rejoindre une session collaborative, les autres utilisateurs devront eux aussi cliquer sur ce bouton dans leur interface.

Une session d'écriture collaborative est un mode particulier qui ne correspond pas au fonctionnement nominal d'écriture dans Stylo.
Dans ce mode collaboratif, seul le texte en Markdown est accessible. Les autres informations ne sont pas accessibles (les volets à gauche et à droite de l'éditeur de texte).

![Collaborative editing interface](/uploads/images/collaborative-editing-interface.png)

Afin de respecter le bon fonctionnement de l'application, la fin d'une session collaborative doit être marquée par une fermeture du mode synchrone.
Seul le modérateur de la session peut effectuer cette action en appuyant sur le bouton de fin de session qui se trouve en haut à droite de l'écran, au-dessus de l'éditeur Monaco.

![End Collaborative Session](/uploads/images/collaborative-editing-end-session.png)

<alert-block heading="Important">

Si une session collaborative n'est pas fermée correctement, l'article concerné ne sera plus accessible en édition simple.

</alert-block> 

![Article en lecture seule](/uploads/images/article-en-lecture-seule.png)

Un article ouvert en mode collaboratif est signalé par un pictogramme rouge « _Live_ » à côté du pictogramme de la session collaborative dans la page de gestion des articles.
De la même façon, lorqu'un utilisateur est dans une session d'écriture en solitaire, et que l'article est partagé avec d'autres utilisateurs, un point rouge apparaît à côté du pictogramme d'édition pour signaler que cet article ne sera pas accessible en écriture, mais seulement en lecture.

![Session collaborative en cours](/uploads/images/session-collaborative-en-cours.png)

![Session solo en cours](/uploads/images/session-solo-en-cours.png)
