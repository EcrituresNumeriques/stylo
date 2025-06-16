---
title: "Espacios de trabajo"
---

Los espacios de trabajo responden a la necesidad de compartir artículos Stylo entre varios usuarios.
Esta implementación distingue varios espacios dentro de Stylo.
En primer lugar, está el espacio más utilizado, el espacio personal: es donde cada usuario llega por defecto cuando se conecta.

El espacio personal es donde cada uno puede crear y manipular artículos en Stylo.
Es perfectamente posible permanecer únicamente en este espacio y compartir artículos manualmente con otros usuarios a través de la [funcionalidad de compartir](/e/myarticles/#share-an-article).

Sin embargo, si es necesario compartir un documento con varios usuarios, puede que merezca la pena utilizar la funcionalidad del espacio de trabajo.

Los espacios de trabajo no son entidades a las que un usuario pueda asignar un derecho de propiedad sobre un artículo.
Todos los artículos permanecen asociados a los usuarios que los crearon.
El espacio de trabajo sirve simplemente de pasarela para compartir un conjunto de artículos con varios usuarios más.
Debe considerarse como un canal específico para compartir contenidos.

Por ejemplo, se puede crear un espacio de trabajo para una revista y compartir los distintos artículos que se están publicando.
El espacio de trabajo en sí podría llamarse «Revista XX», pero los artículos asociados a él no pertenecerán a este espacio de trabajo.
Cada artículo permanecerá vinculado a la cuenta de usuario que lo creó.

El acceso a los distintos espacios de trabajo se realiza a través del menú desplegable «espacio de trabajo», situado en la barra vertical de la parte superior de la página.

![Menú de acceso a los espacios de trabajo](/uploads/images/refonte_doc/ES/MenuWorkspace_ES.png)

A continuación, haga clic en [Todos los espacios de trabajo] para acceder al gestor de espacios de trabajo.

## Gestione sus espacios de trabajo

El gestor de espacios de trabajo tiene tres funciones:

- la creación de un espacio de trabajo haciendo clic en el botón correspondiente \[Crear un espacio de trabajo]. Se abre un formulario con tres campos: el nombre, la descripción y la elección del color.
- la posibilidad de abandonar un espacio de trabajo. Para ello, haga clic en el botón \[Salir del espacio de trabajo]. (_Nota : Al hacer clic en este botón, si los astros lo desean, podrá vivir una aventura sin precedentes, hasta ahora desconocida para la memoria humana..._)
- administrar los miembros de un espacio de trabajo desde el formulario \[Administrar miembros] visible en la información de cada uno de los espacios de trabajo creados.

**No existen roles de administrador en los espacios de trabajo. Todos los miembros, incluido el creador del espacio de trabajo, tienen el mismo nivel de derechos. Cada miembro es responsable de gestionar la información y las dinámicas de colaboración.*

</alert-block>

{% figure "/uploads/gif/espace-de-travail.gif", "Crear un espacio de trabajo" %}

{% figure "/uploads/gif/ajout-utilisateur-workspace.gif", "Añadir un usuario Stylo al espacio de trabajo" %}

## Visualizar un espacio de trabajo

Unn espacio de trabajo es una configuración que permite mostrar en la interfaz Stylo únicamente los documentos relacionados.
Se muestran en lugar de los artículos personales.

Para visualizar los elementos de un espacio de trabajo, basta con hacer clic en el espacio de trabajo deseado en el menú desplegable correspondiente

Los artículos compartidos en el espacio de trabajo aparecen en el lugar de los artículos personales.
Se puede acceder a ellos con las mismas funciones que en un espacio de trabajo personal.

La función [corpus](/es/corpus) también está disponible en los espacios de trabajo.
Se distingue entre corpus personales y corpus vinculados a espacios de trabajo.

## Borrar un espacio de trabajo

No existe ningún botón para borrar un espacio de trabajo.
Esto se hace automáticamente cuando el último miembro de un espacio de trabajo hace clic en el botón \[Salir del espacio de trabajo\] en el gestor de espacios de trabajo.

Si el último miembro de un espacio de trabajo desea abandonarlo, se abre una ventana emergente pidiendo confirmación de esta acción.

Sólo la instancia de compartición entre miembros se elimina cuando el último miembro ha abandonado el espacio.
Dado que los artículos permanecen asociados a su creador, siguen estando disponibles en el espacio personal del propietario.
