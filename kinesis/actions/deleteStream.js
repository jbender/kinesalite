
module.exports = function deleteStream(requestMeta, logger, store, data, cb) {

  var streamName = data.StreamName,
      streamKey = store.streamKey({name: streamName, type: 'stream'}),
      metaDb = store.metaDb

  store.getStream(streamKey, function(err, stream) {
    if (err) return cb(err)

    stream.StreamStatus = 'DELETING'

    metaDb.put(streamKey, stream, function(err) {
      if (err) return cb(err)

      store.deleteStreamDb(streamDbKey, function(err) {
        if (err) return cb(err)

        setTimeout(function() {
          metaDb.del(streamKey, function(err) {
            if (err && !/Database is not open/.test(err)) console.error(err.stack || err)
          })
        }, store.deleteStreamMs)

        cb()
      })
    })
  })

}
