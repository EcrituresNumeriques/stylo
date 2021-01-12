// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = ({ page, actions }) => {
  const { createPage } = actions
  // Make the front page match everything client side.
  // Normally your paths should be a bit more judicious.
  if (page.path === `/article/`) {
    page.matchPath = `/article/*`
    createPage(page)
  } else if (page.path === `/book/`) {
    page.matchPath = `/book/*`
    createPage(page)
  }
}
