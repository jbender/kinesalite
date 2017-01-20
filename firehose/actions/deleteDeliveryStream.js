module.exports = function deleteDeliveryStream(requestMeta, logger, store, data, cb) {

  var actionName = 'firehose.deleteDeliveryStream',
      actionMeta = Object.assign({}, requestMeta),
      streamName = data.DeliveryStreamName,
      metaDb = store.metaDb

  actionMeta.action = actionName

  logger.verbose('action.start', actionMeta)

  store.getStream(streamName, function(err, stream) {
    if (err) {
      logger.verbose('action.error', actionMeta)
      return cb(err)
    }

    stream.DeliveryStreamStatus = 'DELETING'

    metaDb.put(streamName, stream, function(err) {
      if (err) {
        logger.verbose('action.error', actionMeta)
        return cb(err)
      }

      store.deleteStreamDb(streamName, function(err) {
        if (err) {
          logger.verbose('action.error', actionMeta)
          return cb(err)
        }

        setTimeout(function() {
          metaDb.del(streamName, function(err) {
            if (err && !/Database is not open/.test(err))
              logger.error(err.stack || err)
          })
        }, store.deleteStreamMs)

        cb()
      })
    })
  })

}
