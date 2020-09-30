const prepRecord = require('../helpers/prepRecord');
const dateToString = require('../helpers/dateToString');
const paginate = require('../helpers/paginate');

const User = require('../models/user');
const Password = require('../models/user_password');
const Token = require('../models/user_token');
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

const populateUser =  (user) => {
    const cleanedUser = prepRecord(user);
    return {
        ...cleanedUser,
        tags: getTagsByIds.bind(this, cleanedUser.tags),
        articles: getArticlesByIds.bind(this, cleanedUser.articles || []),
        tokens: getTokensByIds.bind(this, cleanedUser.tokens || []),
        passwords: getPasswordsByIds.bind(this, cleanedUser.passwords || []),
        acquintances: getUsersByIds.bind(this, cleanedUser.acquintances || []),
    }
};

const getUserById = async (userId) => {
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new Error(`Unable to find this user : _id ${userId} does not exist`)
        }
        //console.log(populateUser(user))
        return populateUser(user);
    } catch (err) {
        throw err;
    }
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
    try{
        versionsIds = paginate(versionsIds,args.limit,args.page);
        if(versionsIds.length === 0){ return [] }
        const versions = await Version.find({ _id: { $in: versionsIds } });
        return versions.reverse().map(populateVersion);
    }
    catch(err){
        throw err
    }
};

const getVersionById = async (versionId) => {
    try{
        const version = await Version.findById(versionId);
        if(!version){
            throw new Error(`Version id ${versionId} does not exist`)
        }
        return populateVersion(version);
    }
    catch(err){
        throw err
    }
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
    try{
        tagsIds = paginate(tagsIds,args.limit,args.page);
        if(tagsIds.length === 0){ return [] }
        const tags = await Tag.find({ _id: { $in: tagsIds } });
        return tags.map(populateTag);
    }
    catch(err){
        throw err
    }
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
        live:getVersionById.bind(this, cleanedArticle.versions[cleanedArticle.versions.length-1] || []),
        tags:getTagsByIds.bind(this, cleanedArticle.tags || [])
    }
}
const getArticlesByIds = async (articlesIds,args) => {
    try{
        articlesIds = paginate(articlesIds,args.limit,args.page);
        if(articlesIds.length === 0){ return [] }
        const articles = await Article.find({ _id: { $in: articlesIds } });
        if(!articles){
            return []
        }
        //console.log(articles.map(populateArticle))
        return articles.map(populateArticle);
    }
    catch(err){
        throw err
    }
};
const getArticleById = async (articleId) => {
    try {
        const article = await Article.findById(articleId);
        if(!article){
            throw new Error(`Unable to find this article : _id ${articleId} does not exist`)
        }
        return populateArticle(article);
    } catch (err) {
        throw err;
    }
};

/*
---------------------------------------------------------
|                                                       |
|                       Tokens                          |
|                                                       |
---------------------------------------------------------
*/


const populateToken =  (token) => {
    const cleanedToken = prepRecord(token);
    return {
        ...cleanedToken,
        user:getUserById.bind(this,cleanedToken.user || []),
        expiresAt:cleanedToken.expiresAt? dateToString(cleanedToken.expiresAt) : null,
    }
};

const getTokensByIds = async (tokensIds,args) => {
    try{
        tokensIds = paginate(tokensIds,args.limit,args.page);
        if(tokensIds.length === 0){ return [] }
        const tokens = await Token.find({ _id: { $in: tokensIds } });
        return tokens.map(populateToken);
    }
    catch(err){
        throw err
    }
};

/*
---------------------------------------------------------
|                                                       |
|                       Passwords                       |
|                                                       |
---------------------------------------------------------
*/

const populatePassword =  (password) => {
    const cleanedPassword = prepRecord(password);
    return {
        ...cleanedPassword,
        users:getUsersByIds.bind(this,cleanedPassword.users || []),
        defaultUser:getUserById.bind(this,cleanedPassword.users[0]),
        password:null,
        unlock:dateToString(cleanedPassword.unlock),
        expiresAt:cleanedPassword.expiresAt? dateToString(cleanedPassword.expiresAt) : null,
    }
};

const getPasswordsByIds = async (passwordsIds,args) => {
    try{
        passwordsIds = paginate(passwordsIds,args.limit,args.page);
        if(passwordsIds.length === 0){ return [] }
        const passwords = await Password.find({ _id: { $in: passwordsIds } });
        return passwords.map(populatePassword);
    }
    catch(err){
        throw err
    }
};


exports.populateTag = populateTag;
exports.populateVersion = populateVersion;
exports.populateUser = populateUser;
exports.getUserById = getUserById;
exports.populatePassword = populatePassword;
exports.populateToken = populateToken;
exports.populateArticle = populateArticle;
exports.getArticleById = getArticleById;
exports.getVersionById = getVersionById;
