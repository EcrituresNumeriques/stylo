const userResolver = require('./userResolver');

const rootResolver = {
  ...userResolver
};

module.exports = rootResolver
