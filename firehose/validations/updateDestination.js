var dataTypes = require('../dataTypes')

exports.types = {
  CurrentDeliveryStreamVersionId: {
    type: 'String',
    notNull: true,
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 50,
    regex: '[0-9]+',
  },
  DeliveryStreamName: {
    type: 'String',
    notNull: true,
    regex: '[a-zA-Z0-9_.-]+',
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 64,
  },
  DestinationId: {
    type: 'String',
    notNull: true,
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 100,
  },
  ElasticsearchDestinationUpdate: {
    type: 'Structure',
    children: {
      BufferingHints: dataTypes.BufferingHints,
      CloudWatchLoggingOptions: dataTypes.CloudWatchLoggingOptions,
      DomainARN: {
        type: 'String',
        regex: 'arn:.*',
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 512,
      },
      IndexName: {
        type: 'String',
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
        regex: 'arn:.*',
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 512,
      },
      S3Update: dataTypes.S3DestinationUpdate,
      TypeName: {
        type: 'String',
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 100,
      },
    },
  },
  ExtendedS3DestinationUpdate: {
    // NOTE: S3DestinationUpdate VARIENT
    type: 'Structure',
    children: {
      BucketARN: {
        type: 'String',
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
        regex: 'arn:.*',
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 512,
      },
      S3BackupMode: {
        type: 'String',
        enum: ['Disabled', 'Enabled'],
      },
      S3BackupUpdate: dataTypes.S3DestinationUpdate,
    },
  },
  RedshiftDestinationUpdate: {
    type: 'Structure',
    children: {
      CloudWatchLoggingOptions: dataTypes.CloudWatchLoggingOptions,
      ClusterJDBCURL: {
        type: 'String',
        lengthGreaterThanOrEqual: 1,
        regex: 'jdbc:(redshift|postgresql)://((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+redshift\.amazonaws\.com:\d{1,5}/[a-zA-Z0-9_$]+',
      },
      CopyCommand: {
        type: 'Structure',
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
        regex: 'arn:.*',
        lengthGreaterThanOrEqual: 1,
        lengthLessThanOrEqual: 512,
      },
      S3BackupMode: {
        type: 'String',
        enum: ['Disabled', 'Enabled'],
      },
      S3BackupUpdate: dataTypes.S3DestinationUpdate,
      S3Update: {
        // NOTE: S3DestinationUpdate VARIENT
        // some compression formats removed
        type: 'Structure',
        children: {
          BucketARN: {
            type: 'String',
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
            regex: 'arn:.*',
            lengthGreaterThanOrEqual: 1,
            lengthLessThanOrEqual: 512,
          },
        },
      },
      Username: {
        type: 'String',
        lengthGreaterThanOrEqual: 1,
      },
    },
  },
  // Deprecated
  S3DestinationUpdate: dataTypes.S3DestinationUpdate,
}
