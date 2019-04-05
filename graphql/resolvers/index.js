const userResolver = require('./userResolver');
const articleResolver = require('./articleResolver')
const tagResolver = require('./tagResolver')
const versionResolver = require('./versionResolver')
const authResolver = require('./authResolver')

const rootResolver = {
  ...userResolver,
  ...articleResolver,
  ...tagResolver,
  ...versionResolver,
  ...authResolver
};

module.exports = rootResolver
