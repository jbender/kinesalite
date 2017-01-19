var db = require('../../db')

module.exports = function createDeliveryStream(store, data, cb) {

  var streamName = data.DeliveryStreamName,
      metaDb = store.metaDb

  metaDb.lock(streamName, function(release) {
    cb = release(cb)

    metaDb.get(streamName, function(err) {
      if (err && err.name != 'NotFoundError') return cb(err)
      if (!err) return cb(db.clientError('ResourceInUseException',
          'DeliveryStream ' + streamName + ' under account ' + metaDb.awsAccountId + ' already exists.'))

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
        if (err) return cb(err)

        setTimeout(function() {

            // Shouldn't need to lock/fetch as nothing should have changed
            stream.DeliveryStreamStatus = 'ACTIVE'

            metaDb.put(streamName, stream, function(err) {
                if (err && !/Database is not open/.test(err))
                    console.error(err.stack || err)
            })

        }, store.createStreamMs)

        cb()
      })
    })
  })

}
