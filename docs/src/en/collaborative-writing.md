---
title: "Collaborative writing"
---

## Prerequisites for synchronous writing

Synchronous collaborative editing enables several users to edit an article in Stylo at the same time.
This feature is similar to those found in other applications such as [Hedgedoc](https://hedgedoc.org/) and Google Docs.

Unlike these applications, where sharing a simple URL is enough to grant writing rights to a document, Stylo requires user authentication to obtain this right.

Information on authentication can be found on the [Getting started with Stylo](/en/first-steps/#creating-an-account) page.

Then, users who wish to write in a Stylo article during a collaborative session must have access to the article. 
To gain access rights to an article, 3 solutions are available: 

- [create an article](/en/myarticles/#create-a-new-article) 
- [share an article](/en/#share-an-article)
- access an article in a [workspace](/en/workspaces).

## Initiate a synchronous writing session

{% figure "/uploads/gif/edition-collaborative.gif", "Collaborative editing session" %}

Synchronous writing in Stylo is not a default mode for all articles. 
It must be initialized by pressing the \[*Collaborative editing*\] icon on the article management page, whether in the personal space or a workspace.

![Collaborative editing button](/uploads/images/collaborative-editing.png)

The first user to press this button becomes the moderator of the collaborative editing session.
To join a collaborative session, other users must also click on this button in their interface.

A collaborative writing session is a special mode that does not correspond to the nominal writing function in Stylo.
In this collaborative mode, only Markdown text is accessible.
All other information is not accessible (the panels on the left and right of the text editor).

![Collaborative editing interface](/uploads/images/collaborative-editing-interface.png)

To ensure correct operation of the application, the end of a collaborative session must be marked by closing the synchronous mode. 
Only the session moderator can perform this action, by pressing the end session button at the top right of the screen, above the Monaco editor.

<alert-block heading="Important">

If a collaborative session is not closed correctly, the article will no longer be accessible in simple edition.

</alert-block>

![Read only article](/uploads/images/article-en-lecture-seule.png)

An article opened in collaborative mode is indicated by a red "_Live_" pictogram next to the collaborative session pictogram in the article management page.
Similarly, when a user is in a solo writing session, and the article is shared with other users, a red dot appears next to the editing pictogram to indicate that this article will not be accessible for writing, but only for reading.

![Collaborative session in progress](/uploads/images/session-collaborative-en-cours.png)

![Solo session in progress](/uploads/images/session-solo-en-cours.png)