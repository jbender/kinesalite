var uuid = require('node-uuid'),
    db = require('../../db')

module.exports = function putRecord(store, data, cb) {

  var key = data.DeliveryStreamName,
      metaDb = store.metaDb,
      streamDb = store.getStreamDb(key)

  metaDb.lock(key, function(release) {
    cb = release(cb)

    store.getStream(key, function(err, stream) {
      if (err) return cb(err)

      if (!~['ACTIVE', 'UPDATING'].indexOf(stream.DeliveryStreamStatus)) {
        return cb(db.clientError('ResourceNotFoundException',
          'DeliveryStream ' + key + ' under account ' + metaDb.awsAccountId + ' not found.'))
      }

      var streamKey = uuid.v1()
      var record = {
        Data: data.Record.Data,
        _timestamp: Date.now(),
      }

      streamDb.put(streamKey, record, function(err) {
        if (err) return cb(err)
        cb(null, {RecordId: streamKey})
      })
    })
  })
}
