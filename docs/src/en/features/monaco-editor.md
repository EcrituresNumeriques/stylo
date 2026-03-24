---
title: "Monaco text editor"
---

The text editor used in Stylo is [Monaco](https://microsoft.github.io/monaco-editor/). This is the same component used in VSCode and VSCodium. It can also be found in a whole range of editors available on the web.

By using Monaco in Stylo, several writing functions have been incorporated to make it more "dynamic":

- Search and replace (CTRL/Cmd+F and CTRL/Cmd+H);
- Use of regular expressions;
<!--- Comparison between different versions of the same document (line-by-line operation);-->
- Autocompletion for references and text.
 
You can right-click in the text editor to access other editing options:

- Copy (CTRL/Cmd+C);
- Command palette (F1): gives access to multiple actions (and keyboard shortcuts) available with Monaco;
- Métopes: blocks for infratextual markup in compliance with the Métopes chain; 
- Lightweight markup language: transforms selected text into bold, italic, hyperlinked texts, inline notes and indicates corresponding keyboard shortcuts. 

**To access the Command Palette directly via a keyboard shortcut, you can use the F1 key (Alt + F1 on Internet Explorer, and fn + F1 on the Mac keyboard).**

Also, to transform a text selection in your Stylo document into a MarkDown comment (which will therefore not be visible on export or on the public annotation link), you can use the keyboard shortcut ctrl + shift + a (command rather than ctrl, on certain Mac keyboards).

## Autocomplete

An autocomplete function has been implemented in the Monaco text editor. For the moment, autocompletion only concerns bibliographic references.

Just start typing `[@` or simply `@` and the text editor will suggest all your references associated with the article. If you wish to refine autocompletion, simply add the first letter of the author's name to narrow down the suggestions: `[@b`. To ensure that bibliographic references are processed without direct mention of the author name within the text, by the Pandoc conversion software, don't forget to enclose your reference in square brackets `[]` (see also [how to manage bibliographic references](https://stylo-doc.ecrituresnumeriques.ca/en/features/managingref/#general-use)).

![Bibliography-Autocompletion](/uploads/images/refonte_doc/autocompletion-bib.png)
