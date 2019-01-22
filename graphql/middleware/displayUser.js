module.exports =  (req, _, next) => {
    console.log("displaying auth status + user : ",req.isAuth,req.user,req.user_noCSRF)
    return next();
}