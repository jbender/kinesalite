exports.types = {
  DeliveryStreamName: {
    type: 'String',
    notNull: true,
    regex: '[a-zA-Z0-9_.-]+',
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 64,
  },
  Records: {
    type: 'List',
    notNull: true,
    children: {
      format: 'Structure',
      children: {
        Data: {
          type: 'Blob',
          notNull: true,
          lengthLessThanOrEqual: 1024000,
        },
      },
    },
  },
}
