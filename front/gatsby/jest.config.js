module.exports = {
    transform: {
        "^.+\\.jsx?$": `<rootDir>/jest-preprocess.js`
    },
    testPathIgnorePatterns: [`node_modules`, `\\.cache`, `<rootDir>.*/public`],
    transformIgnorePatterns: [`node_modules/(?!(gatsby)/)`],
}