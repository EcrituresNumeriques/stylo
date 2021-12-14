const User = require('../models/user');
const Article = require('../models/article');
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

    return user;
};

const getVersionById = async (versionId) => {
    const version = await Version.findById(versionId).populate('owner article');

    if(!version){
        throw new Error(`Version id ${versionId} does not exist`)
    }
    return version;
};

const getArticleById = async (articleId) => {
    const article = await Article.findById(articleId).populate('owners versions tags');

    if(!article){
        throw new Error(`Unable to find this article : _id ${articleId} does not exist`)
    }

    return article;
};

exports.getUserById = getUserById;
exports.getArticleById = getArticleById;
exports.getVersionById = getVersionById;
