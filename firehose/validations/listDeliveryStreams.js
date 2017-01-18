exports.types = {
  ExclusiveStartDeliveryStreamName: {
    type: 'String',
    notNull: true,
    regex: '[a-zA-Z0-9_.-]+',
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 64,
  },
  Limit: {
    type: 'Integer',
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 10000,
  },
}
