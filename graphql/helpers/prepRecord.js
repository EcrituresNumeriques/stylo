const dateToString = require('./dateToString');

const prepRecord = record => ({
    ...record._doc,
    _id:record.id,
    updatedAt:dateToString(record._doc.updatedAt),
    createdAt:dateToString(record._doc.createdAt)
})

module.exports = prepRecord;