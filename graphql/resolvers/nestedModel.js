const prepRecord = require('../helpers/prepRecord');
const dateToString = require('../helpers/dateToString');
const paginate = require('../helpers/paginate');

const User = require('../models/user');
const Password = require('../models/user_password');
const Token = require('../models/user_token');


const populateUser =  (user) => {
    const cleanedUser = prepRecord(user);
    return {
        ...cleanedUser,
        tags: getTagsByIds.bind(this, cleanedUser.tags),
        articles: getArticlesByIds.bind(this, cleanedUser.articles || []),
        tokens: getTokensByIds.bind(this, cleanedUser.tokens || []),
        passwords: getPasswordsByIds.bind(this, cleanedUser.passwords || []),
    }
};

const getUserById = async (userId) => {
    try {
        const user = await User.findById(userId);
        return populateUser(user);
    } catch (err) {
        throw err;
    }
};
const getUsersByIds = async (usersIds,args) => {
    try{
        usersIds = paginate(usersIds,args.limit,args.page);
        const users = await User.find({ _id: { $in: usersIds } });
        return users.map(populateUser);
    }
    catch(err){
        throw err
    }
};

const getTagsByIds = async (tagsIds,args) => {
    return [{_id:"hello tag"}]
};

const getArticlesByIds = async (articlesIds,args) => {
    return [{_id:"hello article"}]
};

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
        const tokens = await Token.find({ _id: { $in: tokensIds } });
        return tokens.map(populateToken);
    }
    catch(err){
        throw err
    }
};

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
        const passwords = await Password.find({ _id: { $in: passwordsIds } });
        return passwords.map(populatePassword);
    }
    catch(err){
        throw err
    }
};


exports.populateUser = populateUser;