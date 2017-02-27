var BigNumber = require('bignumber.js'),
    db = require('../../db')

module.exports = function putRecord(requestMeta, logger, store, data, cb) {

  var streamName = data.StreamName,
      metaDb = store.metaDb,
      streamKey = store.streamKey({name: streamName, type: 'stream'}),
      streamDb = store.getStreamDb(streamKey)

  metaDb.lock(streamKey, function(release) {
    cb = release(cb)

    store.getStream(streamName, function(err, stream) {
      if (err) return cb(err)

      if (!~['ACTIVE', 'UPDATING'].indexOf(stream.StreamStatus)) {
        return cb(db.clientError('ResourceNotFoundException',
          'Stream ' + streamName + ' under account ' + metaDb.awsAccountId + ' not found.'))
      }

      var hashKey, shardIx, shardId, shardCreateTime

      if (data.ExplicitHashKey != null) {
        hashKey = new BigNumber(data.ExplicitHashKey)

        if (hashKey.cmp(0) < 0 || hashKey.cmp(new BigNumber(2).pow(128)) >= 0) {
          return cb(db.clientError('InvalidArgumentException',
            'Invalid ExplicitHashKey. ExplicitHashKey must be in the range: [0, 2^128-1]. ' +
            'Specified value was ' + data.ExplicitHashKey))
        }
      } else {
        hashKey = db.partitionKeyToHashKey(data.PartitionKey)
      }

      if (data.SequenceNumberForOrdering != null) {
        try {
          var seqObj = db.parseSequence(data.SequenceNumberForOrdering)
          if (seqObj.seqTime > Date.now()) throw new Error('Sequence time in the future')
        } catch (e) {
          return cb(e.message == 'Unknown version: 3' ? db.serverError() : db.clientError('InvalidArgumentException',
              'ExclusiveMinimumSequenceNumber ' + data.SequenceNumberForOrdering + ' used in PutRecord on stream ' +
              streamName + ' under account ' + metaDb.awsAccountId + ' is invalid.'))
        }
      }

      for (var i = 0; i < stream.Shards.length; i++) {
        if (stream.Shards[i].SequenceNumberRange.EndingSequenceNumber == null &&
            hashKey.cmp(stream.Shards[i].HashKeyRange.StartingHashKey) >= 0 &&
            hashKey.cmp(stream.Shards[i].HashKeyRange.EndingHashKey) <= 0) {
          shardIx = i
          shardId = stream.Shards[i].ShardId
          shardCreateTime = db.parseSequence(
            stream.Shards[i].SequenceNumberRange.StartingSequenceNumber).shardCreateTime
          break
        }
      }

      var seqIxIx = Math.floor(shardIx / 5), now = Math.max(Date.now(), shardCreateTime)

      // Ensure that the first record will always be above the stream start sequence
      if (!stream._seqIx[seqIxIx])
        stream._seqIx[seqIxIx] = shardCreateTime == now ? 1 : 0

      var seqNum = db.stringifySequence({
        shardCreateTime: shardCreateTime,
        shardIx: shardIx,
        seqIx: stream._seqIx[seqIxIx],
        seqTime: now,
      })

      var streamKey = db.shardIxToHex(shardIx) + '/' + seqNum

      stream._seqIx[seqIxIx]++

      metaDb.put(streamKey, stream, function(err) {
        if (err) return cb(err)

        var record = {
          PartitionKey: data.PartitionKey,
          Data: data.Data,
          ApproximateArrivalTimestamp: now / 1000,
        }

        streamDb.put(streamKey, record, function(err) {
          if (err) return cb(err)
          cb(null, {ShardId: shardId, SequenceNumber: seqNum})
        })
      })
    })
  })
}
