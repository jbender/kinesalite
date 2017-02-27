var db = require('../../db')

module.exports = function decreaseStreamRetentionPeriod(requestMeta, logger, store, data, cb) {

  var streamName = data.StreamName,
      streamKey = store.streamKey({name: streamName, type: 'stream'}),
      metaDb = store.metaDb

  metaDb.lock(streamKey, function(release) {
    cb = release(cb)

    store.getStream(streamKey, function(err, stream) {
      if (err) return cb(err)

      if (data.RetentionPeriodHours < 24) {
        return cb(db.clientError('InvalidArgumentException',
          'Minimum allowed retention period is 24 hours. Requested retention period (' + data.RetentionPeriodHours +
          ' hours) is too short.'))
      }

      if (data.RetentionPeriodHours > 168) {
        return cb(db.clientError('InvalidArgumentException',
          'Maximum allowed retention period is 168 hours. Requested retention period (' + data.RetentionPeriodHours +
          ' hours) is too long.'))
      }

      if (stream.RetentionPeriodHours < data.RetentionPeriodHours) {
        return cb(db.clientError('InvalidArgumentException',
          'Requested retention period (' + data.RetentionPeriodHours +
          ' hours) for stream ' + streamName +
          ' can not be longer than existing retention period (' + stream.RetentionPeriodHours +
          ' hours). Use IncreaseRetentionPeriod API.'))
      }

      stream.RetentionPeriodHours = data.RetentionPeriodHours

      metaDb.put(streamKey, stream, function(err) {
        if (err) return cb(err)

        cb()
      })
    })
  })
}
