---
title: "Generar un sitio web para tus artículos"
---

Con el generador de sitios web estáticos «Crieur», desarrollado especialmente para Stylo, puedes generar un sitio web para tus artículos y corpus en Stylo. 

En [este vídeo de «escenarios de uso»](/es/escenarios_uso/sitio-Crieur) encontrarás una demostración de cómo utilizar Crieur con Stylo. 

## Comandos de Crieur

Encontrarás toda la gama de comandos posibles con Crieur en [su repositorio](https://gitlab.huma-num.fr/ecrinum/crieur/). Los dos principales son: 

1. `uv run --with crieur crieur stylo <stylo-corpus-id-1> <stylo-corpus-id-2> ...` : para importar fuentes Stylo con UV y Crieur;

2. `uv run --with crieur crieur generate serve --title <‘título del sitio web’>` : para generar su sitio a partir de las fuentes Stylo importadas a su carpeta y verlo en su navegador (tenga en cuenta que debe introducir el título de su sitio en esta fase).

Primero deberá descargar UV, un gestor de paquetes de Python: encontrará [las instrucciones para ello en este enlace](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).

## Personalización

Le Crieur ha sido diseñado para permitir un alto grado de personalización gráfica y organizativa de su sitio web, sin requerir excesivos recursos financieros ni conocimientos técnicos. Esto es especialmente importante para las revistas que tienen su propia identidad, sus propias necesidades particulares y para las que [la estandarización requerida para su distribución en las plataformas suele ser una fuente de frustración](https://revue30.org/en/projects/websites-production-from-stylo/).

Para personalizar su sitio web, añada una carpeta «templates» a la raíz de la carpeta de su proyecto y cargue [una de las plantillas HTML que se encuentran aquí](https://gitlab.huma-num.fr/ecrinum/stylo/crieur-atelier/-/tree/main/templates?ref_type=heads). A continuación, crea una carpeta «statics», también en la raíz de la carpeta del proyecto, y añade [este archivo simple.css](https://gitlab.huma-num.fr/ecrinum/stylo/crieur-atelier/-/blob/main/statics/simple.css?ref_type=heads) en ella. Por último, crea un archivo `custom.css`, en el que podrás definir todos los estilos que desees para tu sitio web.

Para generar el sitio web con sus personalizaciones, deberá añadir estos elementos a su comando, en su terminal:
- `--statics-path=statics`
- `--templates-path=templates`

Esto da el siguiente resultado:
`uv run --with crieur crieur generate serve --statics-path=statics --templates-path=templates --title <«el título de su sitio»>`

A lo que puede añadir otros elementos y parámetros. 

Encontrarás un ejemplo de personalización minimalista [en este repositorio](https://gitlab.huma-num.fr/ecrinum/stylo/crieur-atelier), que da [este resultado](https://crieur-atelier-149600.gitpages.huma-num.fr/).

La plantilla Crieur más actualizada y predeterminada se puede encontrar [aquí](https://gitlab.huma-num.fr/ecrinum/crieur/-/blob/main/crieur/templates/base.html?ref_type=heads). Para utilizarla, deberá añadir líneas en el `head` para llamar a los archivos `statics/simple.css` y `statics/custom.css`. Puede encontrar plantillas más específicas [en el repositorio de Crieur](https://gitlab.huma-num.fr/ecrinum/crieur/-/tree/main/crieur/templates).
