var db = require('../../db')

module.exports = function createDeliveryStream(requestMeta, logger, store, data, cb) {

  var actionName = 'firehose.createDeliveryStream',
      actionMeta = Object.assign({}, requestMeta),
      streamName = data.DeliveryStreamName,
      streamKey = store.streamKey({name: streamName, type: 'deliveryStream'}),
      metaDb = store.metaDb

  actionMeta.action = actionName

  logger.verbose('action.start', actionMeta)

  metaDb.lock(streamKey, function(release) {
    cb = release(cb)

    metaDb.get(streamKey, function(err) {
      if (err && err.name != 'NotFoundError') {
        logger.verbose('action.error', actionMeta)
        return cb(err)
      }
      if (!err) {
        logger.verbose('action.error streamExists', actionMeta)
        return cb(db.clientError('ResourceInUseException',
          'DeliveryStream ' + streamName + ' under account ' + metaDb.awsAccountId + ' already exists.'))
      }

      var arn = 'arn:aws:kinesis' +
            ':' + metaDb.awsRegion +
            ':' + metaDb.awsAccountId +
            ':deliverystream/' + streamName

      var destination =
        data.ElasticsearchDestinationConfiguration ||
        data.ExtendedS3DestinationConfiguration ||
        data.RedshiftDestinationConfiguration ||
        data.S3DestinationConfiguration

      destination.DestinationId = uuid.v1()

      var now = Date.now()

      var stream = {
          CreateTimestamp: now,
          DeliveryStreamARN: arn,
          DeliveryStreamName: streamName,
          DeliveryStreamStatus: 'CREATING',
          Destinations: [destination],
          HasMoreDestinations: false,
          LastUpdatedTimestamp: now,
          VersionId: 1,
      }

      metaDb.put(streamKey, stream, function(err) {
        if (err) {
          logger.verbose('action.error', actionMeta)
          return cb(err)
        }

        setTimeout(function() {

            // Shouldn't need to lock/fetch as nothing should have changed
            stream.DeliveryStreamStatus = 'ACTIVE'

            metaDb.put(streamKey, stream, function(err) {
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
