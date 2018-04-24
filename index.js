'use strict'

module.exports = slsPromised

slsPromised.response = opts => new SlsCustomResponse(opts)

function slsPromised (handler) {
  return slsPromisedWrapper

  function slsPromisedWrapper (event, context, callback) {
    // NOTE(ajoslin): Do NOT return the promise. Lambda has limited promise support
    // and will treat it as a response.
    Promise.resolve()
      .then(() => handler(event, context))
      .then(function handleSuccess (result) {
        if (!(result instanceof SlsCustomResponse)) {
          result = new SlsCustomResponse({
            body: result
          })
        }
        callback(null, result)
      }, function handleError (result) {
        if (!(result instanceof Error)) {
          result = Object.assign(new Error(), {
            body: result || 'Interval Server Error'
          })
        }
        result.statusCode = result.statusCode || 500
        result.headers = result.headers || {
          'Content-Type': 'application/json'
        }
        if (result.message && !result.body) {
          result.body = result.message
        }
        callback(null, result)
      })
  }
}

function SlsCustomResponse (opts) {
  this.statusCode = opts.statusCode || 200
  this.headers = Object.assign({
    'Content-Type': 'application/json'
  }, opts.headers || {})
  if (opts.body && this.headers['Content-Type'] === 'application/json' && typeof opts.body !== 'string') {
    this.body = JSON.stringify(opts.body)
  } else {
    this.body = opts.body
  }
}
