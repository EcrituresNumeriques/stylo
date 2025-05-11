---
title: "Utilizar la API GraphQL"
---

## API GraphQL de Stylo - Introducción

Stylo incluye una API GraphQL que los usuarios pueden leer y escribir.

La API proporciona acceso a los datos de Stylo utilizando el lenguaje de consulta GraphQL.
Desde el *endpoint* https://stylo.huma-num.fr/graphql, es posible conectar Stylo a toda una serie de funcionalidades personalizadas.
Por ejemplo, la API te permite recuperar tus artículos e integrarlos en tu generador de sitios estáticos favorito.

GraphQL son las siglas de **Graph Query Language**. Es un lenguaje de consulta y un entorno de ejecución para interfaces de programación de aplicaciones (API). Fue creado por primera vez por Facebook en 2012 y publicado en código abierto en 2015. Solo obtienes los datos que necesitas de tus consultas y tú defines su estructura.

### ¿Por qué utilizar GraphQL?

- Este entorno es muy fácil de usar ;
- Te permite ver y manipular tus datos en Stylo ;
- Obtienes exactamente lo que pides y nada más ;
- Puedes tener varios tipos de datos en una sola petición ;
- Es rápido ;
- No necesitas conocimientos de programación ;
- Las peticiones disponibles están listadas en la documentación.

### Antes de empezar

1. Instalar un cliente GraphQL 

Puedes elegir tu cliente preferido, ya sea GraphQL Playground, Altair u otro. La siguiente demostración utiliza el cliente GraphQL Playground.

2. Introducir la URL

Una vez instalada la extensión o el entorno, asegúrate de introducir la URL en el campo indicado anteriormente, es decir, https://stylo.huma-num.fr/graphql. Este es el punto final de la API.

3. Clave API

También tienes que introducir tu clave API. En la aplicación Stylo, clic en tu nombre, se abrirá el menú desplegable y, a continuación, clic en tu dirección de correo electrónico. Esto te llevará a la información de tu cuenta. Aquí es donde encontrarás tu clave. Cópiala. De vuelta en GraphQL, abajo a la izquierda está la pestaña «HTTP HEADERS». Introduce la clave de la siguiente manera: 

```graphql
{
"Authorization": "TU CLAVE API" 
}
```

Asegúrese de que está en la pestaña "HTTP HEADERS".

