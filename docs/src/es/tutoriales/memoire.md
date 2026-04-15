---
title: "Memorias y tesis"
header-includes: |
  <style> 

  .highlight-brush-blue {
  position: relative;
  display: inline;
  white-space: nowrap;
  z-index: 1;}

  .highlight-brush-blue::before {
    content: '';
    position: absolute;
    left: -3px;
    right: -3px;
    top: 10%;
    bottom: 5%;
    background: #88b9bb;
    border-radius: 2px 4px 3px 2px / 3px 2px 4px 3px;
    transform: rotate(-0.4deg) skewX(-1deg);
    z-index: -1;
    clip-path: polygon(
      0% 15%, 3% 5%, 8% 0%, 20% 3%, 35% 1%,
      50% 4%, 65% 0%, 80% 3%, 92% 0%, 100% 8%,
      98% 30%, 100% 55%, 99% 75%, 100% 90%,
      95% 100%, 80% 96%, 65% 100%, 50% 97%,
      35% 100%, 20% 97%, 8% 100%, 2% 92%,
      0% 70%, 1% 45%
    );}

  </style>

---

## Principio y tutorial

Una memoria o tesis es un **corpus** compuesto por tantos **capítulos** como **artículos** de Stylo.

Estos son los pasos a seguir:

- Escribir un artículo de Stylo por capítulo
- Crear un corpus de tipo `Tesis`

![Corpus de tipo Tesis](docs/uploads/images/refonte_doc/thesiscorpus.png)

- Reunir todos los artículos correspondientes a sus capítulos en ese corpus
- Ordenarlos arrastrándolos

![Ordenar artículos en un corpus](docs/uploads/images/refonte_doc/classer.gif)

Cada capítulo o parte funciona por tanto como un documento de Stylo:

- tiene sus propios metadatos
- tiene su propia bibliografía
- puede compartirse como tal (anotación, vista previa, etc.). Es en el momento de exportar la memoria cuando las distintas partes se compilan juntas

## Algunos puntos a tener en cuenta durante la redacción

### ¿Dónde completar los metadatos?

Los metadatos relativos al capítulo deben introducirse a nivel del **artículo**. Existe un formulario especial que utiliza las mismas claves YAML que el artículo, pero que renombra y ordena los campos del formulario para que solo sean visibles los campos pertinentes. El único metadato importante, y el único que debe completarse *como mínimo*, es el título.

![Metadatos de capítulo](docs/uploads/images/refonte_doc/titlechap.png)

Los metadatos globales de la tesis deben introducirse a nivel del **corpus**. Al seleccionar el tipo "Tesis" se mostrará un formulario especializado. No olvidar *guardar*, en lugar de simplemente cerrar la ventana modal.

![Metadatos del corpus](docs/uploads/images/refonte_doc/corpusmetadata.gif)

### Niveles de título

Como es habitual en Stylo, el título principal del capítulo/artículo es el que se introduce en los metadatos. Por lo tanto, es importante rellenar el campo de título *como mínimo*. A continuación, se utiliza dos almohadillas `##` para el primer nivel de sección dentro del capítulo.

### Bibliografía

Por defecto, la bibliografía generada incluye todas las referencias citadas o presentes en los distintos artículos que componen la memoria o tesis. El módulo de exportación apila los archivos BibTeX de cada artículo y elimina duplicados cuando es necesario. Las referencias aparecerán en orden alfabético bajo el título *Bibliografía* al final.

También es posible dividir la bibliografía en varias secciones:

1. Para cada elemento bibliográfico, añadir en el campo de palabras clave una clave que identifique la sección bibliográfica. Debe ser una sola palabra y sin guiones (por ejemplo, `prim` para las referencias primarias y `sec` para las referencias secundarias). Este paso puede realizarse en Zotero o directamente en el BibTeX sin procesar.

![Etiquetas en Zotero](docs/uploads/images/refonte_doc/zotero.png)

2. Crear un artículo titulado "Bibliografía" y añadirlo como último capítulo del corpus.
3. Para cada subsección, añadir un título de nivel 2 (`##`) y el siguiente fragmento de código:

```
::: {#refs-<clave-identificadora-de-esta-sección>}
:::
```

Ejemplo:

```markdown
## Corpus primario

::: {#refs-prim}
:::

## Referencias secundarias

::: {#refs-sec}
:::
```

<pre>
## Corpus primario

