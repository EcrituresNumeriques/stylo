/**
 * Fichier de configuration Eleventy
 * https://www.11ty.dev/docs/config/
 */

const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {

  eleventyConfig.addPlugin(pluginWebc, {
    // WebC Components
    // Nous sommes explicites dans le chemin depuis lequel
    // nous souhaitons importer.
    components: [
      "./src/_includes/components/**/*.webc",
    ],
  });

  // Copier les contenus du dossier `uploads/` tels quels
  // (sans le dossier `uploads/` dans le chemin de destination)
  eleventyConfig.addPassthroughCopy("uploads");

  // Alias pour les dispositions
  eleventyConfig.addLayoutAlias('docs', 'layouts/docs');
  eleventyConfig.addLayoutAlias('home', 'layouts/home');


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
