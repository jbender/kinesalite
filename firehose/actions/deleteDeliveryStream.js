module.exports = function deleteDeliveryStream(store, data, cb) {

  var streamName = data.DeliveryStreamName,
      metaDb = store.metaDb

  store.getStream(streamName, function(err, stream) {
    if (err) return cb(err)

    stream.DeliveryStreamStatus = 'DELETING'

    metaDb.put(streamName, stream, function(err) {
      if (err) return cb(err)

      store.deleteStreamDb(streamName, function(err) {
        if (err) return cb(err)

        setTimeout(function() {
          metaDb.del(streamName, function(err) {
            if (err && !/Database is not open/.test(err))
              console.error(err.stack || err)
          })
        }, store.deleteStreamMs)

        cb()
      })
    })
  })

}
