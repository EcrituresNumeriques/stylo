const isAuth = require('./isAuth')

module.exports = (args,req) => {
    try{
        isAuth(req)
        if(req.user && req.user.admin === true){
            return true
        }
        else if(!req.user || !req.user.usersIds || !req.user.usersIds.includes(args.user)){
            throw new Error("Can't authentificate as declared user")
        }
        return true
    }
    catch(err){
        throw err
    }
    
}