Introducción a GraphQL](https://upload.wikimedia.org/wikipedia/commons/2/22/Capture_d%E2%80%99%C3%A9cran_2024-01-23_181249.png)

¡Ya estás listo para introducir tu primera petición!

## Comenzando

En esta introducción a la API GraphQL de Stylo, veremos cómo utilizar las consultas y las mutaciones. Las consultas te permiten visualizar los datos disponibles en Stylo y las mutaciones te permiten manipular, crear o eliminar datos.

### Consultas

Todo lo que tienes que hacer es solicitar una consulta. Esta es la primera palabra de su petición. 
A continuación, hay que especificar el tipo de consulta. En el primer ejemplo, pedimos una lista de todos los elementos contenidos en Stylo. Entre corchetes, especificamos qué otra información nos gustaría obtener. En este caso, queremos saber quién es el usuario asociado, el título del artículo y su identificador. 

Por supuesto, puedes solicitar otra información. Las posibilidades son inmensas, y van de la mano con tus necesidades. 
No olvide cerrar los corchetes después de abrir cada uno. Cuando estés listo, pulsa el botón ejecutar. 

```graphql
Ejemplo 1 :
query allMyArticles {
    user {
     _id
     email
     
     articles {
      _id
      title
      }
   }
}
```

En el ejemplo 2, necesitas introducir el identificador de uno de los elementos de la lista anterior. Guárdalo, ya que también lo necesitarás para el último ejemplo. Una vez que hayas introducido la consulta, deberías ver el título de tu artículo, así como la persona a la que pertenece.

```graphql 
Ejemplo 2 :
query articles {
    article(article: "ID ARTÍCULO"){
    title
       owner {
    displayName
    username
    email
    }
}
}
```

Para este tercero ejemplo, una vez más necesitas introducir el identificador de tu artículo en el espacio apropiado. Esta vez GraphQL te mostrará el título de tu artículo, quienes contribuyeron a él, ¡y también el Markdown, Yaml y BibTex que contiene! 

```graphql
Ejemplo 3 :
query {
    article(article: "ID ARTÍCULO"){
    title
    contributors{user{displayName}}
    workingVersion{md yaml bib}
    }
}
```

Un último ejemplo para el camino, que puede ser útil en el contexto de los datos de Stylo y su organización por "corpus": una consulta para obtener los nombres de todos los artículos de un corpus, con sus ids y las últimas versiones de su contenido. Puede obtener el ID de un corpus en su URL de "vista previa", en la aplicación Stylo.

```graphql
Ejemplo 4 :
query articlesCorpus {
 corpus(filter:{corpusId: " ID DEL CORPUS"}){
 articles{
 article{
 title
 _id
 workingVersion{md}
      }
    }
  }
  }
```

Habrás notado que la aplicación te da opciones de autocompletar cuando escribes. Esto te da ejemplos de lo que puedes pedir después. 

También encontrarás una lista completa en la pestaña de la izquierda de la pantalla 'Esquema', o en algunas versiones 'Doc'. Si hagas clic en ella, se abre la pestaña. 
La pestaña de documentación de la API es una característica muy interesante de GraphQL Playground. Permite previsualizar todas las consultas y mutaciones posibles, así como sus detalles, en un único campo de un esquema dado.

![Schema](https://upload.wikimedia.org/wikipedia/commons/c/c6/Capture_d%E2%80%99%C3%A9cran_2024-01-23_184801.png)

Puede encontrar el esquema GraphQL completo para Stylo [en este fichero JavaScript]](https://github.com/EcrituresNumeriques/stylo/blob/master/graphql/schema.js)

### Mutaciones

Además de las consultas, también puede ejecutar mutaciones via GraphQL. 
¿Qué son las mutaciones? Las mutaciones son otra forma de petición. Sin embargo, todas las operaciones que provocan "escrituras" deben enviarse explícitamente a través de una mutación. En términos sencillos, mientras que las consultas permiten ver los datos, las mutaciones se utilizan para crear, modificar o eliminar datos o contenidos. 

Veamos la lista en la pestaña «Esquema»: ![Mutaciones](https://upload.wikimedia.org/wikipedia/commons/4/48/Capture_d%E2%80%99%C3%A9cran_2024-01-23_191722.png)

Puedes crear artículos, compartir tus artículos, duplicarlos y mucho más. La lista es larga.

Veamos un ejemplo de mutación: 

```graphql
mutation{createArticle(title:"TÍTULO DEL ARTÍCULO",
    user:"TU ID")
    {title _id}}
```

En este ejemplo, estamos pidiendo a la API que cree un artículo para nosotros. Para hacer esto, introduzca su número de identificación, que encontrará en la información de su cuenta de Stylo o que puede solicitar en GraphQL Playground. A continuación, introduzca el título que desee en el espacio correspondiente. Una vez iniciada la mutación, vuelve a la página 'Artículos' de Stylo y verás tu nuevo artículo con el título elegido. 

## Para terminar

GraphQL Playground es como un *sandbox*, es decir, un entorno de desarrollo integrado (IDE) donde es posible crear scripts, sea cual sea el lenguaje utilizado. ¡Estos scripts incorporan consultas GraphQL para automatizar ciertas tareas: por ejemplo, podríamos imaginar una copia de seguridad local de los datos de Stylo!

Como puede verse, la API GraphQL de Stylo es sencilla de utilizar. Todo lo que tienes que hacer es introducir el nombre de los datos que quieres o las mutaciones que deseas y la aplicación te los proporcionará/realizará. Este es el final de la formación, ¡así que todo lo que tienes que hacer es probar diferentes consultas y mutaciones por ti mismo!idad local de los datos de Stylo!

Como puede verse, la API GraphQL de Stylo es sencilla de utilizar. Todo lo que tienes que hacer es introducir el nombre de los datos que quieres o las mutaciones que deseas y la aplicación te los proporcionará. Este es el final de la formación, ¡así que todo lo que tienes que hacer es probar diferentes consultas y mutaciones por ti mismo!

Más formación avanzada en breve...
