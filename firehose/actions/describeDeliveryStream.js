module.exports = function describeDeliveryStream(requestMeta, logger, store, data, cb) {

  var actionName = 'firehose.describeDeliveryStream',
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

    logger.verbose('action.complete', actionMeta)
    cb(null, {DeliveryStreamDescription: stream})
  })

}
