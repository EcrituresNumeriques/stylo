module.exports = (req) => {
    if (!req.user) {
        throw new Error("Not authenticated")
    }
    if (req.user.admin === true) {
        return true
    }

    throw new Error("Only available for administrators")
}
