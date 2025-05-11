---
title: "Monaco text editor"
---

The text editor used in Stylo is [Monaco](https://microsoft.github.io/monaco-editor/). This is the same component used in VSCode and VSCodium. It can also be found in a whole range of editors available on the web.

By using Monaco in Stylo, several writing functions have been incorporated:

- Search and replace (CTRL/Cmd+F and CTRL/Cmd+H) ;
- Use of regular expressions;
- Comparison between different versions of the same document (line-by-line operation);
- Autocompletion for references and text.
 
In addition, right-click in the text editor to access other editing options:

- Changes all occurrences (Ctrl+F2): allows you to select and modify all occurrences of the same selection;
- Cut (Ctrl+X);
- Add line comment (Ctrol+K and Ctrl+C): adds a comment to the selected text field;
- Palette command (F1): gives access to all actions (and keyboard shortcuts) available with Monaco.

## Autocomplete

An autocomplete function has been implemented in the Monaco text editor.
For the moment, autocompletion only concerns bibliographic references.

Just start typing `[@` or simply `@` and the text editor will suggest all your references associated with the article. If you wish to refine autocompletion, simply add the first letter of the author's name to narrow down the suggestions: `[@b`. To ensure that bibliographic references are processed correctly by the Pandoc conversion software, don't forget to enclose your reference in square brackets `[]`.

![Bibliography-Autocompletion](/uploads/images/refonte_doc/autocompletion-bib.png)
