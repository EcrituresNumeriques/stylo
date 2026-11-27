const config = require('../../config.js')

/**
 * Mongoose plugin for documents which own attachments (images, backups…)
 * on a storage account, under `{instance}/{folder}/{id}`.
 *
 * @example articleSchema.plugin(attachable)
 * @example corpusSchema.plugin(attachable, { folder: 'corpora' })
 *
 * @param {import('mongoose').Schema} schema
 * @param {object} [options]
 * @param {string} [options.folder] folder name on the storage, defaults to the collection name
 */
module.exports = function attachable(schema, { folder } = {}) {
  /**
   * Also the `scope` of the attachments records.
   * @returns {string}
   */
  schema.methods.attachmentsScope = function attachmentsScope() {
    return folder ?? this.collection.collectionName
  }

  /**
   * @returns {string} e.g. `stylo.huma-num.fr/articles/690b59558b79e50028061c97`
   */
  schema.methods.attachmentsFolder = function attachmentsFolder() {
    return `${config.get('attachments.instance')}/${this.attachmentsScope()}/${this._id}`
  }

  /**
   * @param {string} name file name, or path relative to the attachments folder
   * @returns {string}
   */
  schema.methods.attachmentPath = function attachmentPath(name) {
    return `${this.attachmentsFolder()}/${name}`
  }

  schema.methods.findAttachments = function findAttachments() {
    return this.model('Attachment').find({
      scope: this.attachmentsScope(),
      scopeId: this._id,
    })
  }
}
