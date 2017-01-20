var db = require('../../db')

module.exports = function createDeliveryStream(requestMeta, logger, store, data, cb) {

  var actionName = 'firehose.createDeliveryStream',
      actionMeta = Object.assign({}, requestMeta),
      streamName = data.DeliveryStreamName,
      metaDb = store.metaDb

  actionMeta.action = actionName

  logger.verbose('action.start', actionMeta)

  metaDb.lock(streamName, function(release) {
    cb = release(cb)

    metaDb.get(streamName, function(err) {
      if (err && err.name != 'NotFoundError') {
        logger.verbose('action.error', actionMeta)
        return cb(err)
      }
      if (!err) {
        logger.verbose('action.error streamExists', actionMeta)
        return cb(db.clientError('ResourceInUseException',
          'DeliveryStream ' + streamName + ' under account ' + metaDb.awsAccountId + ' already exists.'))
      }

      arn = 'arn:aws:kinesis' +
          ':' + metaDb.awsRegion +
          ':' + metaDb.awsAccountId +
          ':deliverystream/' + streamName

      destination =
        data.ElasticsearchDestinationConfiguration ||
        data.ExtendedS3DestinationConfiguration ||
        data.RedshiftDestinationConfiguration ||
        data.S3DestinationConfiguration

      now = Date.now()

      stream = {
          CreateTimestamp: now,
          DeliveryStreamARN: arn,
          DeliveryStreamName: streamName,
          DeliveryStreamStatus: 'CREATING',
          Destinations: [destination],
          HasMoreDestinations: false,
          LastUpdatedTimestamp: now,
          VersionId: 1,
      }

      metaDb.put(streamName, stream, function(err) {
        if (err) {
          logger.verbose('action.error', actionMeta)
          return cb(err)
        }

        setTimeout(function() {

            // Shouldn't need to lock/fetch as nothing should have changed
            stream.DeliveryStreamStatus = 'ACTIVE'

            metaDb.put(streamName, stream, function(err) {
              if (err && !/Database is not open/.test(err))
                logger.error(err.stack || err)
            })

        }, store.createStreamMs)

        logger.verbose('action.complete', actionMeta)
        cb()
      })
    })
  })

}
