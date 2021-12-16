const User = require('../models/user');
const Version = require('../models/version');

const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .populate('tags acquintances')
    // see https://mongoosejs.com/docs/api/document.html#document_Document-populate
    // for subdocument population
    .populate({ path: 'articles', populate: { path: 'owners versions tags' }})
    .lean();

  if(!user){
      throw new Error(`Unable to find this user : _id ${userId} does not exist`)
  }

  // Also, fetch its granted accounts, and documents
  const users = await User.findAccountAccessArticles(user)

  if (users.length) {
    const extraArticles = users
      .flatMap(({ articles }) => articles)
      .filter(({ id }) => !user.articles.find(a => a._id == id))

    user.articles.push(...extraArticles)
  }

  return user;
};

const getVersionById = async (versionId) => {
    const version = await Version.findById(versionId).populate('owner article');

    if(!version){
        throw new Error(`Version id ${versionId} does not exist`)
    }
    return version;
};


exports.getUserById = getUserById;
exports.getVersionById = getVersionById;
