var uuid = require('node-uuid'),
    db = require('../../db')

module.exports = function putRecord(requestMeta, logger, store, data, cb) {

  var actionName = 'firehose.putRecord',
      actionMeta = Object.assign({}, requestMeta),
      streamName = data.DeliveryStreamName,
      streamKey = store.streamKey({name: streamName, type: 'deliveryStream'}),
      metaDb = store.metaDb,
      streamDb = store.getStreamDb(streamKey)

  actionMeta.action = actionName

  logger.verbose('action.start', actionMeta)

  metaDb.lock(streamKey, function(release) {
    cb = release(cb)

    store.getStream(streamKey, function(err, stream) {
      if (err) {
        logger.verbose('action.error', actionMeta)
        return cb(err)
      }

      if (!~['ACTIVE', 'UPDATING'].indexOf(stream.DeliveryStreamStatus)) {
        logger.verbose('action.error streamNotFound', actionMeta)
        return cb(db.clientError('ResourceNotFoundException',
          'DeliveryStream ' + streamName + ' under account ' + metaDb.awsAccountId + ' not found.'))
      }

      var recordId = uuid.v1()
      var record = {
        Data: data.Record.Data,
        _timestamp: Date.now(),
      }

      streamDb.put(recordId, record, function(err) {
        if (err) {
          logger.verbose('action.error', actionMeta)
          return cb(err)
        }

        logger.verbose('action.complete', actionMeta)
        cb(null, {RecordId: recordId})
      })
    })
  })
}
