---
title: "Generar un sitio web para tus artículos"
---

Con el generador de sitios estáticos Le Crieur, desarrollado especialmente para los artículos Stylo, puedes generar un sitio web para tus artículos. 

La información principal sobre Le Crieur y cómo utilizarlo se encuentra en [este vídeo en «Escenarios de uso»](/es/escenarios_uso/sitio_Crieur). 

## Comandos de Le Crieur

Encontrará todos los comandos posibles en [el repositorio de Le Crieur](https://gitlab.huma-num.fr/ecrinum/crieur/). Los dos principales son: 

1. `uv run --with crieur crieur stylo <stylo-corpus-id-1> <stylo-corpus-id-2> …`

Para importar fuentes de Stylo con UV y Crieur;

2. `uv run --with crieur crieur generate serve --title <“título del sitio”>`

Para generar su sitio a partir de las fuentes Stylo importadas a su carpeta y visualizarlo en su navegador (tenga en cuenta que debe indicar el título de su sitio en este paso).

Primero deberá descargar UV, como gestor de paquetes en Python: encontrará [las instrucciones para ello en este enlace](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).

## Personalización

Para personalizar su sitio web, puede editar los estilos en public/statics/custom.css y modificar las plantillas en public/templates/base.html. Encontrarás una plantilla para ello en [este repositorio de la revista Troubles](https://gitlab.huma-num.fr/ecrinum/crieur-troubles) (para consultarla, deberás tener acceso a Gitlab de HumaNum con tu cuenta). 

Para una modificación más avanzada de las plantillas, debe consultar [las plantillas de Crieur](https://gitlab.huma-num.fr/ecrinum/crieur/-/tree/main/crieur/templates) y copiar y pegar el contenido, conservando el nombre original, y luego reiniciar el sitio con el comando `uv run --with crieur crieur build`.
