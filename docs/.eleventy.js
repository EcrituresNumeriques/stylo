/**
 * Fichier de configuration Eleventy
 * https://www.11ty.dev/docs/config/
 */

const pluginWebc = require("@11ty/eleventy-plugin-webc");
const searchFilter = require("./src/filters/search");
const pluginTOC = require('eleventy-plugin-toc');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

// des options pour le rendu avec markdown-it
const mdOptions = {
  html: true,
  breaks: false,
  linkify: true,
  typographer: true
}

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
    markdownIt(mdOptions)
      .use(markdownItAnchor, mdAnchorOpts)
  )

  //Plugins
  eleventyConfig.addFilter("search", searchFilter);
  eleventyConfig.addPlugin(pluginTOC, {
    ul: true,
    tags: ['h2', 'h3'],
  });

  eleventyConfig.addPlugin(pluginWebc, {
    // WebC Components
    // Nous sommes explicites dans le chemin depuis lequel
    // nous souhaitons importer.
    components: [
      "./src/_includes/components/**/*.webc",
    ],
  });

  // Réglage du comportement par défaut d'11ty de fusionner n'importe quelle propriété héritée de la structure de données
  // Prend true ou false comme valeur (false permet de désactiver le comportement de fusion)
  // Documentation ici : <https://www.11ty.dev/docs/data-deep-merge/>
  eleventyConfig.setDataDeepMerge(true);

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


  // Les shortcodes vont ici
  // shortcode sert pour créer le composant bouton
  eleventyConfig.addPairedShortcode("link-button", function (content, href, color, size) { 
    if (size != undefined) {
      size = size;
    } else {
      size = "small";
    }
    return `
  <link-button href="${href}" color="${color}" size="${size}">${content}</link-button>`; 
});


  // shortcode pour les alert-block
  eleventyConfig.addPairedShortcode("alert-block", function (content, heading, type) {
    if (type != undefined) {
      type = type;
    } else {
      type = "neutral";
    }
    return `
    <alert-block type="${type}" heading="${heading}">${content}</alert-block>`
  });

  // shortcode pour rendre l'image cliquable
  eleventyConfig.addShortcode("figure", function (src, caption, alt) {
    let figcaption_html = (caption != "") ? `<figcaption>${caption}</figcaption>` : '';
    return `
<figure>
  <a href="#${src}" id="_${src}">
    <img lazy="true" src="${src}" alt="${alt ? alt : (caption ? caption : '')}" />
  </a>
  <a href="#_${src}" class="overlay" id="${src}">
    <img src="${src}" alt="${alt ? alt : (caption ? caption : '')}" />
  </a>
  ${figcaption_html}
</figure>`;
  });

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
