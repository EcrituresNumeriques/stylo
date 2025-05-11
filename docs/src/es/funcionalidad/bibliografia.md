---
title: "Gestione sus referencias bibliográficas"
---

La función de bibliografía enumera las referencias bibliográficas que ha añadido a su artículo. Para añadir sus referencias, haga clic en *Bibliografía* en el panel «menú» de la derecha. Se abrirá entonces la herramienta *Administrador de bibliografía*, que le ofrece varias opciones.

## Zotero

Puede sincronizar una bibliografía (una colección o subcolección) conectando su cuenta Zotero a Stylo (grupos/colecciones privadas o públicas). Esto es lo que recomendamos. 

También es posible importar tu bibliografía desde una colección Zotero a través de una URL.
Esta URL puede ser un usuario, un grupo o una colección privada o pública.

![Bibliografía-Zotero](/uploads/images/refonte_doc/ES/biblio-zotero_ES.png)

A continuación se explica cómo sincronizar una colección en su cuenta Zotero:

Desde el Gestor de Referencias Bibliográficas, conecte su cuenta Zotero mediante la opción «Conectar mi cuenta Zotero». Se abrirá un cuadro de diálogo «Nueva clave privada» que le pedirá que valide la conexión entre Stylo y Zotero.

Activando la lista desplegable, ahora puedes elegir una colección (o subcolección) de tu cuenta Zotero, cuya URL aparecerá en el campo «importar desde URL».
Una vez que haya seleccionado una colección, deberá confirmar su elección haciendo clic en «Reemplazar la bibliografía actual por esta colección».

**Tenga en cuenta**: *No puede importar más de una colección a la vez. Además, cada sincronización o importación sobrescribirá sus datos bibliográficos. Si utiliza la opción de sincronización, le recomendamos que modifique sus referencias en Zotero y las importe de nuevo (no hay sincronización automática), y así sucesivamente hasta obtener el resultado esperado.

## BibTeX sin procesar 

Puede introducir su bibliografía manualmente en formato BibTeX. Sus entradas serán validadas.

![Bibliografía-BibTeX](/uploads/images/refonte_doc/ANG/biblio-bibtex_ANG.png)

Puede corregir el BibTeX directamente. 

