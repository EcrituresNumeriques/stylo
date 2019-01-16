const userResolver = require('./userResolver');
const articleResolver = require('./articleResolver')
const tagResolver = require('./tagResolver')

const rootResolver = {
  ...userResolver,
  ...articleResolver,
  ...tagResolver
};

module.exports = rootResolver
