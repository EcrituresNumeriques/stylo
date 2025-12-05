---
title: "Generar un sitio web para tus artículos"
---

Con el generador de sitios web estáticos [«Crieur»](https://ecrinum.gitpages.huma-num.fr/crieur/), desarrollado especialmente para Stylo, puedes generar un sitio web para tus artículos y corpus en Stylo. Permite publicar diarios, crear un blog con la ventaja de permanecer dentro del ecosistema Stylo y utilizar un formato Markdown, ligero y abierto.

En [este vídeo](/es/videos/sitio-Crieur) encontrarás una demostración de cómo utilizar Crieur con Stylo, y una guía escrita "paso a paso" en [esta página de la documentación de Crieur](https://ecrinum.gitpages.huma-num.fr/crieur/numero/utilisation/article/le-crieur-pas-a-pas/). 

## Comandos de Crieur

Encontrarás toda la gama de comandos posibles con Crieur en [su repositorio](https://gitlab.huma-num.fr/ecrinum/crieur/). Los dos principales son: 

1. `uv run --with crieur crieur stylo <stylo-corpus-id-1> <stylo-corpus-id-2> ...` : para importar fuentes Stylo con UV y Crieur;

2. `uv run --with crieur crieur generate serve --title <‘título del sitio web’>` : para generar su sitio a partir de las fuentes Stylo importadas a su carpeta y verlo en su navegador (tenga en cuenta que debe introducir el título de su sitio en esta fase).

Primero deberá descargar UV, un gestor de paquetes de Python: encontrará [las instrucciones para ello en este enlace](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).

## Personalización

Le Crieur ha sido diseñado para permitir un alto grado de personalización gráfica y organizativa de su sitio web, sin requerir excesivos recursos financieros ni conocimientos técnicos. Esto es especialmente importante para las revistas que tienen su propia identidad, sus propias necesidades particulares y para las que [la estandarización requerida para su distribución en las plataformas suele ser una fuente de frustración](https://revue30.org/en/projects/websites-production-from-stylo/).

Para personalizar su sitio, puede encontrar instrucciones en [esta página de la documentación de Crieur](https://ecrinum.gitpages.huma-num.fr/crieur/numero/utilisation/article/configuration-avancee/).

## Implementando su proyecto en la web

Puedes publicar tu proyecto generado con Le Crieur mediante una instancia de Git, como el repositorio GitLab de Huma-Num. Puedes subir tu proyecto allí y usar el archivo [.gitlab-ci.yml](https://gitlab.huma-num.fr/ecrinum/crieur/-/blob/main/.gitlab-ci.yml) del repositorio de Le Crieur como guía. Por supuesto, deberás adaptar los identificadores del corpus y el título del sitio.

Encontrarás documentación y configuraciones más avanzadas sobre el despliegue de tu proyecto en línea y sus ajustes en [esta sección de la documentación de Le Crieur](https://ecrinum.gitpages.huma-num.fr/crieur/numero/deploiement/).
