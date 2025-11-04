---
title: "Generate a website for your articles"
---

With the static website generator "Crieur", specially developed for Stylo articles, you can generate a website for your articles. 

The main information on le Crieur and how to use it can be found in [this video in "Usage scenarios"](/en/scenarios/website-Crieur). 

## Crieur commands

You'll find the full range of possible commands on [the Crieur repo](https://gitlab.huma-num.fr/ecrinum/crieur/). The two main ones are : 

1. `uv run --with crieur crieur stylo <stylo-corpus-id-1> <stylo-corpus-id-2> ...`

To import Stylo sources with UV and Crieur;

2. `uv run --with crieur crieur generate serve --title <‘website title’>`

To generate your site from the Stylo sources imported into your folder, and view it in your browser (note that you need to enter your site title at this stage).

You'll first need to download UV, a Python package manager: you'll find [instructions for this at this link](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).

## Customization

To personalize your site, you can edit the styles in public/statics/custom.css and modify the templates in public/templates/base.html. You'll find a template for this on [this Troubles magazine repository](https://gitlab.huma-num.fr/ecrinum/crieur-troubles) (to consult it, you'll need access to HumaNum's Gitlab with your account). 

For more advanced template modification, go to [Crieur templates](https://gitlab.huma-num.fr/ecrinum/crieur/-/tree/main/crieur/templates) and copy and paste the content, keeping the original name, then relaunch the site with the command `uv run --with crieur crieur build`.
