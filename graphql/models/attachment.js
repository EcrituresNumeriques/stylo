const mongoose = require('mongoose')
const Schema = mongoose.Schema

const attachmentSchema = new Schema(
  {
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // user whose storage account holds the file
    storageOwner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // context of the upload, unused until workspaces can lend their storage
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    // attachments folder of the owning document, see the `attachable` plugin
    scope: { type: String, required: true },
    scopeId: { type: Schema.Types.ObjectId, required: true },
    // path relative to the storage account URL, not encoded
    path: { type: String, required: true },
    contentType: String,
    size: Number,
    etag: String,
    accessCount: { type: Number, default: 0 },
    lastAccessedAt: Date,
  },
  { timestamps: true }
)

attachmentSchema.index({ storageOwner: 1, path: 1 }, { unique: true })

module.exports = mongoose.model('Attachment', attachmentSchema)
