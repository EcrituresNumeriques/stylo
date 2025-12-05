---
title: "Generate a website for your articles"
---

With the static website generator ["Crieur"](https://ecrinum.gitpages.huma-num.fr/crieur/), specially developed for Stylo, you can generate a website for your articles and corpora on Stylo. It allows you to publish a journal website or create a blog with the advantage of using Stylo as a semantic and collaborative CMS for it and, in the process, of staying with lightweight and open formats Markdown and YAML. 

A demonstration on how to take in charge le Crieur with Stylo can be found in [this video](/en/videos/website-Crieur), and a written "step-by-step" guide on [this page of the Crieur documentation](https://ecrinum.gitpages.huma-num.fr/crieur/numero/utilisation/article/le-crieur-pas-a-pas/). 

## Crieur commands

You'll find the full range of possible commands with Crieur on [its repo](https://gitlab.huma-num.fr/ecrinum/crieur/). The two main ones are : 

1. `uv run --with crieur crieur stylo <stylo-corpus-id-1> <stylo-corpus-id-2> ...` : to import Stylo sources with UV and Crieur;

2. `uv run --with crieur crieur generate serve --title <‘website title’>` : to generate your site from the Stylo sources imported into your folder, and view it in your browser (note that you need to enter your site title at this stage).

You'll first need to download UV, a Python package manager: you'll find [instructions for this at this link](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).

## Customization

Le Crieur has been designed to allow a high degree of graphic and organizational customization of your site, without requiring excessive financial resources and technical skills. This is particularly important for journals that have their own identity, their own particular needs, and for which [the standardization required for distribution on platforms is often a source of frustration](https://revue30.org/en/projects/websites-production-from-stylo/).

To personalize your website, you can find instructions on [this page of Le Crieur's documentation](https://ecrinum.gitpages.huma-num.fr/crieur/numero/utilisation/article/configuration-avancee/).

## Deployment of your project online

Publishing your project generated with Le Crieur can be done using a Git instance such as Huma-Num's GitLab. You can upload your project there and use the [.gitlab-ci.yml file](https://gitlab.huma-num.fr/ecrinum/crieur/-/blob/main/.gitlab-ci.yml) from Le Crieur's repository as a guide. You will, of course, need to adapt the corpus identifiers and the site title.

You will find more advanced documentation and configurations regarding the deployment of your online project and its settings in [this section of Le Crieur's documentation](https://ecrinum.gitpages.huma-num.fr/crieur/numero/deploiement/).
