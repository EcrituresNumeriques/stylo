module.exports = (req) => {
    if(!req.isAuth){
        throw new Error("Not authentificated")
    }
    return true
}