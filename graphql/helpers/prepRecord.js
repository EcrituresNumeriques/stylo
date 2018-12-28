const prepRecord = record => ({
    ...record._doc,
    _id:record.id,
    updatedAt:new Date(record._doc.updatedAt).toUTCString(),
    createdAt:new Date(record._doc.createdAt).toUTCString()
})

module.exports = prepRecord;