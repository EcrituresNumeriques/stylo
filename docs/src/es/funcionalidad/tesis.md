---
title: tesis y disertaciones
---

Stylo permite crear documentos más complejos que los simples artículos, como disertaciones o tesis; esta función se denomina **Corpus**.

**Por favor, ten en cuenta: esta opción no es completamente funcional, por lo que te recomendamos que esperes a futuras actualizaciones antes de utilizarla como renderizado final.**

## Principios básicos

Una disertación está formada por uno o más documentos Stylo colocados uno al lado del otro.

- Estos documentos pueden ser capítulos o partes de la tesis.
- Se agrupan en un resumen utilizando la misma _[etiqueta]_, que debe estar asociada a cada documento Pen.
- Cada capítulo o parte funciona, por tanto, como un documento Stylo:
 - tiene sus propios metadatos y bibliografía.
  - puede compartirse como tal (anotación, vista previa, etc.). Cuando se exporta la tesis, las distintas partes se editan juntas.
- Los metadatos de la tesis son los del primer documento.

**Los documentos de una tesina se clasifican por orden alfabético. La forma más sencilla de controlar el orden es colocar un número al principio del nombre de cada documento en cuestión (tenga en cuenta que el nombre del documento no debe confundirse con el título del documento introducido en los metadatos).**

## Algunas particularidades

### Niveles de títulos

Su tesina o tesis puede estar estructurada en partes y capítulos o sólo en capítulos. Los títulos de las **partes** deben ser **títulos de nivel 1** (ejemplo: `# Parte 1: título de mi parte`) y los títulos de los **capítulos** serán **títulos de nivel 2**. En el caso de una tesis estructurada sólo en capítulos, los títulos de los **capítulos** serán **títulos de nivel 1** (ejemplo: `# título de mi capítulo`)

Al exportar, puede declarar la organización de su tesis:

1. **En partes y capítulos**
2. **Sólo capítulos** **Sólo en capítulos**

### Bibliografía

Por defecto, la bibliografía generada es la de todas las referencias citadas o presentes en los distintos artículos que componen la tesina.

Pero también es posible estructurar esta bibliografía: en una tesina o tesis, la bibliografía suele dividirse en diferentes secciones. Stylo permite crear una bibliografía organizada en subapartados. He aquí los dos pasos a seguir:

1. En los metadatos de la tesis, debe declarar las diferentes secciones de la bibliografía. Para ello, ponga los metadatos en modo YAML.

![YAML](/uploads/images/refonte_doc/YAML.png)

Luego, al final, antes de `---`, añada las siguientes líneas:

```yaml
subbiblio:
 - key: pratique
 title: Pratique littéraire
 - key: theorie
 title: Théorie
```

La estructura es la siguiente:
- `key` es la «clave de sección», es decir, una etiqueta que se utilizará en el paso siguiente.
- `título` será el título de su sección bibliográfica, tal y como aparecerá en la tesina.

2. Para cada una de las referencias bibliográficas en cuestión, añada la clave de sección (por ejemplo «práctica» o “teoría”) en el campo «palabras clave». Esto puede hacerse en Zotero o en Stylo directamente, editando el BibTeX.

### Metadatos de tesis

_En una versión futura, la interfaz «Tesis» incluirá un editor de metadatos para metadatos de tesis._

En esta versión de Stylo, los metadatos de tesis serán los del primer documento declarado. Los demás metadatos serán ignorados. **Por lo tanto, las subdivisiones de la bibliografía** deben declararse en el primer documento de la tesina.

## Exportar

La tesis se exporta utilizando una plantilla LaTeX específica. Corresponde a la plantilla de tesis y tesinas de la Université de Montréal. Puede hacerlo a través de [esta página dedicada a las exportaciones](https://export.stylo.huma-num.fr/).

En breve estarán disponibles otras plantillas.

Dispone de varias opciones:

1. Formato del documento exportado
2. Estilo bibliográfico Estilo bibliográfico
3. Índice
4. Numeración (o no) de las secciones y capítulos 5. Estructura de la tesis: en partes y capítulos, o sólo en capítulos Numeración (o no) de secciones y capítulos
5. Estructura de la tesis: en partes y capítulos, o sólo en capítulos

Para personalizar la exportación a PDF, es posible insertar código LaTeX en el contenido Markdown (excluidos los metadatos).

