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

- Copia (CTRL/Cmd+C);
- Comando de la paleta (F1): da acceso a todas las acciones (y sus atajos de teclado) disponibles con Mónaco;
- Metopes: bloques para el marcado infratextual de acuerdo con la cadena Metopes;
- Lenguaje de marcado ligero: permite transformar el texto seleccionado en negrita, cursiva o hipervínculo según la sintaxis ligera Markdown, así como crear una nota al pie de página. Indica los atajos de teclado correspondientes. 

Para acceder a la Paleta de comandos directamente mediante un atajo de teclado, puede usar la tecla F1 (Alt + F1 en Internet Explorer, y fn + F1 en el teclado Mac).

También puede usar el atajo de teclado ctrl + k y luego ctrl + c (command para teclados Mac) para convertir una selección de texto en su documento Stylo en un comentario MarkDown (que no será visible cuando se exporte o en el enlace público de anotación).

## Autocompletar

Se ha implementado una función de autocompletado en el editor de texto de Mónaco.
Por el momento, el autocompletado sólo afecta a las referencias bibliográficas.

Sólo tiene que empezar a escribir `[@` o simplemente `@` y el editor de texto le sugerirá todas las referencias asociadas al artículo. Si desea afinar el autocompletado, basta con añadir la primera letra del nombre del autor para reducir el número de sugerencias: `[@b`. Para garantizar que las referencias bibliográficas son procesadas correctamente por el software de conversión Pandoc, no olvide encerrar su referencia entre corchetes `[]`.

![Bibliografía-Autocompletado](/uploads/images/refonte_doc/autocompletion-bib.png)