::: {#refs-<span class="highlight-brush-blue">prim</span>}
:::

## Referencias secundarias

::: {#refs-<span class="highlight-brush-blue">sec</span>}
:::
</pre>

lo que corresponde al siguiente BibTeX:

```bibtex
@article{wevers_visual_2020,
	title = {The visual digital turn: {Using} neural networks to study historical images},
	volume = {35},
	issn = {2055-7671},
	shorttitle = {The visual digital turn},
	url = {https://doi.org/10.1093/llc/fqy085},
	doi = {10.1093/llc/fqy085},
  ...
	keywords = {ia},
}
```

<pre>
@article{wevers_visual_2020,
	title = {The visual digital turn: {Using} neural networks to study historical images},
	volume = {35},
	issn = {2055-7671},
	shorttitle = {The visual digital turn},
	url = {https://doi.org/10.1093/llc/fqy085},
	doi = {10.1093/llc/fqy085},
  ...
	<span class="highlight-brush-blue">keywords = {sec},</span>
}
</pre>

### Agradecimientos

Los agradecimientos pueden insertarse automáticamente en la plantilla. Próximamente estará disponible un campo específico en el formulario de metadatos de la plantilla. Mientras tanto, pueden añadirse manualmente en el YAML sin procesar.

```yaml
'@version': '1.0'
abstract: aquí va el resumen
ackowledgements: |
  gracias a Pierre
  gracias a Paul
  gracias a Jacques
```

## Exportaciones

### Versión impresa

La exportación en PDF de la memoria o tesis se realiza a través del módulo de exportación: https://export.stylo.huma-num.fr/

Utiliza una plantilla LaTeX que cumple los requisitos de la mayoría de los departamentos de la UdeM (y le recomendamos encarecidamente que lo verifique). La elección de la fuente *Old Standard* es poco convencional, pero permite imprimir caracteres griegos.

Estos son los pasos a seguir:

1. Seleccionar Tesis/Memorias
2. Dar un título a la exportación y buscar el identificador del corpus <!--enlace: ¿existe un tutorial para encontrar el ID del corpus?-->
3. Seleccionar las opciones

- `con tabla de contenidos` para mostrar el índice
- `con todas las citas` para incluir todos los elementos de su colección bibliográfica en la bibliografía final, incluso las referencias no citadas en el texto
- `con citas enlazadas` para añadir un enlace en cada referencia citada que apunte a la bibliografía

### HTML / GES

La exportación del conjunto de artículos de un corpus se realiza en el gestor de corpus. Hacer clic en el icono 🖨 y seleccionar "HTML" como formato. Esta operación crea un archivo comprimido que contiene un archivo HTML independiente por artículo. La misma operación, seleccionando "archivos originales (md, yaml, bib)", crea un archivo comprimido con los archivos fuente de cada artículo. Estos pueden insertarse luego en una arquitectura que, gracias al uso de un GES (Quarto, Jekyll, Hugo), genera un sitio web.

## Perspectiva y advertencia

Stylo puede ser un buen compañero para la redacción de una memoria o tesis enmarcada en un enfoque de independencia respecto a los entornos propietarios. Markdown tiene la ventaja de un marcado ligero, lo que permite escribir evitando el ruido que pueden presentar sintaxis más verbosas como LaTeX o HTML. Stylo también facilita la colaboración con sus revisores y se encarga del formato (estilado) de la bibliografía, utilizando los estilos de la biblioteca de Zotero. Por último, sus numerosas opciones de exportación abren la puerta a una publicación en múltiples formatos.

Dicho esto, una memoria o tesis es un documento complejo cuyas exigencias de formato van más allá de lo que Stylo y Markdown pueden ofrecer para la versión impresa final. La exportación en PDF de un corpus de tesis presenta actualmente numerosas limitaciones. La más importante concierne a los niveles de título: no es posible distinguir títulos del mismo nivel que no estén numerados (como introducciones o conclusiones), ni crear partes que engloben capítulos. Stylo tampoco gestiona la creación automática de índices y glosarios^[es posible insertar código LaTeX en el Markdown, pero esta sintaxis es engorrosa. La plantilla no admite la impresión de estos dos apéndices]. Los criterios de presentación también pueden variar de una institución a otra. La disposición de las páginas preliminares podría no adaptarse a la cantidad de información que desee que figuren en ellas. Por último, no es posible incluir anexos.

Por estas razones, y aunque los desarrollos futuros paliarán algunas de estas carencias, desaconsejamos contar con una exportación en PDF directamente desde Stylo para la entrega final. En cambio, Stylo genera un archivo `.tex` bien estructurado y comentado, que constituye una buena base para personalizar. No dude en contactarnos: estaremos encantados de acompañarle en el aprendizaje de LaTeX para producir un PDF conforme a sus expectativas.