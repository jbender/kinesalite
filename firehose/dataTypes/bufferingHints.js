exports.type = {
  type: 'Structure',
  children: {
    IntervalInSeconds: {
      type: 'Integer',
      greaterThanOrEqual: 60,
      lessThanOrEqual: 900,
    },
    SizeInMBs: {
      type: 'Integer',
      greaterThanOrEqual: 1,
      lessThanOrEqual: 100,
    },
  },
}
