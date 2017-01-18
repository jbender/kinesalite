module.exports = {
  BufferingHints: require('./bufferingHints').type,
  CloudWatchLoggingOptions: require('./cloudWatchLoggingOptions').type,
  EncryptionConfiguration: require('./encryptionConfiguration').type,
  ProcessingConfiguration: require('./processingConfiguration').type,
  S3DestinationConfiguration: require('./s3DestinationConfiguration').type,
  S3DestinationUpdate: require('./s3DestinationUpdate').type,
}
