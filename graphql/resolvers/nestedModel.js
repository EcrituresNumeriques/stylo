const prepRecord = require('../helpers/prepRecord');
const dateToString = require('../helpers/dateToString');
const paginate = require('../helpers/paginate');

const User = require('../models/user');
const Password = require('../models/user_password');
const Token = require('../models/user_token');
const Tag = require('../models/tag');
const Article = require('../models/article');
const Version = require('../models/version');


const DataLoader = require('dataloader');


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
        return populateUser(user);
    } catch (err) {
        throw err;
    }
};
const getUsersByIds = async (usersIds,args) => {
    console.log("Entering getUsersByIds",usersIds,args);
    try{
        usersIds = paginate(usersIds,args.limit,args.page);
        if(usersIds.length === 0){ return [] }
        return usersIds.map((userId) => (getUsersByIdsLoader.load(userId)));
        //const users = await User.find({ _id: { $in: usersIds } });
        //return users.map(populateUser);
    }
    catch(err){
        throw err
    }
};

const getUsersByIdsNF = async (usersIds) => {
    console.log("Entering dataloader getUsersByIds",usersIds);
    try{
        //return 
        const users = User.find({ _id: { $in: usersIds } })
        let processedUsers = users.map(populateUser);
        console.log(processedUsers);
        return processedUsers
    }
    catch(err){
        throw err
    }
};

const getUsersByIdsLoader = new DataLoader(getUsersByIdsNF);

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
        owner: getUserById.bind(this, cleanedVersion.owner),
        article: getArticleById.bind(this, cleanedVersion.article || [])
    }
}

const getVersionsByIds = async (versionsIds,args) => {
    try{
        versionsIds = paginate(versionsIds,args.limit,args.page);
        if(versionsIds.length === 0){ return [] }
        const versions = await Version.find({ _id: { $in: versionsIds } });
        return versions.map(populateVersion);
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
        owner:getUserById.bind(this, cleanedTag.owner || []),
        articles:getArticlesByIds.bind(this.cleanedTag.articles || [])
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
        owners:getUsersByIds.bind(this, cleanedArticle.owners || []),
        versions:getVersionsByIds.bind(this.cleanedArticle.versions || [])
    }
}
const getArticlesByIds = async (articlesIds,args) => {
    try{
        articlesIds = paginate(articlesIds,args.limit,args.page);
        if(articlesIds.length === 0){ return [] }
        const articles = await Article.find({ _id: { $in: articlesIds } });
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
        token:null,
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


exports.populateUser = populateUser;
exports.getUserById = getUserById;