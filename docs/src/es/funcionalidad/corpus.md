---
title: "Corpus"
---

La función **Corpus** le permite agrupar un conjunto de elementos Stylo. Sirve para dos propósitos principales:

- añadir otro nivel de organización a los artículos (además de las etiquetas). Como en el caso de la publicación de un número de una revista, es posible vincular todos los artículos de ese número a un único corpus, creando así un nuevo nivel jerárquico en la organización de los documentos;
- para agrupar artículos que desee exportar juntos, por ejemplo, [para crear un sitio web de revista con le Crieur](https://stylo-doc.ecrituresnumeriques.ca/es/funcionalidad/sitio-Crieur/).

Los corpus se implementan en el espacio personal y en los espacios compartido de trabajo. Esto significa que un corpus no pertenece necesariamente a un único usuario, sino que también puede compartirse dentro de un grupo de personas.

*La página de gestión de corpus ahora permite da acceso a los artículos a través hipervínculos. Sin embargo, esta página está dedicada a crear, modificar o manipular datos relativos a los corpus.*

## Crear un corpus

Para crear un corpus, vaya primero a la página de gestión de corpus haciendo clic en el botón \[Corpus\] del banner negro de la parte superior de la interfaz.

![Corpus buton](/uploads/images/refonte_doc/Corpus.png)

A continuación, el botón \[Crear un corpus\] muestra un formulario en una ventana emergente. Este formulario contiene tres campos: título, tipo y descripción. Los dos primeros (título y tipo) son obligatorios y el tercero (descripción) es opcional. De forma predeterminada, el tipo está configurado en "neutral".

Una vez creado, el corpus aparece en el gestor de corpus y ofrece cuatro nuevas funciones:

- Editar metadatos;
- Editar;
- Copiar identificador;
- Eliminar;
- Exportar el corpus (el botón con forma de impresora);
- Compartir un enlace público y comentable del corpus (el botón en forma de burbuja con una flecha).

## Añadir artículos a un corpus

Para agregar artículos a un corpus, simplemente haga clic en "elegir artículos", lo que mostrará una ventana emergente con aquellos en el espacio de trabajo en el que se encuentra, que puede agregar o eliminar (no olvide hacer clic en "elegir estos artículos" para confirmar estas elecciones).

## Ordenar un corpus

Cuando varios artículos Stylo están agrupados en un mismo corpus, es posible ordenarlos. Debe desplegar la ventana de información del corpus y organizar los artículos mediante arrastrar y soltar (mantenga pulsado el botón izquierdo del ratón y mueva el cursor para colocar el artículo en el lugar correcto, luego suéltelo).

## Editar un corpus

La información del corpus (título y descripción) puede actualizarse haciendo clic en "modifica" a través del ícono de tres puntos: ![ícono de tres puntos](/uploads/images/menu-trois-points.png).

Se abrirá una ventana emergente con un formulario que le permitirá modificar estos dos campos. Sin embargo, una vez creado el corpus, no podrá cambiar su tipo para evitar conflictos de metadatos. Deberá crear un nuevo corpus con el tipo correcto y eliminar el anterior.

Para modificar los metadatos de su corpus, haga clic en «Editar metadatos» en el menú de tres puntos. Verá un formulario de metadatos predefinido para su tipo de corpus, que podrá enriquecer y complementar con otros metadatos útiles editando el código YAML: ![YAML](/uploads/images/refonte_doc/YAML.png)

## Copiar un identificador de corpus

Puede resultar útil copiar el identificador de un corpus para utilizarlo con otras herramientas, como [Le Pressoir](https://pressoir.org/) y [Le Crieur](https://gitlab.huma-num.fr/ecrinum/crieur), que pueden tomar el corpus Stylo como entrada para generar sitios web estáticos a partir de ellos.

Puede copiar el identificador al portapapeles haciendo clic en el icono del portapapeles. 

## Exportar un corpus

La exportación de un corpus se realiza de la misma manera que la exportación de un artículo.

Para exportar un corpus, vaya a la página de gestión del corpus y haga clic en el botón Exportar.

![Exportar un corpus](/uploads/images/refonte_doc/ES/ExportCorpus_ES.png)

**Nota:** A diferencia de los artículos, no hay acceso a la función de exportación desde la interfaz de edición de documentos, ya que el corpus exporta varios artículos al mismo tiempo.

Se abre una ventana que ofrece varias opciones de exportación:

- el formato a producir:
 - HTML5;
 - ZIP;
 - PDF;
 - LATEX;
 - XML (ÉRUDIT);
 - ODT;
 - DOCX;
 - EPUB;
 - XML TEI;
 - ICML.
- Opciones adicionales:
 - inclusión o no de un índice;
 - numeración o no de capítulos y secciones;
 - tipo de división del contenido.

![Corpus export form](/uploads/images/corpus-formulaire-export.png)
