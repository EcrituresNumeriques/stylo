function filterAlphaNum (string) {
  return string
    .replace(/\s/g, '_')
    .replace(/[ÉéÈèÊêËë]/g, 'e')
    .replace(/[ÔôÖö]/g, 'o')
    .replace(/[ÂâÄäÀà]/g, 'a')
    .replace(/[Çç]/g, 'c')
    .replace(/[^A-Za-z0-9_]/g, '')
}

export function generateBookExportId(bookName) {
  return filterAlphaNum(bookName)
}

export function generateArticleExportId(articleTitle, articleVersionMajor, articleVersionMinor) {
  if (typeof articleVersionMajor === "undefined" && typeof articleVersionMinor === "undefined") {
    return `${filterAlphaNum(articleTitle)}-latest`
  }
  return `${filterAlphaNum(articleTitle)}v${articleVersionMajor}-${articleVersionMinor}`
}
