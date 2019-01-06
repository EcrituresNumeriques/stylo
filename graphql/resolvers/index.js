const userResolver = require('./userResolver');
const articleResolver = require('./articleResolver')

const rootResolver = {
  ...userResolver,
  ...articleResolver
};

module.exports = rootResolver
