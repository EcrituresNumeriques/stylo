/**
 * Removes the <summary> elements from an Atom feed.
 *
 * The blog feed contains the full text of each post in <summary> (about 95% of its size),
 * while the home page only displays the title, author, link, date and categories of a few posts.
 * The feed remains valid: entries have no <content> and keep their alternate link (RFC 4287).
 *
 * @param {string} xml Atom feed
 * @returns {string} Atom feed without <summary> elements
 */
function removeAtomSummaries(xml) {
  return xml.replace(/\s*<summary\b[^>]*?(?:\/>|>[\s\S]*?<\/summary>)/g, '')
}

module.exports = { removeAtomSummaries }
