exports.type = {
  type: 'Structure',
  children: {
    KMSEncryptionConfig: {
      type: 'Structure',
      children: {
        AWSKMSKeyARN: {
          type: 'String',
          notNull: true,
          regex: 'arn:.*',
          lengthGreaterThanOrEqual: 1,
          lengthLessThanOrEqual: 512,
        },
      },
    },
    NoEncryptionConfig: {
      type: 'String',
      enum: ['NoEncryption'],
    },
  },
}
