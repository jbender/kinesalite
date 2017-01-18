var dataTypes = require('../dataTypes')

exports.types = {
  DeliveryStreamName: {
    type: 'String',
    notNull: true,
    regex: '[a-zA-Z0-9_.-]+',
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 64,
  },
  ElasticsearchDestinationConfiguration: {
    type: 'Structure',
    children: {
      BufferingHints: dataTypes.BufferingHints,
      CloudWatchLoggingOptions: dataTypes.CloudWatchLoggingOptions,
      DomainARN: {
        type: 'String',
        notNull: true,
        regex: 'arn:.*',
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 512,
      },
      IndexName: {
        type: 'String',
        notNull: true,
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 80,
      },
      IndexRotationPeriod: {
        type: 'String',
        enum: ['NoRotation', 'OneHour', 'OneDay', 'OneWeek', 'OneMonth'],
      },
      ProcessingConfiguration: dataTypes.ProcessingConfiguration,
      RetryOptions: {
        type: 'Structure',
        children: {
          DurationInSeconds: {
            type: 'Integer',
            greaterThanOrEqual: 0,
            lessThanOrEqual: 7200,
          },
        },
      },
      RoleARN: {
        type: 'String',
        notNull: true,
        regex: 'arn:.*',
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 512,
      },
      S3BackupMode: {
        type: 'String',
        enum: ['FailedDocumentsOnly', 'AllDocuments'],
      },
      S3Configuration: dataTypes.S3DestinationConfiguration,
      TypeName: {
        type: 'String',
        notNull: true,
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 100,
      },
    },
  },
  ExtendedS3DestinationConfiguration: {
    // NOTE: S3DestinationConfiguration VARIENT
    type: 'Structure',
    children: {
      BucketARN: {
        type: 'String',
        notNull: true,
        regex: 'arn:.*',
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 2048,
      },
      BufferingHints: dataTypes.BufferingHints,
      CloudWatchLoggingOptions: dataTypes.CloudWatchLoggingOptions,
      CompressionFormat: {
        type: 'String',
        enum: ['UNCOMPRESSED', 'GZIP', 'ZIP', 'Snappy'],
      },
      EncryptionConfiguration: dataTypes.EncryptionConfiguration,
      Prefix: {
        type: 'String',
      },
      ProcessingConfiguration: dataTypes.ProcessingConfiguration,
      RoleARN: {
        type: 'String',
        notNull: true,
        regex: 'arn:.*',
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 512,
      },
      S3BackupConfiguration: dataTypes.S3DestinationConfiguration,
      S3BackupMode: {
        type: 'String',
        enum: ['Disabled', 'Enabled'],
      },
    },
  },
  RedshiftDestinationConfiguration: {
    type: 'Structure',
    children: {
      CloudWatchLoggingOptions: dataTypes.CloudWatchLoggingOptions,
      ClusterJDBCURL: {
        type: 'String',
        notNull: true,
        lengthGreaterThanOrEqual: 1,
        regex: 'jdbc:(redshift|postgresql)://((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+redshift\.amazonaws\.com:\d{1,5}/[a-zA-Z0-9_$]+',
      },
      CopyCommand: {
        type: 'Structure',
        notNull: true,
        children: {
          CopyOptions: {
            type: 'String',
          },
          DataTableColumns: {
            type: 'String',
          },
          DataTableName: {
            type: 'String',
            notNull: true,
            lengthGreaterThanOrEqual: 1,
          },
        },
      },
      Password: {
        type: 'String',
        notNull: true,
        lengthGreaterThanOrEqual: 6,
      },
      ProcessingConfiguration: dataTypes.ProcessingConfiguration,
      RetryOptions: {
        type: 'Structure',
        children: {
          DurationInSeconds: {
            type: 'Integer',
            greaterThanOrEqual: 0,
            lessThanOrEqual: 7200,
          },
        },
      },
      RoleARN: {
        type: 'String',
        notNull: true,
        regex: 'arn:.*',
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 512,
      },
      S3BackupConfiguration: dataTypes.S3DestinationConfiguration,
      S3BackupMode: {
        type: 'String',
        enum: ['Disabled', 'Enabled'],
      },
      S3Configuration: {
        // NOTE: S3DestinationConfiguration VARIENT
        // some compression formats removed and notNull added
        type: 'Structure',
        notNull: true,
        children: {
          BucketARN: {
            type: 'String',
            notNull: true,
            regex: 'arn:.*',
            lengthGreaterThanOrEqual: 1,
            lengthLessThanOrEqual: 2048,
          },
          BufferingHints: dataTypes.BufferingHints,
          CloudWatchLoggingOptions: dataTypes.CloudWatchLoggingOptions,
          CompressionFormat: {
            type: 'String',
            enum: ['UNCOMPRESSED', 'GZIP'],
          },
          EncryptionConfiguration: dataTypes.EncryptionConfiguration,
          Prefix: {
            type: 'String',
          },
          RoleARN: {
            type: 'String',
            notNull: true,
            regex: 'arn:.*',
            lengthGreaterThanOrEqual: 1,
            lengthLessThanOrEqual: 512,
          },
        },
      },
      Username: {
        type: 'String',
        notNull: true,
        lengthGreaterThanOrEqual: 1,
      },
    },
  },
  // Deprecated
  S3DestinationConfiguration: dataTypes.S3DestinationConfiguration,
}

exports.custom = function(data) {
  console.log(data)
  return
}
