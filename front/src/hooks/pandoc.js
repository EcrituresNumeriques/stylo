const SLUG_SEPARATOR = '-'

/**
 * Diacritics removal which contains:
 *
 * - ASCII
 * - Latin-1 Supplement characters (0080-OOFF)
 * - Latin Extended-A (0100—017F)
 *
 * TODO
 * - https://unicode-table.com/en/blocks/latin-extended-b/
 * - https://unicode-table.com/en/blocks/ipa-extensions/
 * - https://unicode-table.com/en/blocks/cyrillic/
 * - https://unicode-table.com/en/blocks/cyrillic-supplement/
 * - https://unicode-table.com/en/blocks/cherokee/ (<3)
 *
 * @param {String} string
 * @returns {String}
 */
function removeDiacritics (string) {
  return string
    .replace(/[ÂâÄäÅåÀàÁáĀāĂăĄą]/g, 'a')
    .replace(/[ÉéÈèÊêËëĒēĔĕĖėĘęĚě]/g, 'e')
    .replace(/[ÌìÍíÎîÏïĨĩĪīĬĭĮįİı]/g, 'i')
    .replace(/[ÒòÓóÔôÕõÖöØøŌōŎŏŐő]/g, 'o')
    .replace(/[Œœ]/g, 'oe')
    .replace(/[ÙùÚúÛûÜüŨũŪūŬŭŮůŰűŲų]/g, 'u')
    .replace(/[ÝýŸÿŶŷŸ]/g, 'y')
    .replace(/[ß]/g, 'b')
    .replace(/[ÇçĆćĈĉĊċČčĎďĐđ]/g, 'c')
    .replace(/[Ð]/g, 'd')
    .replace(/[ĜĝĞğĠġĢģ]/g, 'g')
    .replace(/[ĤĥĦħ]/g, 'h')
    .replace(/[Ĵĵ]/g, 'j')
    .replace(/[Ķķĸ]/g, 'k')
    .replace(/[ĹĺĻļĽľĿŀŁ]/g, 'l')
    .replace(/[ÑñŃńŅņŇňŊŋ]/g, 'n')
    .replace(/[Þþ]/g, 'p')
    .replace(/[ŔŕŖŗŘř]/g, 'r')
    .replace(/[ŚśŜŝŞşŠšſ]/g, 's')
    .replace(/[ŢţŤťŦŧ]/g, 't')
    .replace(/[Ŵŵ]/g, 'w')
    .replace(/[ŹźŻżŽž]/g, 'z')
}

/**
 * Provide an anchor strictly equal to what Pandoc would do.
 * This helps build a Table of Content of our own.
 *
 * @param {String} string
 * @param {{ diacritics: Boolean }} param1
 * @returns {String}
 */
export function slugify (string, { diacritics = true } = {}) {
  return (diacritics ? string : removeDiacritics(string))
    .replace(/#+/g, '')
    // Taken by chunks of Unicode Ranges
    /* eslint-disable-next-line no-irregular-whitespace */
    .replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ¡¢£¤¥¦§¨©ª«¬­­­­®¯°±²³´µ¶·¸¹º»¼½¾¿×÷]/g, '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, SLUG_SEPARATOR)
}

export function usePandocAnchoring (separator = SLUG_SEPARATOR) {
  const state = new Map()

  return function getAnchor (string) {
    let slug = slugify(string)

    if (state.has(slug)) {
      const index = state.get(slug)
      state.set(slug, index + 1)

      // we also keep track of this repeated heading
      // We then avoid 'Part 1' to collide with 'Part' then 'Part'
      slug = `${slug}${separator}${index}`
      state.set(slug, 1)
    }
    else {
      state.set(slug, 1)
    }

    return slug
  }
}