Puede directamente [estructurar sus referencias en BibTeX](http://www.andy-roberts.net/writing/latex/bibliographies) o exportar sus referencias en BibTeX utilizando su herramienta de gestión de bibliografía:

- Ver las siguientes herramientas: [Zotero](https://bib.umontreal.ca/en/citer/logiciels-bibliographiques/zotero/installer) y [Mendeley](https://libguides.usask.ca/c.php?g=218034&p=1446316)

*Le sugerimos que consulte la sección sobre BibTeX en "tutoriales" para más información*.

## Incluir referencias en su artículo

La inserción de referencias bibliográficas en un texto Markdown debe seguir una sintaxis precisa si se desea que sea dinámica.
La ventaja de integrar referencias bibliográficas en formato BibTeX reside en la posibilidad de generar bibliografías dinámicas y gestionar diversos parámetros para obtener los resultados deseados.

En esta configuración, se requiere una sintaxis especial para indicar una referencia en el texto, conocida como clave de citación, que adopta la siguiente forma: `[@clave-de-citación]`.
Una clave de citación se encierra entre corchetes `[ ]` y se llama con el símbolo `@`.

Estas claves son las que se transformarán cuando se exporten de acuerdo con las normas deseadas.

Existen varios métodos para escribir estas claves de citación rápidamente en Stylo :

- Se ha implementado una función de autocompletado en el editor de texto. Sólo tiene que empezar a escribir `[@` o simplemente `@` y el editor de texto le sugerirá todas las referencias asociadas al artículo. Si quieres refinar el autocompletado, simplemente añade la primera letra del nombre del autor para reducir el número de sugerencias: `[@b`.

{% figure «/uploads/gif/add-reference-bib.gif», «Añadir una referencia bibliográfica» %}

- También puedes hacer clic en el icono asociado a la referencia en el panel izquierdo y, a continuación, pegarla (Ctrl+V) en el texto donde la quieras. Aparecerá entonces como `[@shirky_here_2008]`. Para que quede claro, con un solo clic «copiará» la clave BibTeX de la referencia en el portapapeles. 

![Ejemplo de bibliografía](/uploads/images/refonte_doc/ANG/biblio-exemple_ANG.png)

Insertar una clave BibTeX en el cuerpo del texto tiene dos efectos:

1. La clave se sustituye automáticamente por la cita en el formato correcto en el cuerpo del texto, por ejemplo: (Shirky 2008);
2. La referencia bibliográfica completa se añade automáticamente al final del documento (previsualizado o exportado).

## Uso general

La sintaxis Markdown puede utilizarse para estructurar tus referencias bibliográficas con todo detalle. En función de tus necesidades, aquí tienes las distintas formas de producir la llamada a la cita :
- `[@shirky_aquí_2008]` producirá: (Shirky 2008)
- @[@shirky_here_2008, p194]` producirá: (Shirky 2008, p194)
- `@shirky_here_2008` producirá: Shirky (2008)
- `[-@shirky_aquí_2008]` producirá: (2008)

Por ejemplo:

- Si desea citar al autor, el año y la página entre paréntesis :

|En el editor | En la vista previa|
|:--|:--|
|`El espacio real, el espacio de nuestra vida material, y el ciberespacio (que ciertamente no es completamente virtual) no deben considerarse por separado, ya que cada vez están más entrelazados[@shirky_here_2008, p. 194].` | `El espacio real, el espacio de nuestra vida material, y el ciberespacio (que ciertamente no es completamente virtual) no deben considerarse por separado, ya que cada vez están más entrelazados(Shirky 2008, 194).`|

- Si ya aparece el nombre del autor y sólo desea añadir entre paréntesis el año de publicación :

|En el editor | En la vista previa|
|:--|:--|
|`Clay @shirky_here_2008[p. 194] ha sugerido que el espacio real, el espacio de nuestras vidas materiales, y el ciberespacio (que ciertamente no es completamente virtual) no deberían denominarse por separado, ya que cada vez están más entrelazados.` | `Clay (Shirky, 2008, 194) ha sugerido que el espacio real, el espacio de nuestras vidas materiales, y el ciberespacio (que ciertamente no es completamente virtual) no deberían denominarse por separado, ya que cada vez están más entrelazados.`|

- Para no repetir un nombre e indicar sólo el año, inserte una `-` delante de la clave.

|En el editor | En la vista previa|
|:--|:--|
|`Los artistas conceptuales habían intentado (al parecer sin mucho éxito ni convicción, si hemos de creer a Lucy Lippard [-@lippard_six_1973 ; -@lippard_get_1984])`<br/>`burlar las reglas del mercado del arte.` | `Los artistas conceptuales habían intentado (al parecer sin mucho éxito ni convicción, si hemos de creer a Lucy Lippard (1973 ; 1984))`<br/>`burlar las reglas del mercado del arte.`|

**Advertencia:** no utilices sintaxis Markdown para acompañar una cita. Por ejemplo, nunca debes usar marcas como esta: `[@shirky_here_2008, [enlace a una página web](https://sens-public.org)]`.

## Casos especiales

- Mayúsculas para los títulos en inglés

Los estilos bibliográficos en inglés exigen a menudo el uso de mayúsculas en cada palabra del título de la referencia. Stylo (y la herramienta de conversión que utiliza, Pandoc) aplicará el estilo correcto a los títulos siempre que las referencias declaren el idioma utilizado. 

El idioma del documento Stylo determina el idioma de estilo bibliográfico por defecto para todas las referencias, excepto para las referencias bibliográficas que contengan otros datos de idioma. Por ejemplo, si el idioma declarado en los metadatos del documento es `fr`, las referencias se tratarán como tales. Si, entre estas referencias, una se declara como `en`, se aplicará la mayúscula del título.

**Nota:** el formato Bibtex incluye varias propiedades de idioma: `language`, `langid`. Stylo (y Pandoc) sólo tienen en cuenta la propiedad `langid`, mientras que la interfaz de Zotero sólo permite introducir la propiedad `language`. Por lo tanto, tendrás que añadir la propiedad `langid: en` manualmente. Hay dos maneras de hacerlo: 

1. Ya sea en Zotero, utilice [la sección Extra](https://www.zotero.org/support/kb/item_types_and_fields#citing_fields_from_extra) que le permite introducir pares adicionales `propiedad: valor`, por ejemplo en nuestro caso: `langid: en`. Tras la sincronización Zotero/Stylo, la propiedad se tendrá en cuenta en Stylo.
2. En Stylo, abra la pestaña [Bibtex raw] en el gestor de bibliografía, y añada el par `langid: en` a la referencia en cuestión.   

```bibtex
@book{coleman_coding_2013,
	address = {Princeton},
	title = {Libertad de codificación: la ética y la estética de la piratería},
	isbn = {978-0-691-14460-3},
	shorttitle = {Libertad de codificación},
	language = {es},
	langid = {es},
	publisher = {Princeton University Press},
	author = {Coleman, E. Gabriella},
	año = {2013},
}
```

- Para más información: [documentación Pandoc | Mayúsculas en títulos](https://pandoc.org/MANUAL.html#capitalization-in-titles)

---

Aquí hay algunos otros recursos para lectura adicional:

- Qué es Zotero](http://editorialisation.org/ediwiki/index.php?title=Zotero)
- Cómo instalar y utilizar Zotero](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer)
- Cómo importar rápidamente una bibliografía a Zotero](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer#h5o-13)
