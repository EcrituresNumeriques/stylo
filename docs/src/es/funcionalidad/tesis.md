--- 
title: "Disertaciones y Tesis"
---

## Principio

En Stylo, una disertación o tesis es un tipo de **corpus** compuesto por **artículos**.

Para crear una disertación o tesis con Stylo, debe:

- Escribir un artículo de Stylo por sección.
- Crear un corpus de tipo «Tesis».

[Corpus de Tesis](/uploads/images/refonte_doc/thesiscorpus.png)

- Reunir todos los artículos que corresponden a sus secciones en este corpus.
- Organizarlos arrastrándolos y soltándolos.

[Organizar artículos en un corpus](/uploads/images/refonte_doc/classer.gif)

Cada sección de la disertación o tesis funciona, por lo tanto, como un «artículo» de Stylo, lo que significa que:

- Tiene sus propios metadatos;

- Tiene su propia bibliografía;

- Se puede compartir tal cual (enlace de anotación pública, para compartir con fines colaborativos, etc.).

- Las diferentes partes se combinan al exportar la tesis.

## ¿Dónde introducir los metadatos?

Los metadatos de una parte de la tesis deben introducirse a nivel de **artículo**. Existe un formulario especial que utiliza las mismas claves de metadatos YAML que el artículo, pero renombra y ordena los campos para que solo sean visibles los relevantes: este es el formulario de «capítulo». El único metadato importante, y el único que debe completarse como mínimo, es el título (véase más abajo).

![metadatos del capítulo](/uploads/images/refonte_doc/titlechap.png)

Los metadatos globales de la tesis (autor, fecha, etc.) deben introducirse a nivel de **corpus**. Seleccionar el tipo «Tesis» también genera un formulario especializado con campos específicos para este tipo de documento. ![Metadatos del corpus](/uploads/images/refonte_doc/corpusmetadata.gif)

¡No olvides guardar la ventana modal de metadatos antes de cerrarla!

## Niveles de título

Como es práctica habitual en Stylo, el título del artículo es el que se introduce en los metadatos (no confundir con el nombre del documento que se le dio al crearlo en Stylo). Por lo tanto, es importante completar el campo del título como mínimo. A continuación, empieza con dos símbolos de almohadilla `##` para la primera subsección dentro de la sección, y luego añade más símbolos de almohadilla para las sub-subsecciones.

## Bibliografía

Por defecto, la bibliografía generada incluye todas las referencias citadas o presentes en los distintos artículos que componen la disertación o tesis. El módulo de exportación se encarga de apilar los archivos BibTeX de cada artículo y eliminar las referencias duplicadas según sea necesario. Aparecerán en orden alfabético bajo el encabezado *Bibliografía* al final.

También es posible dividir la bibliografía en varias secciones. Para ello, debe:

1. Para cada entrada bibliográfica en BibTeX, añada una clave que identifique la sección bibliográfica en el campo `_keyword_`. Esta clave debe ser una sola palabra sin guiones (por ejemplo, `prim` para referencias primarias y `sec` para referencias secundarias). Este paso puede realizarse en un gestor de referencias bibliográficas como Zotero (véase la imagen a continuación) o directamente en Stylo modificando el archivo BibTeX original.

![Etiquetas en Zotero](/uploads/images/refonte_doc/zotero.png)

Esto generará lo siguiente en BibTeX, en la última línea (_keyword_):

```bibtex
@article{wevers_visual_2020,
title = {El giro visual digital: {Uso de} redes neuronales para el estudio de imágenes históricas},
volume = {35},
issn = {2055-7671},
shorttitle = {El giro visual digital},

url = {https://doi.org/10.1093/llc/fqy085},

doi = {10.1093/llc/fqy085},
...
keywords = {sec},

}
```

2. Crea un artículo con el título de metadatos "Bibliografía" y añádelo como último capítulo del corpus.

3. Para cada subsección, agregue un encabezado de nivel 2 (`##`) seguido del siguiente fragmento de código:

```
::: {#refs-<clave-que-identifica-esta-sección>}
:::
```

Ejemplo:

