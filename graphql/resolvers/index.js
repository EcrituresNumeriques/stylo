const userResolver = require('./userResolver');
const articleResolver = require('./articleResolver')
const tagResolver = require('./tagResolver')
const versionResolver = require('./versionResolver')

const rootResolver = {
  ...userResolver,
  ...articleResolver,
  ...tagResolver,
  ...versionResolver
};

module.exports = rootResolver
