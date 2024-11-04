---
title: "Versioning content"
---

## Introduction 

![Active](/uploads/images/Nom-Version-V2.PNG)

Versioning a document is no trivial matter.
Performing this action can often be likened to creating a backup, yet the two notions differ slightly.
Whereas a backup creates an archive of documents at a given point in time, versioning creates a tree structure in which document changes are recorded.

Each of these evolutions is the subject of a version created explicitly by the user.
This version can then be recalled at any time, i.e. the working file can be returned to a previous state thanks to the versioning principle.
Whereas, in the case of backup, to return to a previous state, you would have to navigate through archives to find the desired state and open another document to then edit the information contained in this previous state.
The version tree makes it possible to stack a document's modification history on top of itself, without having to duplicate in a multitude of archives the milestones you wish to preserve.

In the context of collaborative work, the versioning system also enables an asynchronous writing dynamic to be set up, where everyone can version their modifications and make them easily accessible to other people working on the document.

## How it works in Stylo

In Stylo, a version of a document always contains all three elements of the article: metadata, bibliography, body text.
By loading an older version, these three elements are updated.

By default, your work is automatically saved to Stylo, in what is called a 'working copy'.

**This working copy is not a version of your work, you have to create them manually.**

To do this, you can - and this is advisable - use the [New Version] save function, which allows you to generate a new version of the job.

### Create a new version

{% figure "/uploads/gif/create-new-version.gif", "Create a new version" %}

![New-Version](/uploads/images/New-Version-V2.PNG)

So when you've arrived at a version you're happy with, you can name it in the *Label of the version* field before saving it as a minor (**[Create Minor]**) or major (**[Create Major]**) version.

![Label Version](/uploads/images/Label-Version-V2.PNG)

A minor version corresponds to minor changes, while a major version is the establishment of a version with significant changes. 

Each version includes several features:

- For the editable version (*Edit*):

|                        Button                        |Function|
|:----------------------------------------------------:|:--|
| ![Major](/uploads/images/Create-Major-V2.PNG) | to save major version of your work |
| ![Minor](/uploads/images/Create-Minor-V2.PNG) | to save minor version of your work |

## Compare versions

For an earlier version, the ability to compare different versions becomes available.

Comparing different versions with each other allows you to quickly observe the changes made to a Stylo article. This is a very handy feature that offers a visual of the change history version by version.

**[Compare]** to compare the different versions (one previous version and the current version or two previous versions).

To view an older version, simply click on its title. To return to the editable version, click on the **[Edit Mode]** button.

When you're on an earlier version of your document, you have the option to export or preview it by clicking the buttons above the text editor.

{% figure "/uploads/gif/comparer-versions.gif", "Compare different versions of a document" %}