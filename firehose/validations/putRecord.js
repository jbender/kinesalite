exports.types = {
  DeliveryStreamName: {
    type: 'String',
    notNull: true,
    regex: '[a-zA-Z0-9_.-]+',
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 64,
  },
  Record: {
    type: 'Structure',
    notNull: true,
    children: {
      Data: {
        type: 'Blob',
        notNull: true,
        lengthLessThanOrEqual: 1024000,
      },
    },
  },
}
