---
title: "Generate a website for your articles"
---

With the static website generator "Crieur", specially developed for Stylo, you can generate a website for your articles and corpora on Stylo. 

A demonstration on how to take in charge le Crieur with Stylo can be found in [this video in "scenarios"](/en/scenarios/website-Crieur). 

## Crieur commands

You'll find the full range of possible commands with Crieur on [its repo](https://gitlab.huma-num.fr/ecrinum/crieur/). The two main ones are : 

1. `uv run --with crieur crieur stylo <stylo-corpus-id-1> <stylo-corpus-id-2> ...` : to import Stylo sources with UV and Crieur;

2. `uv run --with crieur crieur generate serve --title <‘website title’>` : to generate your site from the Stylo sources imported into your folder, and view it in your browser (note that you need to enter your site title at this stage).

You'll first need to download UV, a Python package manager: you'll find [instructions for this at this link](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).

## Customization

Le Crieur has been designed to allow a high degree of graphic and organizational customization of your site, without requiring excessive financial resources and technical skills. This is particularly important for journals that have their own identity, their own particular needs, and for which [the standardization required for distribution on platforms is often a source of frustration](https://revue30.org/en/projects/websites-production-from-stylo/).

To personalize your website, add a `templates` folder to the root of your project folder, and upload [one of the HTML templates here](https://gitlab.huma-num.fr/ecrinum/stylo/crieur-atelier/-/tree/main/templates?ref_type=heads). Then create a `statics` folder, still at the root of your project folder, and add [this simple.css file](https://gitlab.huma-num.fr/ecrinum/stylo/crieur-atelier/-/blob/main/statics/simple.css?ref_type=heads) in it. Finally, create a `custom.css` file, in which you can define all the styles you want for your website. 

To generate the website with your customizations, you'll need to add these elements to your command, on your terminal:
- `--statics-path=statics`
- `--templates-path=templates`

This gives the following:
`uv run --with crieur crieur generate serve --statics-path=statics --templates-path=templates --title <"the title of your site">`

To which you can add other elements and parameters. 

You will find an example of minimalist customization [on this repo](https://gitlab.huma-num.fr/ecrinum/stylo/crieur-atelier), which gives [this rendering](https://crieur-atelier-149600.gitpages.huma-num.fr/).

The most up-to-date and default Crieur template can be found [here](https://gitlab.huma-num.fr/ecrinum/crieur/-/blob/main/crieur/templates/base.html?ref_type=heads). To use it, you'll need to add lines in the `head` to call the `statics/simple.css` and `statics/custom.css` files. More specific templates can be found [in the Crieur repo](https://gitlab.huma-num.fr/ecrinum/crieur/-/tree/main/crieur/templates).
