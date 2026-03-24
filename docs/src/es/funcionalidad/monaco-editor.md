---
title: "El editor de texto Monaco"
---

El editor de texto utilizado en Stylo es [Monaco](https://microsoft.github.io/monaco-editor/). Es el mismo componente utilizado en VSCode y VSCodium. También se puede encontrar en toda una gama de editores disponibles en la web.

Al utilizar Monaco en Stylo, se han incorporado varias funciones de escritura que la hacen más dinámica:

- Búsqueda y sustitución (CTRL/Cmd+F y CTRL/Cmd+H);
- Uso de expresiones regulares;
<!--- Comparación entre distintas versiones de un mismo documento (operación línea por línea);-->
- Atajos de teclado (negrita, cursiva, hipervínculos, nota "_inline_" en sintaxis Markdown); 
- Autocompletado de referencias y texto.
 
Haciendo clic con el botón derecho del ratón en el editor de texto se accede a otras opciones de edición:

- Copia (CTRL/Cmd+C);
- Comando de la paleta (F1): da acceso a varios acciones (y sus atajos de teclado) disponibles con Mónaco;
- Métopes: bloques para el anotaciones infratextuales de acuerdo con la cadena Métopes;
- Lenguaje de marcado ligero: permite transformar el texto seleccionado en negrita, cursiva o hipervínculo, de crear [una nota "_inline_"](/es/tutoriales/markdownsyntax/#nota-al-pie-de-página) y indica los atajos de teclado correspondientes. 

**Para acceder a la Paleta de comandos directamente mediante un atajo de teclado, puede usar la tecla F1 (Alt + F1 en Internet Explorer, y fn + F1 en el teclado Mac).**

También puede usar el atajo de teclado ctrl + a (command para algunos teclados Mac) para convertir una selección de texto en su documento Stylo en un comentario MarkDown (que no será visible cuando se exporte o en el enlace público de anotación).

## Autocompletar

Se ha implementado una función de autocompletado en el editor de texto de Mónaco. Por el momento, el autocompletado sólo afecta a las referencias bibliográficas.

Sólo tiene que empezar a escribir `[@` o simplemente `@` y el editor de texto le sugerirá todas las referencias asociadas al artículo. Si desea afinar el autocompletado, basta con añadir la primera letra del nombre del autor para reducir el número de sugerencias: `[@b`. Para garantizar que las referencias bibliográficas son procesadas correctamente por el software de conversión Pandoc sin citar directamente el nobre del autor, no olvide encerrar su referencia entre corchetes `[]` (véase también [comó gestionnar las referencias bibliográficas](https://stylo-doc.ecrituresnumeriques.ca/es/funcionalidad/bibliografia/#uso-general)).

![Bibliografía-Autocompletado](/uploads/images/refonte_doc/autocompletion-bib.png)
