module.exports = function deleteDeliveryStream(store, data, cb) {

  var key = data.DeliveryStreamName,
      metaDb = store.metaDb

  store.getStream(key, function(err, stream) {
    if (err) return cb(err)

    stream.DeliveryStreamStatus = 'DELETING'

    metaDb.put(key, stream, function(err) {
      if (err) return cb(err)

      store.deleteStreamDb(key, function(err) {
        if (err) return cb(err)

        setTimeout(function() {
          metaDb.del(key, function(err) {
            if (err && !/Database is not open/.test(err))
              console.error(err.stack || err)
          })
        }, store.deleteStreamMs)

        cb()
      })
    })
  })

}
