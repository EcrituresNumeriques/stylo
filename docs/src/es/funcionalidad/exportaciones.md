---
title: "Exportar sus artículos"
---

Para exportar un artículo, empezar haciendo clic en el botón Exportar. Puede acceder a esta función desde su espacio personal, sus espacios de trabajo y la página de edición de artículos. 

![Botón Exportar](/uploads/images/refonte_doc/Export.png)

Se abrirá un cuadro de diálogo con varias opciones:

- Formato de exportación :
    - Archivos originales (markdown, yaml y bibtex) ;
    - Sólo archivos markdown ;
    - HTML5 ;
    - LaTeX ;
    - PDF ;
    - ODT (LibreOffice) ;
    - DOCX (Microsoft Word) ;
    - ICML (Impress) ;
    - XML-TEI ;
    - XML-Erudit ;
    - XML-TEI Commons Publishing (Métopes).
- Añadir un índice;
- Incluir todas las referencias o sólo las utilizadas;
- Enlazar o no las citas.

![Exportar](/uploads/images/refonte_doc/ES/Exporter_ES.png)

También puede elegir entre varios estilos bibliográficos: algunos integran la referencia en el texto (por ejemplo, Chicago), otros añaden una nota a pie de página con la referencia. El módulo de exportación se encarga de dar formato a las referencias, añadiendo o quitando espacios, insertando "Ibid", etc. de acuerdo con el estilo bibliográfico seleccionado.

{% figure "/uploads/gif/exporter-un-article.gif", "Exportar un artículo" %}

La exportación se realiza con la herramienta de conversión [Pandoc](https://pandoc.org/) a partir de las plantillas disponibles [aquí](https://framagit.org/stylo-editeur/templates-stylo).

Exportar también permite descargar los archivos fuente de Stylo (.md, .bib, .yaml) y cualquier medio insertado en el artículo.

Seleccionando exportar con archivos originales, es posible realizar exportaciones personalizadas (diseño, gráficos, metadatos, etc.) utilizando las funciones de Pandoc.

Para más información sobre el uso de plantillas, consulte este [tutorial](https://gitlab.huma-num.fr/ecrinum/manuels/tutoriel-markdown-pandoc).

*El módulo de exportación también está disponible en [esta página dedicada a las exportaciones](https://export.stylo.huma-num.fr/), para exportaciones adaptadas a los estilos y necesidades de las revistas. Para utilizarlo, necesitará el identificador de su artículo o corpus, que encontrará, por ejemplo, en el enlace URL "compartir y anotar" para un artículo, o "exportar" para un corpus.*
