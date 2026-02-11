---
title: Escribir en Markdown
---

## Niveles de título

- El título de nivel 1 -es decir, el título del artículo- debe introducirse en los metadatos.
- Los títulos de nivel 2 (títulos de sección) van precedidos de dos #. Por ejemplo: ## Introducción.
- Los títulos de nivel 3 (subsecciones) van precedidos de 3 #. Por ejemplo: ### Mi subsección.
- Y así sucesivamente (nivel 4, ####, etc.).

## Párrafos

Para crear párrafos, deje una línea en blanco entre los bloques de texto.

## Nota al pie de página 

Hay varias formas de insertar notas a pie de página en el texto. Las notas a pie de página pueden insertarse en el cuerpo del texto (inline) o con una referencia a pie de página al pie del artículo. La primera opción tiene la ventaja de no requerir navegación de ida y vuelta entre el cuerpo del texto y la nota misma, en la parte inferior del documento.

Ejemplos:

```
Aquí está mi texto^[Una nota al pie en línea.].
```

se convertirá en :

Este es mi texto<sup><a href="syntaxemarkdown.md#note-1" id="#note-1-b">1</a></sup>.

*Ver el final del artículo para la nota a pie de página*.

Alternativamente:

```
Este es mi texto[^2].

[^2]: Una nota a pie de página con llamada y referencia cruzada.
```

rendirá :

Aquí está mi texto<sup><a href="syntaxemarkdown.md#note-2" id="#note-2-b">2</a></sup>.

*Ver el final del artículo para la nota a pie de página*.

## Cursiva y negrita 

- La cursiva se marca con _ o * antes y después de la palabra o expresión en cursiva. Por ejemplo

```
Una palabra en _cursiva_
```

Esto da:

Aquí hay una _palabra_ en cursiva

- La negrita se marca con dos `__` o dos `**` antes y después de la palabra o frase en negrita. Por ejemplo:

```
Aquí hay una **palabra** en negrita
```

Esto da:

Aquí hay una **palabra** en negrita

- Para utilizar negrita y cursiva al mismo tiempo, se marca con tres `*` o tres `_` antes y después de una palabra. También puedes utilizar `_**` o `*__` de cada lado de la palabra. 

```
Aquí tienes una ***palabra*** en negrita y cursiva

Otro _**ejemplo**_

```

Esto da:

Aquí hay una ***palabra*** en negrita y cursiva

Otro _**ejemplo**_

## Lista 

Puede crear listas utilizando guiones `-`, un `+`, un `*` o números seguidos de un punto `1.`. Para crear una lista anidada dentro de una otra, solo hay que añadir una sangría antes del guión. **Cuidado**, hay que dejar una línea vacía antes de la lista. 

```
- Esto es 
    + una 
    * lista

o

1. Aquí es 
2. una 
3. lista
```

Esto da 

- Esto es 
    + una 
    * lista

o

1. Aquí es 
2. una 
3. lista

## Imágenes 

Una imagen puede integrarse en un artículo según el siguiente modelo:

- ¡Un signo de exclamación !
- seguido de corchetes [] que contienen la descripción de la imagen ;
- y paréntesis () que contienen la ruta de acceso o enlace a la imagen.

Este es el marcado:

```
![IMAGE Logo del Markdown](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/langfr-130px-Markdown-mark.svg.png)
```

El resultado es:

![IMAGE Logo del Markdown](/uploads/images/refonte_doc/Markdown-mark.svg.png)

**Nota: las imágenes deben estar en formato PNG (`.png`), necesario para la exportación a PDF.

- Para insertar un enlace a una imagen, añada dos corchetes `[]` alrededor del marcado de la imagen, seguido de un enlace entre paréntesis. 

```
[![IMAGE Logo del Markdown](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/langfr-130px-Markdown-mark.svg.png)](https://fr.wikipedia.org/wiki/Markdown)
```

Esto da como resultado 

[![IMAGE Logo del Markdown](/uploads/images/refonte_doc/Markdown-mark.svg.png)](https://fr.wikipedia.org/wiki/Markdown)


## Línea

Para crear una línea de separación, utilice tres `***`, `---` o una serie de guiones bajos `_______` en una sola línea. 

Por ejemplo

```
***

---

______________
```

Esto da..: 

***

---

___

## Enlaces

Los enlaces se marcan distinguiendo:

- el enlace, es decir, la palabra o expresión indicada como enlace, con corchetes [] ;
- y el objetivo, la URL de destino, entre paréntesis ().

He aquí [un enlace a una página de Wikipedia](https://fr.wikipedia.org/wiki/Marcello_Vitali-Rosati), y las etiquetas correspondientes:

```
[enlace a una página de Wikipedia](https://fr.wikipedia.org/wiki/Marcello_Vitali-Rosati)
```



También puede utilizar los corchetes `<>` para insertar una URL. 

```
El blog de Marcello Vitali-Rosati es: <https://vitalirosati.com/>
```

Esto da:

El blog de Marcello Vitali-Rosati es: <https://vitalirosati.com/>

## Citas 

- Una cita puede indicarse semánticamente según el siguiente marcado : un corchete de cierre seguido de un espacio al principio del párrafo `> `. También es posible tener más de un párrafo en la cita, solo hay que añadir una línea vacía con un corchete de cierre. He aquí un ejemplo de cita:

> Un enlace de hipertexto o hipervínculo permite hacer clic sobre él para ir a otra parte de la página, a otra página o a otro sitio que el autor estime pertinente. 
> 
> Fuente: [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)

Y aquí está el marcado correspondiente:

```
> Un enlace de hipertexto o hipervínculo permite hacer clic sobre él para ir a otra parte de la página, a otra página o a otro sitio que el autor estime pertinente.
> 
> Fuente : [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)
```

- Una cita puede anidarse dentro de otra cita utilizando dos corchetes.

> Un enlace de hipertexto o hipervínculo permite hacer clic sobre él para ir a otra parte de la página, a otra página o a otro sitio que el autor estime pertinente. 
> 
>> Fuente: [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)

Y aquí está el marcado correspondiente:

```
> Un enlace de hipertexto o hipervínculo permite hacer clic en él para ir a otra parte de la página, a otra página o a otro sitio que el autor estime pertinente.
> 
>> Fuente: [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)
```

- Puedes utilizar sintaxis Markdown dentro de tus citas, como títulos, cursiva, negrita o guiones. 

> Hipervínculo
> Se puede hacer clic sobre un enlace *hipertexto* o __hipervínculo__ para ir a 
> 
> otra parte de la página, 
> otra página u 
> otro sitio que el autor estime pertinente. 
> 
> Fuente: [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)

Y aquí está el marcado  correspondiente:

```
> ### Hiperenlace
> Un enlace *hipertexto* o __hipervínculo__ permite, al hacer clic en él, llegar a 
> 
> otra parte de la página, 
> otra página u 
> otro sitio considerado relevante por el autor. 
> 
> Fuente : [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)
```

## Espacio de no separación 

Los espacios de no separación se representan mediante un punto discreto: `-` o un rectángulo naranja ` `. 

Se pueden añadir con el espacio de no separación ASCII `&nbsp;` o manteniendo pulsada la tecla `Alt` y tecleando `0160` o `255`.

## Tablas

Las tablas se crean utilizando la siguiente sintaxis:

- `|` separa las columnas
- un salto de línea separa las lignas
- la segunda línea define la alineación de la columna:
  - `:--` alinea la columna a la izquierda
  - `:-:` alinea la columna al centro
  - `--:` alinea la columna a la derecha

Por ejemplo, la sintaxis

```markdown
|Nombre|Primer nombre|Fecha de nacimiento|Lugar de nacimiento|Color de ojos|
|:--|:--|:-:|:-:|--:|
|Bianchini|Francesco| 3-1-1920| Scandicci| Azul|
|Dupont|Pierre| 7-9-1989 |Chicoutimi |Verde|
|Gianna|Bienfaisant|9-10-2005|Florence|Marrón|
```

Esto da:

|Nombre|Primer nombre|Fecha de nacimiento|Lugar de nacimiento|Color de ojos|
|:--|:--|:-:|:-:|--:|
|Bianchini|Francesco| 3-1-1920| Scandicci| Azul|
|Dupont|Pierre| 7-9-1989 |Chicoutimi |Verde|
|Gianna|Bienfaisant|9-10-2005|Florence|Marrón|

## Marcado semántico 

El marcado semántico se utiliza para especificar la función de una palabra, expresión o párrafo.

Stylo permite el marcado semántico libre: cada autor puede definir su propia semántica en función de sus necesidades particulares. Esto puede implementarse en las plantillas de exportación u hojas de estilo personalizadas.

La sintaxis Markdown para el marcado semántico es la siguiente: `[término a etiquetar]{.etiqueta}`.

Por ejemplo: `Esta [ruptura]{.concepto} puede considerarse emblemática de...` identifica el término `ruptura` como un `concepto`.

El siguiente texto marcado:

```
He aquí la [tesis fundamental del artículo]{.tesis}.
```

Esto se expresa en HTML:

```html
He aquí la <span class=«tesis»>tesis fundamental del artículo</span>
```

Para marcar un párrafo entero, utilice la siguiente sintaxis:

```
::: {.tesis}

Mi párrafo que contiene una tesis del artículo.

:::
```

Esto se expresa en HTML:

```html
<div class=«tesis»>
  <p>Mi párrafo que contiene una tesis del artículo.</p>
</div>
```

La vista previa Stylo implementa la visualización de las siguientes etiquetas semánticas:

- tesis
- descripción
- ejemplo
- concepto
- definición
- pregunta
- epígrafe
- dedicatoria
- créditos
- fuente

Es posible marcar un elemento de texto con varios atributos. Por ejemplo

```
::: {.infogeo}

[Atenas]{.ciudad id=«https://www.wikidata.org/wiki/Q1524» gps=«37.58.46N, 23.42.58E»} es la capital de Grecia.

:::
```

Esto se expresa en HTML:

```html
<div class=«infogeo»>
<p><span id=«https://www.wikidata.org/wiki/Q1524» class=«ciudad» data-gps=«37.58.46N, 23.42.58E»>Atenas</span> es la capital de Grecia.</p>
</div>
```

También es posible utilizar este marcado semántico para estructurar datos en RDFa. Aquí dos ejemplos:

```
Autor del texto: [John Dewey]{property="dc:creador"}
```

Esto se expresa en HTML:

```html
<p>Autor del texto: <span data-property="dc:creador">John Dewey</span></p>
```

Segundo ejemplo:

```
John Dewey nació el [20 de octubre de 1859].{property="dc:fecha" content="1859-10-20"}.

```

Esto se expresa en HTML:

```html
<p>John Dewey nació el <span property="dc:fecha" content="1859-10-20">20 de octubre de 1859</span></p>
```

## Caracteres de escape

Para mostrar un carácter de escape, que normalmente se utilizaría para el marcado en un artículo escrito en Markdown, solo hay que añadir una barra invertida `\` antes del carácter.

Por ejemplo:

```
\+ Con la adición de la barra invertida, el signo más no se convierte en un elemento de una lista.
```

Esto da:

\+ Con la adición de la barra, el signo positivo no se convierte en un elemento de una lista.

---

Para más información, pueden consultar otras guías sobre la sintaxis de Markdown. Agradecemos cualquier sugerencia que pueda tener para añadir a nuestra documentación. 

1. <span id="note-1">Una nota a pie de página en línea. <a href="#note-1-b">↩</a></span>
2. <span id="note-2">Una nota a pie de página con llamada y referencia cruzada. <a href="#note-2-b">↩</a></span>
