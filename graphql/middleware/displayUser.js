module.exports =  (req, res, next) => {
    //console.log("displaying auth status + user : ",req.isAuth,req.user)
    next();
}