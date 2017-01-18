var BufferingHints = require('./bufferingHints')
var CloudWatchLoggingOptions = require('./cloudWatchLoggingOptions')
var EncryptionConfiguration = require('./encryptionConfiguration')

exports.type = {
  type: 'Structure',
  children: {
    BucketARN: {
      type: 'String',
      regex: 'arn:.*',
      lengthGreaterThanOrEqual: 1,
      lengthLessThanOrEqual: 2048,
    },
    BufferingHints: BufferingHints.type,
    CloudWatchLoggingOptions: CloudWatchLoggingOptions.type,
    CompressionFormat: {
      type: 'String',
      enum: ['UNCOMPRESSED', 'GZIP', 'ZIP', 'Snappy'],
    },
    EncryptionConfiguration: EncryptionConfiguration.type,
    Prefix: {
      type: 'String',
    },
    RoleARN: {
      type: 'String',
      regex: 'arn:.*',
      lengthGreaterThanOrEqual: 1,
      lengthLessThanOrEqual: 512,
    },
  },
}
