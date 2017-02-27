module.exports = function deleteDeliveryStream(requestMeta, logger, store, data, cb) {

  var actionName = 'firehose.deleteDeliveryStream',
      actionMeta = Object.assign({}, requestMeta),
      streamName = data.DeliveryStreamName,
      streamKey = store.streamKey({name: streamName, type: 'deliveryStream'}),
      metaDb = store.metaDb

  actionMeta.action = actionName

  logger.verbose('action.start', actionMeta)

  store.getStream(streamKey, function(err, stream) {
    if (err) {
      logger.verbose('action.error', actionMeta)
      return cb(err)
    }

    stream.DeliveryStreamStatus = 'DELETING'

    metaDb.put(streamKey, stream, function(err) {
      if (err) {
        logger.verbose('action.error', actionMeta)
        return cb(err)
      }

      store.deleteDeliveryStreamDb(streamName, function(err) {
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
