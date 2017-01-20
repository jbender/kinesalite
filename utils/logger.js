var winston = require('winston')

exports.create = function(options) {
  options = options || {}

  var logger = new (winston.Logger)({
    colors: winston.config.syslog.colors,
    transports: [
      new (winston.transports.Console)({
        colorize: true,
        formatter: function(options) {
          // Return string will be passed to logger.
          return '[' + (new Date()).toISOString() + ']: ' +
            'kinesalite' +
            (options.meta && options.meta.process ? ':' + options.meta.process : '') +
            ' ' +
            (options.message ? options.message : '') +
            (options.meta.action ? ' action:' + options.meta.action : '') +
            (options.meta && options.meta.requestId ? ' requestId:' + options.meta.requestId : '')
        },
      }),
    ],
  })

  logger.level = options.logLevel || 'info'

  return logger
}
