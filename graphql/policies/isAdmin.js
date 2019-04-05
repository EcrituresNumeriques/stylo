const isAuth = require('./isAuth')

module.exports = (req) => {
    try{
        isAuth(req)
        if(req.user && req.user.admin === true){
            return true
        }
        throw new Error("Only available for administrators")
    }
    catch(err){
        throw err
    }
    
}