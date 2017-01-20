var https = require('https'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    crypto = require('crypto'),
    uuid = require('node-uuid'),
    validations = require('./validations'),
    db = require('./db'),
    logger = require('./utils/logger')

var MAX_REQUEST_BYTES = 7 * 1024 * 1024

var serviceActions = {
      Kinesis_20131202: [
        'AddTagsToStream',
        'CreateStream',
        'DecreaseStreamRetentionPeriod',
        'DeleteStream',
        'DescribeStream',
        'GetRecords',
        'GetShardIterator',
        'IncreaseStreamRetentionPeriod',
        'ListStreams',
        'ListTagsForStream',
        'MergeShards',
        'PutRecord',
        'PutRecords',
        'RemoveTagsFromStream',
        'SplitShard',
      ],
      Firehose_20150804: [
        'CreateDeliveryStream',
        'DeleteDeliveryStream',
        'DescribeDeliveryStream',
        'ListDeliveryStreams',
        'PutRecord',
        'PutRecordBatch',
        'UpdateDestination',
      ],
    },
    actions = {},
    actionValidations = {}

module.exports = kinesalite

function kinesalite(options) {
  options = options || {}

  var server,
      store = db.create(options),
      serverLogger = logger.create(options),
      requestHandler = httpHandler.bind(null, serverLogger, store)

  if (options.ssl) {
    options.key = options.key || fs.readFileSync(path.join(__dirname, 'ssl', 'server-key.pem'))
    options.cert = options.cert || fs.readFileSync(path.join(__dirname, 'ssl', 'server-crt.pem'))
    options.ca = options.ca || fs.readFileSync(path.join(__dirname, 'ssl', 'ca-crt.pem'))
    server = https.createServer(options, requestHandler)
  } else {
    server = http.createServer(requestHandler)
  }

  // Ensure we close DB when we're closing the server too
  var httpServerClose = server.close, httpServerListen = server.listen
  server.close = function(cb) {
    store.db.close(function(err) {
      if (err) return cb(err)
      // Recreate the store if the user wants to listen again
      server.listen = function() {
        store.recreate()
        httpServerListen.apply(server, arguments)
      }
      httpServerClose.call(server, cb)
    })
  }

  return server
}

Object.keys(serviceActions).forEach(function(service) {
  var namespace

  if (service.startsWith('Kinesis')) {
    namespace = 'kinesis'
  } else if (service.startsWith('Firehose')) {
    namespace = 'firehose'
  }

  serviceActions[service].forEach(function(actionName) {
    var fileName = validations.toLowerFirst(actionName)
    var key = namespace + actionName

    actions[key] = require('./' + namespace + '/actions/' + fileName)
    actionValidations[key] = require('./' + namespace + '/validations/' + fileName)
  })
})

function sendRaw(req, res, body, statusCode) {
  req.removeAllListeners()
  res.statusCode = statusCode || 200
  if (body != null) res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'))
  // AWS doesn't send a 'Connection' header but seems to use keep-alive behaviour
  // res.setHeader('Connection', '')
  // res.shouldKeepAlive = false
  res.end(body)
}

function sendJson(req, res, data, statusCode) {
  var body = data != null ? JSON.stringify(data) : ''
  res.setHeader('Content-Type', res.contentType)
  sendRaw(req, res, body, statusCode)
}

function sendError(req, res, contentValid, type, msg) {
  return contentValid ? sendJson(req, res, {__type: type, message: msg}, 400) :
    typeof msg == 'number' ? sendRaw(req, res, '<' + type + '/>\n', msg) :
      sendRaw(req, res, '<' + type + '>\n  <Message>' + msg + '</Message>\n</' + type + '>\n', 403)
}

function httpHandler(logger, store, req, res) {
  var body,
      requestId = uuid.v1(),
      requestMeta = {requestId}

  logger.info('request.start', requestMeta)

  req.on('error', function(err) { logger.error(err); throw err })

  req.on('data', function(data) {
    var newLength = data.length + (body ? body.length : 0)
    if (newLength > MAX_REQUEST_BYTES) {
      res.setHeader('Transfer-Encoding', 'chunked')
      logger.verbose(requestId + ' received chunk')
      return sendRaw(req, res, null, 413)
    }
    body = body ? Buffer.concat([body, data], newLength) : data
  })

  req.on('end', function() {

    body = body ? body.toString() : ''

    // All responses after this point have a RequestId
    res.setHeader('x-amzn-RequestId', requestId)
    if (req.method != 'OPTIONS' || !req.headers.origin)
      res.setHeader('x-amz-id-2', crypto.randomBytes(72).toString('base64'))

    // FIRST check if we've got an origin header:

    if (req.headers.origin) {
      res.setHeader('Access-Control-Allow-Origin', '*')

      // If it's a valid OPTIONS call, return here
      if (req.method == 'OPTIONS') {
        if (req.headers['access-control-request-headers'])
          res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'])

        if (req.headers['access-control-request-method'])
          res.setHeader('Access-Control-Allow-Methods', req.headers['access-control-request-method'])

        res.setHeader('Access-Control-Max-Age', 172800)
        return sendRaw(req, res, '')
      }

      res.setHeader('Access-Control-Expose-Headers', ['x-amz-request-id', 'x-amz-id-2'])
    }

    var contentType = (req.headers['content-type'] || '').split(';')[0].trim()
    var contentValid = req.method == 'POST' && ~['application/x-amz-json-1.1', 'application/json'].indexOf(contentType)

    var target = (req.headers['x-amz-target'] || '').split('.')
    var service = target[0]
    var operation = target[1]

    logger.info('request.operation ' + service + ':' + operation, requestMeta)

    var serviceValid = service && serviceActions[service]
    var operationValid = operation && serviceValid && ~serviceActions[service].indexOf(operation)

    // AWS doesn't seem to care about the HTTP path, so no checking needed for that

    // THEN if the method and content-type are ok, see if the JSON parses:

    var data
    if (contentValid) {
      res.contentType = contentType

      if (body) {
        try { data = JSON.parse(body) } catch (e) { }

        if (typeof data != 'object' || data == null) {
          if (contentType == 'application/json') {
            logger.verbose('request.error com.amazon.coral.service#SerializationException', requestMeta)
            return sendJson(req, res, {
              Output: {__type: 'com.amazon.coral.service#SerializationException', Message: null},
              Version: '1.0',
            }, 200)
          }
          logger.verbose('request.error SerializationException', requestMeta)
          return sendJson(req, res, {__type: 'SerializationException'}, 400)
        }
      }

      // After this point, application/json doesn't seem to progress any further
      if (contentType == 'application/json') {
        logger.verbose('request.error com.amazon.coral.service#UnknownOperationException', requestMeta)
        return sendJson(req, res, {
          Output: {__type: 'com.amazon.coral.service#UnknownOperationException', message: null},
          Version: '1.0',
        }, 200)
      }

      if (!serviceValid || !operationValid) {
        logger.verbose('request.error UnknownOperationException', requestMeta)
        return sendJson(req, res, {__type: 'UnknownOperationException'}, 400)
      }

      if (!data) {
        logger.verbose('request.error SerializationException', requestMeta)
        return sendJson(req, res, {__type: 'SerializationException'}, 400)
      }
    }

    // THEN check auth:

    var authHeader = req.headers.authorization
    var query = ~req.url.indexOf('?') ? url.parse(req.url, true).query : {}
    var authQuery = 'X-Amz-Algorithm' in query
    var msg = '', params

    if (authHeader && authQuery) {
      logger.verbose('request.error InvalidSignatureException', requestMeta)
      return sendError(req, res, contentValid, 'InvalidSignatureException',
        'Found both \'X-Amz-Algorithm\' as a query-string param and \'Authorization\' as HTTP header.')
    }

    if (!authHeader && !authQuery) {
      logger.verbose('request.error MissingAuthenticationTokenException', requestMeta)
      return sendError(req, res, contentValid, 'MissingAuthenticationTokenException', 'Missing Authentication Token')
    }

    if (authHeader) {
      params = ['Credential', 'Signature', 'SignedHeaders']
      var authParams = authHeader.split(/,| /).slice(1).filter(Boolean).reduce(function(obj, x) {
        var keyVal = x.trim().split('=')
        obj[keyVal[0]] = keyVal[1]
        return obj
      }, {})
      params.forEach(function(param) {
        if (!authParams[param])
          msg += 'Authorization header requires \'' + param + '\' parameter. '
      })
      if (!req.headers['x-amz-date'] && !req.headers.date)
        msg += 'Authorization header requires existence of either a \'X-Amz-Date\' or a \'Date\' header. '
      if (msg) msg += 'Authorization=' + authHeader

    } else {
      params = ['X-Amz-Algorithm', 'X-Amz-Credential', 'X-Amz-Signature', 'X-Amz-SignedHeaders', 'X-Amz-Date']
      params.forEach(function(param) {
        if (!query[param])
          msg += 'AWS query-string parameters must include \'' + param + '\'. '
      })
      if (msg) msg += 'Re-examine the query-string parameters.'
    }

    if (msg) {
      logger.verbose('request.error IncompleteSignatureException', requestMeta)
      return sendError(req, res, contentValid, 'IncompleteSignatureException', msg)
    }

    // THEN if we don't have the correct method + content-type, we'll be exiting here:

    if (!contentValid) {
      if (!service || !operation) {
        logger.verbose('request.error AccessDeniedException', requestMeta)
        return sendError(req, res, false, 'AccessDeniedException',
          'Unable to determine service/operation name to be authorized')
      } else if (!serviceValid) {
        logger.verbose('request.error UnrecognizedClientException', requestMeta)
        return sendError(req, res, false, 'UnrecognizedClientException',
          'No authorization strategy was found for service: ' + service + ', operation: ' + operation)
      } else if (!operationValid) {
        logger.verbose('request.error InternalFailure', requestMeta)
        return sendError(req, res, false, 'InternalFailure', 500)
      }
      logger.verbose('request.error UnknownOperationException', requestMeta)
      return sendError(req, res, false, 'UnknownOperationException', 404)
    }

    // If we've reached here, we're good to go:

    var serviceName = service.split('_', 1)
    var serviceNamespace = serviceName ? validations.toLowerFirst(serviceName) : ''
    var action = serviceNamespace + operation

    logger.verbose('request.action ' + action, requestMeta)

    var actionValidation = actionValidations[action]
    try {
      data = validations.checkTypes(data, actionValidation.types)
      validations.checkValidations(data, actionValidation.types, actionValidation.custom, operation)
    } catch (e) {
      logger.verbose('request.validation.failed', requestMeta)
      if (e.statusCode) return sendJson(req, res, e.body, e.statusCode)
      throw e
    }

    actions[action](requestMeta, logger, store, data, function(err, data) {
      logger.verbose('request.action.complete', requestMeta)
      if (err && err.statusCode) {
        logger.verbose('request.action.error ' + err.statusCode, requestMeta)
        if (err.body)
          logger.debug('request.action.error.message ' + err.body.message, requestMeta)
        return sendJson(req, res, err.body, err.statusCode)
      }
      if (err) {
        logger.verbose('request.action.error', requestMeta)
        throw err
      }

      logger.verbose('request.finished', requestMeta)
      sendJson(req, res, data)
    })
  })
}

if (require.main === module) kinesalite().listen(4567)
