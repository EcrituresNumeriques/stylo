const prepRecord = require('../helpers/prepRecord');
const paginate = require('../helpers/paginate');

const User = require('../models/user');
const Tag = require('../models/tag');
const Article = require('../models/article');
const Version = require('../models/version');

/*
---------------------------------------------------------
|                                                       |
|                       Users                           |
|                                                       |
---------------------------------------------------------
*/

const populateUser = (user) => {
    return {
        ...user,
        tags: getTagsByIds.bind(this, user.tags),
        articles: getArticlesByIds.bind(this, user.articles || []),
        acquintances: getUsersByIds.bind(this, user.acquintances || []),
    }
};

const getUserById = async (userId) => {
    const user = await User.findById(userId).lean();
    if(!user){
        throw new Error(`Unable to find this user : _id ${userId} does not exist`)
    }

    return populateUser(user);
};

const getUsersByIds = async (usersIds,args) => {
    usersIds = paginate(usersIds,args.limit,args.page);
    return usersIds.map((userId) => User.findById(userId).then(populateUser));
};

/*
---------------------------------------------------------
|                                                       |
|                       Versions                        |
|                                                       |
---------------------------------------------------------
*/

const populateVersion = (version) => {
    const cleanedVersion = prepRecord(version);
    return {
        ...cleanedVersion,
        owner: cleanedVersion.owner?getUserById.bind(this, cleanedVersion.owner):null,
        article: getArticleById.bind(this, cleanedVersion.article || [])
    }
}

const getVersionsByIds = async (versionsIds,args) => {
    versionsIds = paginate(versionsIds,args.limit,args.page);
    if(versionsIds.length === 0){ return [] }
    const versions = await Version.find({ _id: { $in: versionsIds } });
    return versions.reverse().map(populateVersion);
};

const getVersionById = async (versionId) => {
    const version = await Version.findById(versionId);
    if(!version){
        throw new Error(`Version id ${versionId} does not exist`)
    }
    return populateVersion(version);
};

/*
---------------------------------------------------------
|                                                       |
|                       Tags                            |
|                                                       |
---------------------------------------------------------
*/

const populateTag = (tag) => {
    const cleanedTag = prepRecord(tag)
    return {
        ...cleanedTag,
        articles:getArticlesByIds.bind(this, cleanedTag.articles || [])
    }
}

const getTagsByIds = async (tagsIds,args) => {
    tagsIds = paginate(tagsIds,args.limit,args.page);
    if(tagsIds.length === 0){ return [] }
    const tags = await Tag.find({ _id: { $in: tagsIds } });
    return tags.map(populateTag);
};

/*
---------------------------------------------------------
|                                                       |
|                       Articles                        |
|                                                       |
---------------------------------------------------------
*/

const populateArticle = (article) => {
    const cleanedArticle = prepRecord(article)
    return {
        ...cleanedArticle,
        zoteroLink:cleanedArticle.zoteroLink || "",
        owners:getUsersByIds.bind(this, cleanedArticle.owners || []),
        versions:getVersionsByIds.bind(this, cleanedArticle.versions || []),
        tags:getTagsByIds.bind(this, cleanedArticle.tags || [])
    }
}
const getArticlesByIds = async (articlesIds,args) => {
    articlesIds = paginate(articlesIds,args.limit,args.page);
    if(articlesIds.length === 0){ return [] }
    const articles = await Article.find({ _id: { $in: articlesIds } }).populate('owners versions tags');

    if(!articles){
        return []
    }

    //console.log(articles.map(populateArticle))
    return articles;
};
const getArticleById = async (articleId) => {
    const article = await Article.findById(articleId);

    if(!article){
        throw new Error(`Unable to find this article : _id ${articleId} does not exist`)
    }

    return populateArticle(article);
};

exports.populateTag = populateTag;
exports.populateVersion = populateVersion;
exports.populateUser = populateUser;
exports.getUserById = getUserById;
exports.populateArticle = populateArticle;
exports.getArticleById = getArticleById;
exports.getVersionById = getVersionById;
