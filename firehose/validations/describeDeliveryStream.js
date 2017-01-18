exports.types = {
  DeliveryStreamName: {
    type: 'String',
    notNull: true,
    regex: '[a-zA-Z0-9_.-]+',
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 64,
  },
  ExclusiveStartDestinationId: {
    type: 'String',
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 100,
  },
  Limit: {
    type: 'Integer',
    lengthGreaterThanOrEqual: 1,
    lengthLessThanOrEqual: 10000,
  },
}
