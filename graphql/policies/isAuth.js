module.exports = (req) => {
    // fixme: use a global middleware...
    if(!req.user){
        throw new Error("Not authentificated")
    }

    return true
}