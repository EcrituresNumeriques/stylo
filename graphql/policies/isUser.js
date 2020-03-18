const isAuth = require('./isAuth')

module.exports = (args,req) => {
    try{
        isAuth(req)
        //console.log(req.user.usersIds)

        return true
        /*
        if(req.user && req.user.admin === true){
            return true
        }
        // remind: usersIds sert à partager des articles (ie. on usupe l'identité d'un autre utilisateur)
        else if(!req.user || !req.user.usersIds || !req.user.usersIds.includes(args.user)){
            throw new Error("Can't authentificate as declared user")
        }
        return true
        */
    }
    catch(err){
        throw err
    }
    
}