```markdown
## Corpus principal

::: {#refs-prim}
:::

## Referencias secundarias

::: {#refs-sec}
:::
```

### Agradecimientos

Los agradecimientos se pueden insertar directamente en los metadatos YAML sin procesar, previa adición de la clave al formato:

```yaml
'@version': '1.0'
abstract: este es el resumen
agradecimientos: |

Gracias Jacques por...

Gracias Jacqueline por...

```

## Exportaciones

### Versión impresa

La exportación a PDF de la tesis o disertación se realiza mediante el módulo de exportación en este enlace: <https://export.stylo.huma-num.fr/>

Utiliza una plantilla LaTeX que cumple con los requisitos de la mayoría de los departamentos de la UdeM (sin embargo, le recomendamos que lo verifique). La elección de la fuente *Old Standard* es algo inusual, pero permite el procesamiento de caracteres griegos antiguos.

En el módulo de exportación, siga estos pasos:

1. Seleccione la opción Tesis/Disertaciones;

2. Asigne un título a la exportación y localice el identificador del corpus en la página del corpus (que se encuentra en el menú de tres puntos);

3. Seleccione las opciones:

- `con índice` para mostrar el índice;

- `con todas las citas` para incluir todos los elementos de su bibliografía en la bibliografía final, incluso las referencias no citadas en el texto;

- `con citas enlazadas` para crear un hipervínculo para cada referencia citada en el texto, que lleva a la referencia bibliográfica completa en la bibliografía.

### Exportar a HTML o archivos originales

La exportación de su tesis o disertación completa a HTML se realiza en el gestor de corpus de Stylo. Haga clic en el icono de la impresora 🖨 y seleccione "HTML" como formato. Esto crea un archivo ZIP que contiene un archivo HTML independiente por artículo.

También puede realizar la misma operación con la opción "archivos originales (md, yaml, bib)", que crea un archivo ZIP que contiene los archivos fuente de cada artículo. Estos archivos pueden proporcionarse como archivos de entrada a un generador de sitios estáticos (como Quarto, Jekyll, Hugo o Le Pressoir), que generará (como resultado) un sitio web para su tesis doctoral o de maestría.

## Contexto y una advertencia

Stylo puede ser una herramienta valiosa para la redacción de tesis doctorales o de maestría que busca alejarse de entornos propietarios. Markdown tiene la ventaja de un marcado ligero, lo que permite escribir evitando la complejidad que pueden presentar sintaxis más extensas como LaTeX o HTML. Stylo también facilita la colaboración con los revisores y garantiza que la bibliografía esté formateada según el estilo elegido. Finalmente, sus numerosas opciones de exportación permiten la publicación en múltiples formatos.

Dicho esto, una tesis doctoral o de maestría es un documento complejo cuyos requisitos de formato superan las capacidades de Stylo y Markdown para la versión impresa final. La exportación de un corpus de tesis a PDF presenta actualmente varias limitaciones. La principal preocupación reside en la numeración automática de los títulos de sección: no es posible distinguir entre títulos del mismo nivel que deben numerarse (Capítulo 1, Capítulo 2, etc.) y aquellos que no (Introducción, Conclusión, etc.). Para obtener un resultado más adecuado, es necesario modificar el archivo `.tex` de salida. Tampoco es posible crear secciones que abarquen los capítulos.

Además, Stylo no gestiona la creación automática de índices y glosarios [si bien es posible insertar código LaTeX en Markdown, esta sintaxis resulta engorrosa. La plantilla no permite imprimir estos dos apéndices]. En cuanto a los criterios de presentación, suelen variar entre instituciones: el diseño de las páginas preliminares puede no ser el adecuado según la cantidad de información que se desee incluir. Por último, no es posible incluir apéndices.

Por estos motivos, y aunque es posible que futuras actualizaciones solucionen algunas de estas deficiencias, desaconsejamos utilizar directamente la exportación a PDF de Stylo para el resultado final. Sin embargo, Stylo genera un archivo `.tex` bien estructurado y comentado, que constituye un buen punto de partida para la personalización. No dude en contactarnos: estaremos encantados de ayudarle a aprender LaTeX y a generar un PDF que cumpla con sus expectativas.
