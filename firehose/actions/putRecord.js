var uuid = require('node-uuid'),
    db = require('../../db')

module.exports = function putRecord(store, data, cb) {

  var streamName = data.DeliveryStreamName,
      metaDb = store.metaDb,
      streamDb = store.getStreamDb(streamName)

  metaDb.lock(streamName, function(release) {
    cb = release(cb)

    store.getStream(streamName, function(err, stream) {
      if (err) return cb(err)

      if (!~['ACTIVE', 'UPDATING'].indexOf(stream.DeliveryStreamStatus)) {
        return cb(db.clientError('ResourceNotFoundException',
          'DeliveryStream ' + streamName + ' under account ' + metaDb.awsAccountId + ' not found.'))
      }

      var recordId = uuid.v1()
      var record = {
        Data: data.Record.Data,
        _timestamp: Date.now(),
      }

      streamDb.put(recordId, record, function(err) {
        if (err) return cb(err)
        cb(null, {RecordId: recordId})
      })
    })
  })
}
