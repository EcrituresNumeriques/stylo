/**
 * Fichier de configuration Eleventy
 * https://www.11ty.dev/docs/config/
 */

const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginWebc);

  // Copy `uploads/` to `_site/uploads`
  eleventyConfig.addPassthroughCopy("uploads");

  return {
    dir: {
      input: 'src',
      includes: '../_includes',
    },
  };
};
