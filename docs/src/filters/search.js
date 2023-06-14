/**
 * Filtre pour recherche avec 11ty
 * https://www.belter.io/eleventy-search/
 */
const elasticlunr = require('elasticlunr');
const striptags = require("striptags");

module.exports = function (collection) {
  // what fields we'd like our index to consist of
  var index = elasticlunr(function () {
    this.addField('title');
    this.addField('description');
    this.addField('text');
    this.addField('lang');
    this.setRef('id');
  });

  // loop through each page and add it to the index
  collection.forEach((page) => {
    const text = striptags(page.content);
    const excerpt = text
      .substring(0, 90) // couper le texte
      .replace(/^\\s+|\\s+$|\\s+(?=\\s)/g, '') // enlever les espaces inutiles
      .trim() // enlever les espaces au début et à la fin
      .concat('…'); // ajouter une ellipse à la fin

    index.addDoc({
      id: page.url,
      title: page.template.frontMatter.data.title,
      excerpt: excerpt,
      text: text,
      lang: page.data.lang
    });
  });

  return index.toJSON();
};
