# Stylo

Stylo est un éditeur de textes pour articles scientifiques en sciences humaines et sociales.

L'environnement de travail de Stylo intègre une chaîne éditoriale complète basée sur [pandoc](http://pandoc.org/) et outillée des modules suivants :

- un éditeur de métadonnées
- un versionnage
- une gestion de la bibliographie
- différents formats exports : html5, xml (TEI, Erudit), pdf...
- l'annotation
- le partage de document

Stylo est disponible en bétatest [stylo.huma-num.fr](https://stylo.huma-num.fr)

Plus d'informations sur [la documentation](http://stylo-doc.ecrituresnumeriques.ca/).

# Installation

Pour installer une instance Stylo, suivre la documentation [HOWTO.md](https://github.com/EcrituresNumeriques/stylo/blob/master/HOWTO.md).

# Développement local

L'application se lance en combinant Docker (pour avoir une base de données MongoDB isolée) et des applications Node.js (v14+). Elles s'**installent** ainsi :

```bash
docker-compose pull mongodb
npm install --prefix graphql
npm install --prefix front/gatsby
cp stylo-example.env stylo.env
```

Puis se **lancent** avec les commandes suivantes :

```bash
# Onglet de terminal 1
docker-compose run -p '127.0.0.1:27017:27017' mongodb

# Onglet de terminal 2
sleep 10
npm start --prefix graphql

# Onglet de terminal 3
npm start --prefix front/gatsby
```

L'application web tourne sur [localhost:3000](http://localhost:3000) tandis que l'API fonctionne sur [localhost:3030](http://localhost:3030/).

---

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
