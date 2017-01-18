exports.type = {
  type: 'Structure',
  children: {
    Enabled: {
      type: 'Boolean',
    },
    Processors: {
      type: 'List',
      children: {
        type: 'Structure',
        children: {
          Parameters: {
            type: 'Structure',
            children: {
              ParameterName: {
                type: 'String',
                notNull: true,
                enum: ['LambdaArn', 'NumberOfRetries'],
              },
              ParameterValue: {
                type: 'String',
                notNull: true,
                lengthGreaterThanOrEqual: 1,
                lengthLessThanOrEqual: 512,
              },
            },
          },
          Type: {
            type: 'String',
            notNull: true,
            enum: ['Lambda'],
          },
        },
      },
    },
  },
}
