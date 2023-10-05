---
title: "Monaco text editor"
---

Stylo's core text editor has been replaced by the [Monaco] text editor (https://microsoft.github.io/monaco-editor/).
This is the same component used in VSCode and VSCodium.
It can also be found in a whole range of web-based editors.

New functionalities are now available thanks to the implementation of this component: 

- search and replace functions now available, via the shortcuts `CTRL/Cmd+F` and `CTRL/Cmd+H` ;
- use of regular expressions;
- more precise behavior of the comparison functionality between different versions of the same document (line-by-line operation).

![](/uploads/images/stylo-v2-regex.png)
![](/uploads/images/stylo-v2-diff.png)

Right-clicking in the text editor opens a menu giving access to several options:

- Changes all occurrences (Ctrl+F2): allows you to select and modify all occurrences of the same selection;
- Cut ;
- Copy ;
- Palette command (F1): gives access to all the actions (and their keyboard shortcuts) available in Monaco, such as enlarging the characters displayed.

## Autocomplete

An autocomplete function has been implemented in the Monaco text editor.
For the moment, autocompletion only concerns bibliographic references.
Just start typing `[@` or simply `@` and the text editor will suggest all your references associated with the article. If you wish to refine the autocompletion, simply add the first letter of the author's name to narrow down the suggestions provided: `[@b`.

![Bibliographie-Autocomplétion](/uploads/images/BibliographieAutocompletion-V2.png)