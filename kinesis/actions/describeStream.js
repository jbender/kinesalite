
module.exports = function describeStream(requestMeta, logger, store, data, cb) {

  var streamName = data.StreamName,
      streamKey = store.streamKey({name: streamName, type: 'stream'})

  store.getStream(streamKey, function(err, stream) {
    logger.info('err:' + err)
    logger.info('stream:' + stream)
    if (err) return cb(err)

    delete stream._seqIx
    delete stream._tags

    cb(null, {StreamDescription: stream})
  })
}
