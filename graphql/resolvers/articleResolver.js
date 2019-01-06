const { getArticleById } = require('./nestedModel')

module.exports = {
  article: async (args) => {
    try{
      return await getArticleById(args._id)
    }
    catch(err){
      throw err
    }
  }
}
