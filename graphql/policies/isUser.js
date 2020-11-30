module.exports = (args,req) => {
    try {
        if (!req.user) {
            throw new Error("Not authenticated")
        }
        if (req.user.admin === true){
            return true
        }
        else if (!req.user.usersIds || !req.user.usersIds.includes(args.user)) {
            throw new Error("Can't authenticate as declared user")
        }
        return true
    }
    catch (err) {
        throw err
    }

}
