---
title: "Escribir metadatos en YAML"
---

## Introducción a YAML

YAML Ain't Markup Language es un lenguaje muy popular para serializar (y almacenar) datos.
Este formato _texto plano_ se utiliza a menudo para describir metadatos de documentos o para crear archivos de configuración.

La sintaxis de YAML es muy ligera, lo que constituye uno de los puntos fuertes de este formato, a diferencia de otros como JSON, que pueden ser más prolijos.

Esta sintaxis puede encontrarse en un documento que sólo contenga YAML (con la extensión `.yaml`), pero también en otros formatos, como Markdown. Para añadir YAML a un artículo Stylo, solo hay que añadir separadores en forma de tres guiones `---` en las líneas anterior y posterior a los datos. Esta sintaxis marca y delimita los datos YAML en un documento, permitiendo a los analizadores comprender de qué lenguaje se trata. También puede añadir metadatos en YAML, en el panel derecho «Metadatos», haciendo clic en el botón para activar el modo YAML.

**Nota**: Sus metadatos se añaden automáticamente en YAML sin procesar si los escribe en el panel de metadatos.

He aquí un ejemplo de entrada YAML:

```yaml
---
título: "Título de mi artículo"
autor: "Mi nombre"
fecha: "AAAA-MM-DD"
---
```

La descripción de datos en YAML se basa en el principio \[clave: valor\].

Del mismo modo que en una entrada de diccionario, primero se indica la clave, por ejemplo `title`, a la que se asigna un valor `«Título de mi artículo»`.

Una de las particularidades de YAML, que también contribuye a hacerlo atractivo, es que no existen claves impuestas en la elección de asociar una clave a un valor. En otras palabras, corresponde al autor elegir las claves que desea utilizar para describir los distintos datos que se van a serializar.

Por ejemplo, el autor de un documento puede describirse creando una clave `author` o `autor`, o cualquier otra que se le ocurra.

Por ejemplo 

```yaml
autor: "Mi nombre"
```
es exactamente igual que :

```yaml
autora: "Mi nombre"
```

Hasta ahora, no hemos jerarquizado los datos mostrados como ejemplo.
Siguen estando todos en el mismo nivel de estructuración, es decir, «planos».
YAML también permite añadir niveles de profundidad a la descripción de los datos.

Si retomamos el ejemplo del autor, simplemente hemos asignado una cadena de caracteres a la clave «autor».
Ahora nos gustaría describir formalmente el nombre y apellidos del autor.

```yaml
autor:
    - apellido: "Delannay"
      nombre: "Roch"
```

Siguiendo este principio, podemos declarar varios autores para un mismo documento.
El punto importante de esta sintaxis es comprobar las sangrías entre la información, ya que definen los niveles de profundidad y la jerarquía entre las diferentes claves. 

```yaml
autores: 
    - apellido: "Delannay"
      nombre: "Roch"
    - apellido: "Germain"
      nombre: "Camille"
```

La información declarada en los documentos YAML no es necesariamente texto (en el sentido de cadena de caracteres).
Como en la mayoría de los lenguajes de programación, existen varios tipos de datos que pueden describirse y manipularse: 

- cadenas de caracteres, encapsuladas entre `«»`;
- números enteros, por ejemplo `6`;
- Booleanos: `true` o `false`;
- decimales: `6.2`.

Las buenas prácticas de escritura en YAML recomiendan especificar las cadenas de caracteres con `«»` aunque el software pueda reconocerlas sin estos símbolos para evitar cualquier conflicto con otros tipos de datos: `«6»` y `6` son diferentes.

Estos distintos tipos de datos no son los únicos objetos que pueden asignarse a una clave YAML.
El formato YAML también admite objetos más complejos: arreglos, listas y diccionarios.

Ya hemos visto listas en el ejemplo anterior.
Se basan en la sangría y el uso de guiones `-` para anunciar una nueva entrada en la lista.

Los arrays se delimitan con corchetes `[]`, y los elementos que contienen se separan con comas `,`.

```yaml
nombres: ["Roch", "Camille", "Victor"]
números: [1, 4, 8, 3, 55]
```

Por último, los diccionarios YAML tienen la misma forma que los diccionarios del lenguaje de programación Python.
Están delimitados por corchetes `{}` y los elementos que contienen están separados por comas `,`.
Los objetos descritos en un diccionario se basan en el mismo principio `key:value` que hemos descrito anteriormente.

Así, un diccionario en YAML tiene la siguiente forma: 

```yaml
miDiccionario: {clave1: "valor1", clave2: "valor2", clave3: "valor3", clave4: "valor4"}
```

Estos objetos más complejos pueden contener todos los tipos de datos que hemos mencionado: enteros, cadenas, booleanos y decimales.

He aquí algunos ejemplos de entradas YAML (esta era la estructura utilizada para los metadatos en Stylo antes de la nueva versión):

```yaml
---
bibliography: ''
title: ''
title_f: ''
surtitle: ''
subtitle: ''
subtitle_f: ''
year: ''
month: ''
day: ''
date: ''
url_article_sp: ''
publisher: ''
prod: ''
funder_name: ''
funder_id: ''
prodnum: ''
diffnum: ''
rights: >-
  Creative Commons Attribution-ShareAlike 4.0 International (CC
  BY-SA 4.0)
issnnum: ''
journal: ''
journalsubtitle: ''
journalid: ''
director:
  - forname: ''
    surname: ''
    gender: ''
    orcid: ''
    viaf: ''
    foaf: ''
    isni: ''
abstract: []
translatedTitle: []
authors: []
dossier:
  - title_f: ''
    id: ''
redacteurDossier: []
typeArticle: []
translator:
  - forname: ''
    surname: ''
lang: fr
orig_lang: ''
translations:
  - lang: ''
    titre: ''
    url: ''
articleslies:
  - url: ''
    titre: ''
    auteur: ''
reviewers: []
keyword_fr_f: ''
keyword_en_f: ''
keyword_fr: ''
keyword_en: ''
controlledKeywords: []
link-citations: true
nocite: '@*'
issueid: ''
ordseq: ''
---
```

## Metadatos en Stylo

Los datos ya están estructurados en Stylo y se muestran en el panel derecho. Todos los metadatos asociados a su artículo serán procesados en YAML por Stylo. Como usuario y según tus necesidades, puedes modificar la estructura de metadatos predefinida utilizando la pestaña 'modo raw'.

He aquí la estructura de un artículo Stylo para el que no se han introducido metadatos:

```yaml 
---
'@version': '1.0'
production:
  entities: []
senspublic:
  categories: []
type: article
---
```

---

Para más información sobre la sintaxis de YAML, consulte otras guías de usuario. Agradecemos cualquier sugerencia que pueda tener para añadir a nuestra documentación. 
