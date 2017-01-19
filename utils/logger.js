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
          return 'kinesalite' +
            (options.meta && options.meta.process ? ':' + options.meta.process : '') +
            ' ' +
            (options.message ? options.message : '')
        },
      }),
    ],
  })

  logger.level = options.logLevel || 'info'

  return logger
}
