/**
 * Fichier de configuration Eleventy
 * https://www.11ty.dev/docs/config/
 */

const pluginWebc = require("@11ty/eleventy-plugin-webc");
const searchFilter = require("./src/filters/search");
const pluginTOC = require('eleventy-plugin-toc');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');


// constante pour les ancres dans les titres
const mdAnchorOpts = {
  permalink: true,
  permalinkClass: 'anchor-link',
  permalinkSymbol: '#',
  level: [1, 2, 3, 4]
};

module.exports = function(eleventyConfig) {

  //Markdown : ajout des ancres sur les titres et la classe 'anchor-link'
  eleventyConfig.setLibrary(
    'md',
    markdownIt()
      .use(markdownItAnchor, mdAnchorOpts)
  )

  //Plugins
  eleventyConfig.addFilter("search", searchFilter);
  eleventyConfig.addPlugin(pluginTOC);

  eleventyConfig.addPlugin(pluginWebc, {
    // WebC Components
    // Nous sommes explicites dans le chemin depuis lequel
    // nous souhaitons importer.
    components: [
      "./src/_includes/components/**/*.webc",
    ],
  });

  // Collections
  // Tous les contenus sous /fr
  eleventyConfig.addCollection('docs__fr', function(collection) {
    return collection.getFilteredByGlob('src/fr/**/*.md').sort((a,b) => {
      // ordonner selon la date
      if(a.data.data < b.data.date) return -1;
      if(a.data.date > b.date.date) return 1;
      return 0;
    });
  });
  // Tous les contenus sous /en
  eleventyConfig.addCollection('docs__en', function(collection) {
    return collection.getFilteredByGlob('src/en/**/*.md').sort((a,b) => {
      // ordonner selon la date
      if(a.data.data < b.data.date) return -1;
      if(a.data.date > b.date.date) return 1;
      return 0;
    });
  });

  // Nous pourrions ajouter d’autres collections
  // ex. pour les annonces, ou sous /blog

  // Copier les contenus du dossier `uploads/` tels quels
  // (sans le dossier `uploads/` dans le chemin de destination)
  eleventyConfig.addPassthroughCopy("uploads");

  // Alias pour les dispositions
  eleventyConfig.addLayoutAlias('docs', 'layouts/docs');
  eleventyConfig.addLayoutAlias('home', 'layouts/home');
  eleventyConfig.addLayoutAlias('search', 'layouts/search');


  // Configuration 11ty explicite (suivant certaines conventions)
  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
  };
};
