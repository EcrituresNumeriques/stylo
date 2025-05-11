---
title: "El editor de texto Monaco"
---

El editor de texto utilizado en Stylo es [Monaco](https://microsoft.github.io/monaco-editor/). Es el mismo componente utilizado en VSCode y VSCodium. También se puede encontrar en toda una gama de editores disponibles en la web.

Al utilizar Monaco en Stylo, se han incorporado varias funciones de escritura:

- Búsqueda y sustitución (CTRL/Cmd+F y CTRL/Cmd+H) ;
- Uso de expresiones regulares;
- Comparación entre distintas versiones de un mismo documento (operación línea por línea);
- Autocompletado de referencias y texto.
 
Además, haciendo clic con el botón derecho del ratón en el editor de texto se accede a otras opciones de edición:

- Cambiar todas las ocurrencias (Ctrl+F2): le permite seleccionar y cambiar todas las ocurrencias de la misma selección;
- Añadir comentario de línea (Ctrol+K y Ctrl+C): añade un comentario al campo de texto seleccionado;
- Cortar (Ctrl+X);
- Comando de la paleta (F1): da acceso a todas las acciones (y sus atajos de teclado) disponibles con Mónaco.

## Autocompletar

Se ha implementado una función de autocompletado en el editor de texto de Mónaco.
Por el momento, el autocompletado sólo afecta a las referencias bibliográficas.

Sólo tiene que empezar a escribir `[@` o simplemente `@` y el editor de texto le sugerirá todas las referencias asociadas al artículo. Si desea afinar el autocompletado, basta con añadir la primera letra del nombre del autor para reducir el número de sugerencias: `[@b`. Para garantizar que las referencias bibliográficas son procesadas correctamente por el software de conversión Pandoc, no olvide encerrar su referencia entre corchetes `[]`.

![Bibliografía-Autocompletado](/uploads/images/refonte_doc/autocompletion-bib.png)
